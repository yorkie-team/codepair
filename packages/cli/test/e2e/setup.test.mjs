import assert from "node:assert/strict";
import {
	chmodSync,
	copyFileSync,
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
	createCodePairRoot,
	createFakeToolchain,
	existingProject,
	parseSingleJson,
	REPOSITORY_ROOT,
	runCli,
	temporaryDirectory,
	writeEnvFiles,
} from "./helpers/cli-harness.mjs";

const DEFAULT_WEBHOOK = "http://host.docker.internal:3000/yorkie/document-events";

function setupArguments(root, extra = []) {
	return ["setup", "yorkie", "--root", root, "--yes", "--json", ...extra];
}

function invocationCommands(fake) {
	return fake
		.readInvocations()
		.filter(({ tool }) => tool === "yorkie")
		.map(({ args }) => args.slice(0, 3).join(" "));
}

test("setup reuses an existing configured project and writes both env files", (t) => {
	const root = createCodePairRoot(t, "existing project");
	const project = existingProject();
	const fake = createFakeToolchain(t, { projects: [project] });

	const result = runCli(setupArguments(root), { env: fake.env });
	assert.equal(result.status, 0, result.stderr);
	const output = parseSingleJson(result);
	assert.deepEqual(
		{
			command: output.command,
			ok: output.ok,
			exitCode: output.exitCode,
			root: output.root,
			dryRun: output.dryRun,
			changed: output.changed,
		},
		{
			command: "setup yorkie",
			ok: true,
			exitCode: 0,
			root,
			dryRun: false,
			changed: true,
		}
	);
	const backend = readFileSync(join(root, "packages", "backend", ".env.development"), "utf8");
	const frontend = readFileSync(join(root, "packages", "frontend", ".env.development"), "utf8");
	assert.match(backend, new RegExp(`YORKIE_PROJECT_SECRET_KEY="${project.secret_key}"`));
	assert.match(backend, /YORKIE_API_ADDR="http:\/\/localhost:8080"/);
	assert.doesNotMatch(backend, /test_github_client_id|test_github_client_secret/);
	assert.match(frontend, new RegExp(`VITE_YORKIE_API_KEY="${project.public_key}"`));
	assert.match(frontend, /VITE_YORKIE_API_ADDR="http:\/\/localhost:8080"/);
	assert.equal(output.actions.find(({ id }) => id === "yorkie.project")?.status, "unchanged");
	assert.equal(output.actions.find(({ id }) => id === "yorkie.webhook")?.status, "unchanged");
	assert.ok(!invocationCommands(fake).some((command) => command === "project create codepair"));
	assert.ok(!invocationCommands(fake).some((command) => command === "project update codepair"));
});

test("setup creates and configures a missing Yorkie project", (t) => {
	const root = createCodePairRoot(t, "missing project");
	const fake = createFakeToolchain(t, {
		projects: [],
		publicKey: "pk_created_public",
		secretKey: "sk_created_secret",
	});

	const result = runCli(setupArguments(root), { env: fake.env });
	assert.equal(result.status, 0, result.stderr);
	const output = parseSingleJson(result);
	const state = fake.readState();
	assert.equal(state.projects.length, 1);
	assert.deepEqual(
		{
			name: state.projects[0].name,
			url: state.projects[0].event_webhook_url,
			events: state.projects[0].event_webhook_events,
		},
		{
			name: "codepair",
			url: DEFAULT_WEBHOOK,
			events: ["DocumentRootChanged"],
		}
	);
	assert.equal(output.actions.find(({ id }) => id === "yorkie.project")?.status, "changed");
	assert.equal(output.actions.find(({ id }) => id === "yorkie.webhook")?.status, "changed");
	assert.match(
		readFileSync(join(root, "packages", "backend", ".env.development"), "utf8"),
		/YORKIE_PROJECT_SECRET_KEY="sk_created_secret"/
	);
	assert.match(
		readFileSync(join(root, "packages", "frontend", ".env.development"), "utf8"),
		/VITE_YORKIE_API_KEY="pk_created_public"/
	);
});

