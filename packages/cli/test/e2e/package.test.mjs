import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
	CLI_DIRECTORY,
	REPOSITORY_ROOT,
	createFakeToolchain,
	executableShimPath,
	existingProject,
	readCliPackage,
	runExecutable,
	temporaryDirectory,
} from "./helpers/cli-harness.mjs";
import { sanitizedEnvironment } from "../helpers/environment.mjs";

test("root scripts expose the CLI and preserve the setup:webhook alias", () => {
	const rootPackage = JSON.parse(readFileSync(join(REPOSITORY_ROOT, "package.json"), "utf8"));
	assert.equal(rootPackage.scripts.cli, "pnpm --filter=@codepair/cli dev");
	assert.equal(rootPackage.scripts["setup:webhook"], "node scripts/setup-yorkie-webhook.js");
});

test("the legacy setup script delegates to the CLI", (t) => {
	const environmentDirectory = temporaryDirectory(t, "legacy setup env");
	const backendEnv = join(environmentDirectory, "backend.env");
	const frontendEnv = join(environmentDirectory, "frontend.env");
	const project = existingProject();
	const fake = createFakeToolchain(t, {
		projects: [project],
		tools: ["yorkie"],
	});

	run(process.execPath, [join(REPOSITORY_ROOT, "scripts", "setup-yorkie-webhook.js")], {
		cwd: REPOSITORY_ROOT,
		env: {
			...fake.env,
			BACKEND_ENV_FILE: backendEnv,
			FRONTEND_ENV_FILE: frontendEnv,
			YORKIE_API_ADDR: "legacy-yorkie.example.test:8080",
		},
	});

	assert.match(
		readFileSync(backendEnv, "utf8"),
		new RegExp(`YORKIE_PROJECT_SECRET_KEY="${project.secret_key}"`)
	);
	assert.match(
		readFileSync(frontendEnv, "utf8"),
		new RegExp(`VITE_YORKIE_API_KEY="${project.public_key}"`)
	);
	assert.doesNotMatch(
		readFileSync(backendEnv, "utf8"),
		/YORKIE_API_ADDR|DATABASE_URL|GITHUB_CLIENT_ID/
	);
	assert.doesNotMatch(readFileSync(frontendEnv, "utf8"), /VITE_YORKIE_API_ADDR|VITE_API_ADDR/);
	assert.equal(
		fake.readState().projects[0].event_webhook_url,
		"http://localhost:3000/yorkie/document-events"
	);
	const login = fake.readInvocations().find(({ args }) => args[0] === "login");
	assert.ok(login.args.includes("--insecure"));
});

test("the legacy setup script preserves file addresses and its localhost default", (t) => {
	const environmentDirectory = temporaryDirectory(t, "legacy setup addresses");
	const backendEnv = join(environmentDirectory, "backend.env");
	const frontendEnv = join(environmentDirectory, "frontend.env");
	writeFileSync(backendEnv, "YORKIE_API_ADDR=http://backend.example.test:8080\nKEEP=backend\n");
	writeFileSync(
		frontendEnv,
		"VITE_YORKIE_API_ADDR=http://frontend.example.test:9090\nKEEP=frontend\n"
	);
	const fake = createFakeToolchain(t, {
		projects: [existingProject()],
		tools: ["yorkie"],
	});

	run(process.execPath, [join(REPOSITORY_ROOT, "scripts", "setup-yorkie-webhook.js")], {
		cwd: REPOSITORY_ROOT,
		env: {
			...fake.env,
			BACKEND_ENV_FILE: backendEnv,
			FRONTEND_ENV_FILE: frontendEnv,
		},
	});

	assert.match(readFileSync(backendEnv, "utf8"), /YORKIE_API_ADDR=http:\/\/backend\.example/);
	assert.match(
		readFileSync(frontendEnv, "utf8"),
		/VITE_YORKIE_API_ADDR=http:\/\/frontend\.example/
	);
	const login = fake.readInvocations().find(({ args }) => args[0] === "login");
	assert.equal(login.args[login.args.indexOf("--rpc-addr") + 1], "localhost:8080");
});

