import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	copyFileSync,
	existsSync,
	linkSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizedEnvironment } from "../../helpers/environment.mjs";

const E2E_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEST_DIRECTORY = resolve(E2E_DIRECTORY, "..");
export const CLI_DIRECTORY = resolve(TEST_DIRECTORY, "..");
export const REPOSITORY_ROOT = resolve(CLI_DIRECTORY, "..", "..");
export const FAKE_TOOL_BOOTSTRAP = resolve(E2E_DIRECTORY, "fixtures", "fake-tool-bootstrap.cjs");

export function readCliPackage() {
	return JSON.parse(readFileSync(resolve(CLI_DIRECTORY, "package.json"), "utf8"));
}

export function builtCliPath() {
	const packageJson = readCliPackage();
	const configuredBin = packageJson.bin;
	const relativePath =
		typeof configuredBin === "string"
			? configuredBin
			: configuredBin?.codepair || Object.values(configuredBin || {})[0];
	assert.equal(typeof relativePath, "string", "package.json must expose a codepair bin");
	const absolutePath = resolve(CLI_DIRECTORY, relativePath);
	assert.ok(
		existsSync(absolutePath),
		`built CLI not found at ${absolutePath}; run the package build before tests`
	);
	return absolutePath;
}

export function temporaryDirectory(test, label = "workspace") {
	const root = mkdtempSync(join(tmpdir(), `codepair-cli-${label}-`));
	test.after(() => rmSync(root, { recursive: true, force: true }));
	return root;
}

export function createCodePairRoot(test, label = "project") {
	const parent = temporaryDirectory(test, label);
	const root = join(parent, "code pair 한글");
	mkdirSync(join(root, "packages", "backend"), { recursive: true });
	mkdirSync(join(root, "packages", "frontend"), { recursive: true });
	writeFileSync(
		join(root, "package.json"),
		`${JSON.stringify({ name: "codepair", private: true }, null, 2)}\n`,
		"utf8"
	);
	writeFileSync(join(root, "pnpm-workspace.yaml"), 'packages:\n  - "packages/*"\n', "utf8");
	return realpathSync(root);
}

function installWindowsFakeExecutable(binDirectory, tool, options) {
	if (tool === "pnpm") {
		writeFileSync(
			join(binDirectory, "pnpm.cmd"),
			`@echo off\r\necho ${options.pnpmVersion || "9.4.0"}\r\n`,
			"utf8"
		);
		return;
	}
	const destination = join(binDirectory, `${tool}.exe`);
	try {
		linkSync(process.execPath, destination);
	} catch {
		copyFileSync(process.execPath, destination);
	}
}

function installPosixFakeExecutable(binDirectory, tool) {
	const destination = join(binDirectory, tool);
	const bootstrap = JSON.stringify(FAKE_TOOL_BOOTSTRAP);
	writeFileSync(
		destination,
		`#!/usr/bin/env node\nrequire(${bootstrap}).runFakeTool(${JSON.stringify(tool)}, process.argv.slice(2));\n`,
		"utf8"
	);
	chmodSync(destination, 0o755);
}

function installFakeExecutable(binDirectory, tool, options) {
	if (process.platform === "win32") {
		installWindowsFakeExecutable(binDirectory, tool, options);
		return;
	}
	installPosixFakeExecutable(binDirectory, tool);
}