test("missing development env files are seeded from each package example", (t) => {
	const root = createCodePairRoot(t, "env examples");
	const project = existingProject();
	const fake = createFakeToolchain(t, { projects: [project] });
	copyFileSync(
		join(REPOSITORY_ROOT, "packages", "backend", ".env.example"),
		join(root, "packages", "backend", ".env.example")
	);
	copyFileSync(
		join(REPOSITORY_ROOT, "packages", "frontend", ".env.example"),
		join(root, "packages", "frontend", ".env.example")
	);

	const result = runCli(setupArguments(root), { env: fake.env });
	assert.equal(result.status, 0, result.stderr);
	const backend = readFileSync(join(root, "packages", "backend", ".env.development"), "utf8");
	const frontend = readFileSync(join(root, "packages", "frontend", ".env.development"), "utf8");
	assert.match(backend, /DATABASE_URL=mongodb:\/\/localhost:27017\/codepair/);
	assert.match(backend, /^GITHUB_CLIENT_ID=$/m);
	assert.match(backend, /^OPENAI_API_KEY=$/m);
	assert.match(backend, /YORKIE_PROJECT_SECRET_KEY="sk_existing_secret"/);
	assert.match(frontend, /^VITE_API_ADDR=http:\/\/localhost:3000$/m);
	assert.match(frontend, /VITE_YORKIE_API_KEY="pk_existing_public"/);
});

test("setup is idempotent after the first successful run", (t) => {
	const root = createCodePairRoot(t, "idempotent");
	const fake = createFakeToolchain(t, { projects: [] });
	const args = setupArguments(root);

	const first = runCli(args, { env: fake.env });
	assert.equal(first.status, 0, first.stderr);
	assert.equal(parseSingleJson(first).changed, true);
	const backendPath = join(root, "packages", "backend", ".env.development");
	const frontendPath = join(root, "packages", "frontend", ".env.development");
	const firstBackend = readFileSync(backendPath, "utf8");
	const firstFrontend = readFileSync(frontendPath, "utf8");

	const second = runCli(args, { env: fake.env });
	assert.equal(second.status, 0, second.stderr);
	const output = parseSingleJson(second);
	assert.equal(output.changed, false);
	assert.equal(readFileSync(backendPath, "utf8"), firstBackend);
	assert.equal(readFileSync(frontendPath, "utf8"), firstFrontend);
	assert.equal((firstBackend.match(/^YORKIE_PROJECT_SECRET_KEY=/gm) || []).length, 1);
	assert.equal((firstFrontend.match(/^VITE_YORKIE_API_KEY=/gm) || []).length, 1);
	assert.equal(fake.readState().projects.length, 1);
	assert.ok(
		output.actions
			.filter(({ id }) => id !== "verify")
			.every(({ status }) => status === "unchanged")
	);
});

test("setup reuses a consistent Yorkie address from existing env files", (t) => {
	const root = createCodePairRoot(t, "existing Yorkie address");
	const project = existingProject();
	const fake = createFakeToolchain(t, { projects: [project] });
	const paths = writeEnvFiles(
		root,
		"UNRELATED=keep\nYORKIE_API_ADDR=https://yorkie.example.test\n",
		"VITE_YORKIE_API_ADDR=https://yorkie.example.test\n"
	);

	const result = runCli(setupArguments(root), { env: fake.env });
	assert.equal(result.status, 0, result.stderr);
	assert.match(readFileSync(paths.backendPath, "utf8"), /UNRELATED=keep\n/);
	assert.match(
		readFileSync(paths.backendPath, "utf8"),
		/YORKIE_API_ADDR="https:\/\/yorkie\.example\.test:443"/
	);
	const login = fake.readInvocations().find(({ args }) => args[0] === "login");
	assert.equal(login.args[login.args.indexOf("--rpc-addr") + 1], "yorkie.example.test:443");
	assert.ok(!login.args.includes("--insecure"));
});