function run(command, args, options = {}) {
	const useWindowsCommandShell = process.platform === "win32" && command === "npm";
	const spawnedCommand = useWindowsCommandShell ? process.env.ComSpec || "cmd.exe" : command;
	const spawnedArgs = useWindowsCommandShell ? ["/d", "/s", "/c", command, ...args] : args;
	const result = spawnSync(spawnedCommand, spawnedArgs, {
		cwd: options.cwd || CLI_DIRECTORY,
		env: sanitizedEnvironment(options.env),
		encoding: "utf8",
		timeout: 120_000,
		windowsHide: true,
	});
	if (result.error) throw result.error;
	assert.equal(
		result.status,
		0,
		`${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
	);
	return result;
}

function collectFiles(root, relativeDirectory = "") {
	const paths = [];
	for (const entry of readdirSync(join(root, relativeDirectory), { withFileTypes: true })) {
		const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
		if (entry.isDirectory()) paths.push(...collectFiles(root, relativePath));
		else paths.push(relativePath);
	}
	return paths;
}

test("the npm tarball contains the built binary and installs as codepair", (t) => {
	const packDirectory = temporaryDirectory(t, "pack output");
	const installDirectory = temporaryDirectory(t, "pack install");
	rmSync(join(CLI_DIRECTORY, "dist"), { recursive: true, force: true });
	run("npm", ["pack", "--pack-destination", packDirectory]);
	const artifacts = readdirSync(packDirectory).filter((name) => name.endsWith(".tgz"));
	assert.equal(artifacts.length, 1);
	const artifact = join(packDirectory, artifacts[0]);
	assert.ok(existsSync(artifact), `missing packed artifact ${artifact}`);

	run(
		"npm",
		[
			"install",
			"--offline",
			"--ignore-scripts",
			"--no-audit",
			"--no-fund",
			"--prefix",
			installDirectory,
			artifact,
		],
		{ cwd: installDirectory }
	);

	const installedPackageDirectory = join(installDirectory, "node_modules", "@codepair", "cli");
	const packageJsonPath = join(installedPackageDirectory, "package.json");
	const installed = JSON.parse(readFileSync(packageJsonPath, "utf8"));
	const expected = readCliPackage();
	assert.equal(installed.name, "@codepair/cli");
	assert.equal(installed.version, expected.version);
	assert.equal(installed.bin.codepair, "dist/cli.js");
	const paths = new Set(collectFiles(installedPackageDirectory));
	for (const expectedPath of ["package.json", "LICENSE", "README.md", "dist/cli.js"]) {
		assert.ok(paths.has(expectedPath), `missing packaged file ${expectedPath}`);
	}
	assert.ok(!paths.has("dist/index.js"));
	assert.ok(![...paths].some((path) => path.endsWith(".d.ts")));
	assert.ok(![...paths].some((path) => path.startsWith("src/")));
	assert.ok(![...paths].some((path) => path.startsWith("test/")));

	const executable = executableShimPath(installDirectory);
	assert.ok(existsSync(executable), `missing installed executable ${executable}`);
	const version = runExecutable(executable, ["--version"]);
	assert.equal(version.status, 0, version.stderr);
	assert.equal(version.stderr, "");
	assert.equal(version.stdout.trim(), expected.version);
	const help = runExecutable(executable, ["--help"]);
	assert.equal(help.status, 0, help.stderr);
	assert.match(help.stdout, /Usage:\s+codepair/);

	const deepImport = spawnSync(
		process.execPath,
		["--input-type=module", "--eval", "import('@codepair/cli/dist/core/url.js')"],
		{
			cwd: installDirectory,
			env: sanitizedEnvironment(),
			encoding: "utf8",
			windowsHide: true,
		}
	);
	assert.notEqual(deepImport.status, 0);
	assert.match(deepImport.stderr, /ERR_PACKAGE_PATH_NOT_EXPORTED/);
});
