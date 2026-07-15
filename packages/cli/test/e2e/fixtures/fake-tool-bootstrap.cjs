"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SUPPORTED_TOOLS = new Set(["docker", "git", "pnpm", "yorkie"]);
const executableName = path.basename(process.argv0, path.extname(process.argv0)).toLowerCase();

if (SUPPORTED_TOOLS.has(executableName)) {
	// Node consumes its own --help/--version flags before preloads run. The fake
	// executables are renamed Node binaries, so an empty forwarded argv represents
	// the version/help probe used by the CLI.
	const forwardedArgs = process.argv.slice(1);
	if (forwardedArgs[0]) {
		// Node resolves its first non-option argument as a script path. Recover the
		// command token that the production CLI passed to the renamed executable.
		forwardedArgs[0] = path.basename(forwardedArgs[0]);
	}
	runFakeTool(executableName, forwardedArgs.length > 0 ? forwardedArgs : ["--help"]);
}

module.exports = { runFakeTool };

function environmentName(tool, suffix) {
	return `FAKE_${tool.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${suffix}`;
}

function readJsonFile(file, fallback) {
	if (!file || !fs.existsSync(file)) return fallback;
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJsonFile(file, value) {
	if (!file) return;
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function appendInvocation(tool, args, stdinBytes) {
	const logFile = process.env.FAKE_TOOL_LOG;
	if (!logFile) return;
	const safeArgs = [];
	let redactNext = false;
	for (const arg of args) {
		if (redactNext) {
			safeArgs.push("[SECRET]");
			redactNext = false;
		} else if (arg === "-p" || arg === "--password" || arg === "--token") {
			safeArgs.push(arg);
			redactNext = true;
		} else {
			safeArgs.push(arg);
		}
	}
	fs.mkdirSync(path.dirname(logFile), { recursive: true });
	fs.appendFileSync(
		logFile,
		`${JSON.stringify({ tool, args: safeArgs, stdinBytes, cwd: process.cwd() })}\n`,
		"utf8"
	);
}

function projectState() {
	const stateFile = process.env.FAKE_YORKIE_STATE;
	if (stateFile && fs.existsSync(stateFile)) {
		return readJsonFile(stateFile, { projects: [] });
	}
	const configured = process.env.FAKE_YORKIE_PROJECTS;
	return { projects: configured ? JSON.parse(configured) : [] };
}

function saveProjectState(state) {
	writeJsonFile(process.env.FAKE_YORKIE_STATE, state);
}

function flagValue(args, flag) {
	const index = args.indexOf(flag);
	return index >= 0 ? args[index + 1] : undefined;
}

function runYorkie(args, mode) {
	if (args[0] === "--help" || args[0] === "help") {
		process.stdout.write("Yorkie CLI fake\n");
		return;
	}
	if (args[0] === "version" || args[0] === "--version") {
		process.stdout.write("Yorkie: 0.7.12\n");
		return;
	}
	if (args[0] === "login") {
		process.stdout.write("Logged in\n");
		return;
	}
	if (args[0] !== "project") {
		process.stderr.write(`unexpected yorkie command: ${args.join(" ")}\n`);
		process.exit(64);
	}

	if (args[1] === "ls") {
		if (mode === "malformed-json") {
			process.stdout.write("{ definitely-not-json\n");
			return;
		}
		if (mode === "unexpected-json") {
			process.stdout.write('{"notProjects":true}\n');
			return;
		}
		process.stdout.write(`${JSON.stringify(projectState().projects)}\n`);
		return;
	}

	if (args[1] === "create") {
		const name = args[2];
		if (!name) {
			process.stderr.write("missing project name\n");
			process.exit(64);
		}
		const state = projectState();
		if (!state.projects.some((project) => project.name === name)) {
			state.projects.push({
				id: `fake-${state.projects.length + 1}`,
				name,
				public_key: process.env.FAKE_YORKIE_PUBLIC_KEY || "pk_fake_public",
				secret_key: process.env.FAKE_YORKIE_SECRET_KEY || "sk_fake_secret",
				event_webhook_url: "",
				event_webhook_events: [],
			});
		}
		saveProjectState(state);
		process.stdout.write(
			`${JSON.stringify(state.projects.find((project) => project.name === name))}\n`
		);
		return;
	}

	if (args[1] === "update") {
		const name = args[2];
		const state = projectState();
		const project = state.projects.find((candidate) => candidate.name === name);
		if (!project) {
			process.stderr.write(`project not found: ${name}\n`);
			process.exit(7);
		}
		project.event_webhook_url = flagValue(args, "--event-webhook-url") || "";
		const event = flagValue(args, "--event-webhook-events-add");
		project.event_webhook_events = event ? [event] : [];
		saveProjectState(state);
		process.stdout.write(`${JSON.stringify(project)}\n`);
		return;
	}

	process.stderr.write(`unexpected yorkie project command: ${args.join(" ")}\n`);
	process.exit(64);
}

function runFakeTool(tool, args) {
	const mode = process.env[environmentName(tool, "MODE")] || "ok";
	let stdin = "";
	if (tool === "yorkie" && args[0] === "login" && process.env.FAKE_CAPTURE_STDIN === "1") {
		stdin = fs.readFileSync(0, "utf8");
	}
	appendInvocation(tool, args, Buffer.byteLength(stdin));

	const failOn = process.env[environmentName(tool, "FAIL_ON")];
	if (mode === "fail" && (!failOn || failOn === args[0])) {
		process.stderr.write(
			process.env[environmentName(tool, "FAILURE_TEXT")] || `${tool} failed intentionally\n`
		);
		process.exit(Number(process.env[environmentName(tool, "EXIT_CODE")] || 9));
	}

	if (tool === "yorkie") {
		runYorkie(args, mode);
		process.exit(0);
	}
	if (tool === "docker") {
		process.stdout.write(
			args[0] === "compose" ? "Docker Compose version v2.29.0\n" : "Docker version 27.0.0\n"
		);
		process.exit(0);
	}
	if (tool === "pnpm") {
		process.stdout.write(`${process.env.FAKE_PNPM_VERSION || "9.4.0"}\n`);
		process.exit(0);
	}
	if (tool === "git") {
		process.stdout.write("git version 2.45.0\n");
		process.exit(0);
	}
}