test("setup refuses conflicting existing Yorkie addresses without an explicit selection", (t) => {
	const root = createCodePairRoot(t, "conflicting Yorkie addresses");
	const fake = createFakeToolchain(t, { projects: [existingProject()] });
	writeEnvFiles(
		root,
		"YORKIE_API_ADDR=http://localhost:8080\n",
		"VITE_YORKIE_API_ADDR=http://localhost:9090\n"
	);

	const result = runCli(setupArguments(root), { env: fake.env });
	assert.equal(result.status, 2);
	assert.equal(parseSingleJson(result).error.code, "CONFLICTING_YORKIE_ADDRESSES");
	assert.deepEqual(fake.readInvocations(), []);
});

test("doctor can verify setup with custom project, webhook, RPC, and env paths", (t) => {
	const root = createCodePairRoot(t, "custom setup doctor");
	const fake = createFakeToolchain(t, { projects: [] });
	const projectName = "codepair-custom";
	const webhookUrl = "http://host.docker.internal:3000/custom-yorkie-events";
	const backendEnv = "config/backend.env";
	const frontendEnv = "config/frontend.env";

	const setup = runCli(
		setupArguments(root, [
			"--rpc-addr",
			"localhost:9090",
			"--project",
			projectName,
			"--webhook-url",
			webhookUrl,
			"--backend-env",
			backendEnv,
			"--frontend-env",
			frontendEnv,
		]),
		{ env: fake.env }
	);
	assert.equal(setup.status, 0, setup.stderr);

	const doctor = runCli(
		[
			"doctor",
			"--root",
			root,
			"--scope",
			"yorkie",
			"--project",
			projectName,
			"--webhook-url",
			webhookUrl,
			"--backend-env",
			backendEnv,
			"--frontend-env",
			frontendEnv,
			"--json",
		],
		{ env: fake.env }
	);
	assert.equal(doctor.status, 0, doctor.stderr);
	assert.deepEqual(parseSingleJson(doctor).summary, {
		pass: 5,
		warn: 0,
		fail: 0,
		skip: 0,
	});

	const projectListCalls = fake
		.readInvocations()
		.filter(({ args }) => args[0] === "project" && args[1] === "ls");
	assert.ok(projectListCalls.length >= 3);
	for (const { args } of projectListCalls) {
		assert.equal(args[args.indexOf("--rpc-addr") + 1], "localhost:9090");
	}
});

test("non-TTY setup requires explicit confirmation and --yes bypasses it", (t) => {
	const root = createCodePairRoot(t, "confirmation");
	const fake = createFakeToolchain(t, { projects: [existingProject()] });

	const refused = runCli(["setup", "yorkie", "--root", root, "--json"], {
		env: fake.env,
	});
	assert.equal(refused.status, 2);
	const refusedOutput = parseSingleJson(refused);
	assert.equal(refusedOutput.error.code, "CONFIRMATION_REQUIRED");
	assert.equal(existsSync(join(root, "packages", "backend", ".env.development")), false);
	assert.ok(
		fake
			.readInvocations()
			.filter(({ tool }) => tool === "yorkie")
			.every(({ args }) => args[0] === "--help")
	);

	const accepted = runCli(setupArguments(root), { env: fake.env });
	assert.equal(accepted.status, 0, accepted.stderr);
	assert.equal(parseSingleJson(accepted).ok, true);
});

test("dry-run reports a plan without prompting or mutating state", (t) => {
	const root = createCodePairRoot(t, "dry run");
	const fake = createFakeToolchain(t, { projects: [] });
	const result = runCli(["setup", "yorkie", "--root", root, "--dry-run", "--json"], {
		env: fake.env,
	});

	assert.equal(result.status, 0, result.stderr);
	const output = parseSingleJson(result);
	assert.equal(output.dryRun, true);
	assert.equal(output.changed, true);
	assert.ok(output.actions.every(({ status }) => status === "planned"));
	assert.deepEqual(fake.readState(), { projects: [] });
	assert.equal(existsSync(join(root, "packages", "backend", ".env.development")), false);
	assert.ok(
		invocationCommands(fake).every((command) => command === "--help"),
		"dry-run executed a mutating Yorkie command"
	);
});