export function createFakeToolchain(test, options = {}) {
	const root = temporaryDirectory(test, "tools");
	const binDirectory = join(root, "fake tools");
	mkdirSync(binDirectory, { recursive: true });
	for (const tool of options.tools || ["docker", "git", "pnpm", "yorkie"]) {
		installFakeExecutable(binDirectory, tool, options);
	}

	const stateFile = join(root, "yorkie-state.json");
	const logFile = join(root, "invocations.jsonl");
	writeFileSync(
		stateFile,
		`${JSON.stringify({ projects: options.projects || [] }, null, 2)}\n`,
		"utf8"
	);

	const requireOption = `--require=${FAKE_TOOL_BOOTSTRAP}`;
	return {
		root,
		binDirectory,
		stateFile,
		logFile,
		env: {
			PATH:
				options.inheritPath === false
					? `${binDirectory}${delimiter}${dirname(process.execPath)}`
					: `${binDirectory}${delimiter}${process.env.PATH || ""}`,
			PATHEXT:
				process.platform === "win32"
					? `.EXE;.CMD;.BAT;${process.env.PATHEXT || ""}`
					: process.env.PATHEXT,
			NODE_OPTIONS: [process.env.NODE_OPTIONS, requireOption].filter(Boolean).join(" "),
			FAKE_TOOL_LOG: logFile,
			FAKE_YORKIE_STATE: stateFile,
			FAKE_YORKIE_PUBLIC_KEY: options.publicKey || "pk_test_public",
			FAKE_YORKIE_SECRET_KEY: options.secretKey || "sk_test_secret",
			FAKE_CAPTURE_STDIN: options.captureStdin ? "1" : "0",
			FAKE_PNPM_VERSION: options.pnpmVersion || "9.4.0",
			GITHUB_CLIENT_ID: "test_github_client_id",
			GITHUB_CLIENT_SECRET: "test_github_client_secret",
		},
		readState() {
			return JSON.parse(readFileSync(stateFile, "utf8"));
		},
		readInvocations() {
			if (!existsSync(logFile)) return [];
			return readFileSync(logFile, "utf8")
				.trim()
				.split("\n")
				.filter(Boolean)
				.map((line) => JSON.parse(line));
		},
	};
}

export function runCli(args, options = {}) {
	const result = spawnSync(process.execPath, [builtCliPath(), ...args], {
		cwd: options.cwd || CLI_DIRECTORY,
		env: sanitizedEnvironment({
			NO_COLOR: "1",
			FORCE_COLOR: "0",
			CI: "1",
			...options.env,
		}),
		encoding: "utf8",
		input: options.input,
		timeout: options.timeout || 30_000,
		windowsHide: true,
	});
	if (result.error) throw result.error;
	assert.equal(result.signal, null, `CLI terminated by ${result.signal}: ${result.stderr}`);
	return {
		status: result.status,
		stdout: result.stdout || "",
		stderr: result.stderr || "",
	};
}

export function parseSingleJson(result) {
	assert.equal(result.stderr, "", `expected no stderr, got: ${result.stderr}`);
	const parsed = JSON.parse(result.stdout);
	assert.equal(
		result.stdout.trim(),
		JSON.stringify(parsed, null, 2),
		"JSON mode must emit exactly one pretty-printed JSON document"
	);
	return parsed;
}

export function existingProject(overrides = {}) {
	return {
		id: "fake-existing",
		name: "codepair",
		public_key: "pk_existing_public",
		secret_key: "sk_existing_secret",
		event_webhook_url: "http://host.docker.internal:3000/yorkie/document-events",
		event_webhook_events: ["DocumentRootChanged"],
		...overrides,
	};
}

export function writeEnvFiles(root, backendContent, frontendContent) {
	const backendPath = join(root, "packages", "backend", ".env.development");
	const frontendPath = join(root, "packages", "frontend", ".env.development");
	writeFileSync(backendPath, backendContent, "utf8");
	writeFileSync(frontendPath, frontendContent, "utf8");
	return { backendPath, frontendPath };
}

export function executableShimPath(prefix, name = "codepair") {
	return process.platform === "win32"
		? join(prefix, "node_modules", ".bin", `${name}.cmd`)
		: join(prefix, "node_modules", ".bin", name);
}

export function runExecutable(file, args, options = {}) {
	const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : file;
	const commandArgs =
		process.platform === "win32" ? ["/d", "/s", "/c", `"${file}"`, ...args] : args;
	const result = spawnSync(command, commandArgs, {
		cwd: options.cwd || dirname(file),
		env: sanitizedEnvironment(options.env),
		encoding: "utf8",
		timeout: 30_000,
		windowsHide: true,
	});
	if (result.error) throw result.error;
	return {
		status: result.status,
		stdout: result.stdout || "",
		stderr: result.stderr || "",
	};
}

export function commandAvailable(command, args = ["--version"]) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		windowsHide: true,
	});
	return !result.error && result.status === 0;
}

export function pathBasename(value) {
	return basename(value).replace(/\.exe$/i, "");
}