test("password stdin and command failures never expose secrets", (t) => {
	const root = createCodePairRoot(t, "secret redaction");
	const fake = createFakeToolchain(t, { projects: [existingProject()] });
	const password = "uniquely-sensitive-password-48319";
	const result = runCli(setupArguments(root, ["--password-stdin"]), {
		env: {
			...fake.env,
			FAKE_YORKIE_MODE: "fail",
			FAKE_YORKIE_FAIL_ON: "login",
			FAKE_YORKIE_FAILURE_TEXT: `authentication failed for ${password}\n`,
		},
		input: `${password}\n`,
	});

	assert.equal(result.status, 1);
	const output = parseSingleJson(result);
	assert.equal(output.error.code, "COMMAND_FAILED");
	assert.match(output.error.message, /\[REDACTED\]/);
	assert.doesNotMatch(result.stdout, new RegExp(password));
	assert.doesNotMatch(result.stderr, new RegExp(password));
	assert.doesNotMatch(JSON.stringify(fake.readInvocations()), new RegExp(password));
	const login = fake.readInvocations().find(({ args }) => args[0] === "login");
	assert.equal(login.args[login.args.indexOf("-p") + 1], "[SECRET]");
	assert.equal(existsSync(join(root, "packages", "backend", ".env.development")), false);
});

test("Yorkie failures and malformed JSON preserve existing env files", async (t) => {
	for (const scenario of [
		{
			label: "login failure",
			env: {
				FAKE_YORKIE_MODE: "fail",
				FAKE_YORKIE_FAIL_ON: "login",
			},
			expectedCode: "COMMAND_FAILED",
		},
		{
			label: "malformed json",
			env: { FAKE_YORKIE_MODE: "malformed-json" },
			expectedCode: "INVALID_YORKIE_PROJECT_JSON",
		},
	]) {
		await t.test(scenario.label, (subtest) => {
			const root = createCodePairRoot(subtest, scenario.label);
			const fake = createFakeToolchain(subtest, {
				projects: [existingProject()],
			});
			const backend = "# keep backend\nUNCHANGED=backend\n";
			const frontend = "# keep frontend\nUNCHANGED=frontend\n";
			const paths = writeEnvFiles(root, backend, frontend);

			const result = runCli(setupArguments(root), {
				env: { ...fake.env, ...scenario.env },
			});
			assert.equal(result.status, 1);
			const output = parseSingleJson(result);
			assert.equal(output.error.code, scenario.expectedCode);
			assert.equal(readFileSync(paths.backendPath, "utf8"), backend);
			assert.equal(readFileSync(paths.frontendPath, "utf8"), frontend);
		});
	}
});

test("env updates are atomic, preserve content style, deduplicate keys, and stay private", (t) => {
	const root = createCodePairRoot(t, "atomic env");
	const project = existingProject();
	const fake = createFakeToolchain(t, { projects: [project] });
	const paths = writeEnvFiles(
		root,
		"# backend comment\r\nUNRELATED=keep-me\r\nOPENAI_API_KEY=keep-existing\r\nYORKIE_API_ADDR=https://old.example.test\r\nYORKIE_PROJECT_SECRET_KEY=old\r\nYORKIE_PROJECT_SECRET_KEY=duplicate\r\n",
		"# frontend comment\r\nOTHER=preserved\r\nVITE_YORKIE_API_ADDR=https://old.example.test\r\nVITE_YORKIE_API_KEY=old\r\n"
	);
	if (process.platform !== "win32") {
		chmodSync(paths.backendPath, 0o600);
		chmodSync(paths.frontendPath, 0o600);
	}

	const result = runCli(setupArguments(root, ["--rpc-addr", "localhost:8080"]), {
		env: fake.env,
	});
	assert.equal(result.status, 0, result.stderr);
	const backend = readFileSync(paths.backendPath, "utf8");
	const frontend = readFileSync(paths.frontendPath, "utf8");
	assert.match(backend, /# backend comment\r\nUNRELATED=keep-me\r\n/);
	assert.match(backend, /OPENAI_API_KEY=keep-existing\r\n/);
	assert.match(frontend, /# frontend comment\r\nOTHER=preserved\r\n/);
	assert.equal((backend.match(/^YORKIE_PROJECT_SECRET_KEY=/gm) || []).length, 1);
	assert.equal((frontend.match(/^VITE_YORKIE_API_KEY=/gm) || []).length, 1);
	assert.match(backend, new RegExp(`YORKIE_PROJECT_SECRET_KEY="${project.secret_key}"\\r\\n`));
	assert.match(frontend, new RegExp(`VITE_YORKIE_API_KEY="${project.public_key}"\\r\\n`));
	assert.match(backend, /YORKIE_API_ADDR="http:\/\/localhost:8080"\r\n/);
	assert.match(frontend, /VITE_YORKIE_API_ADDR="http:\/\/localhost:8080"\r\n/);
	assert.ok(!backend.replaceAll("\r\n", "").includes("\n"));
	assert.ok(!frontend.replaceAll("\r\n", "").includes("\n"));
	if (process.platform !== "win32") {
		assert.equal(statSync(paths.backendPath).mode & 0o777, 0o600);
		assert.equal(statSync(paths.frontendPath).mode & 0o777, 0o600);
	}
	for (const directory of [
		join(root, "packages", "backend"),
		join(root, "packages", "frontend"),
	]) {
		assert.ok(!readdirSync(directory).some((name) => name.endsWith(".tmp")));
	}
});

test("user-controlled project names are passed as argv and cannot invoke a shell", (t) => {
	const root = createCodePairRoot(t, "shell injection");
	const fake = createFakeToolchain(t, { projects: [] });
	const markerDirectory = temporaryDirectory(t, "injection marker");
	const marker = join(markerDirectory, "must-not-exist");
	const projectName =
		process.platform === "win32"
			? `project & echo owned > ${marker}`
			: `project; touch ${marker}`;

	const result = runCli(setupArguments(root, ["--project", projectName]), {
		env: fake.env,
	});
	assert.equal(result.status, 0, result.stderr);
	assert.equal(existsSync(marker), false, "a project name was interpreted by a shell");
	assert.equal(fake.readState().projects[0].name, projectName);
	const create = fake
		.readInvocations()
		.find(({ args }) => args[0] === "project" && args[1] === "create");
	assert.equal(create.args[2], projectName);
});

test("insecure remote Yorkie addresses require an explicit override", (t) => {
	const root = createCodePairRoot(t, "transport safety");
	const fake = createFakeToolchain(t, { projects: [existingProject()] });
	const remote = "yorkie.example.test:8080";

	const refused = runCli(setupArguments(root, ["--rpc-addr", remote]), {
		env: fake.env,
	});
	assert.equal(refused.status, 2);
	assert.equal(parseSingleJson(refused).error.code, "INSECURE_REMOTE_REFUSED");
	assert.deepEqual(fake.readInvocations(), []);

	const allowed = runCli(
		setupArguments(root, ["--rpc-addr", remote, "--allow-insecure-remote"]),
		{ env: fake.env }
	);
	assert.equal(allowed.status, 0, allowed.stderr);
	assert.equal(parseSingleJson(allowed).ok, true);
	const insecureLogin = fake.readInvocations().find(({ args }) => args[0] === "login");
	assert.ok(insecureLogin.args.includes("--insecure"));

	const secureRoot = createCodePairRoot(t, "secure transport");
	const secureFake = createFakeToolchain(t, { projects: [existingProject()] });
	const secure = runCli(setupArguments(secureRoot, ["--rpc-addr", remote, "--secure"]), {
		env: secureFake.env,
	});
	assert.equal(secure.status, 0, secure.stderr);
	const secureLogin = secureFake.readInvocations().find(({ args }) => args[0] === "login");
	assert.ok(!secureLogin.args.includes("--insecure"));
});
