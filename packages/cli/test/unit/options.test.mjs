import assert from "node:assert/strict";
import test from "node:test";

import { parseDoctorOptions } from "../../dist/commands/doctor.js";
import { parseSetupYorkieOptions } from "../../dist/commands/setup-yorkie.js";
import { extractGlobalOptions, optionValue } from "../../dist/core/args.js";
import { clearCliConfigurationEnvironment } from "../helpers/environment.mjs";

clearCliConfigurationEnvironment();

test("global options are extracted before or after command tokens", () => {
	assert.deepEqual(
		extractGlobalOptions(["--json", "doctor", "--root=/tmp/code pair", "--scope", "env", "-h"]),
		{
			options: {
				json: true,
				help: true,
				version: false,
				root: "/tmp/code pair",
			},
			remaining: ["doctor", "--scope", "env"],
		}
	);
	assert.throws(
		() => extractGlobalOptions(["doctor", "--root"]),
		(error) => error?.code === "MISSING_OPTION_VALUE"
	);
});

test("doctor options validate scope and strict mode", () => {
	assert.deepEqual(
		parseDoctorOptions(
			[
				"--scope=yorkie",
				"--strict",
				"--rpc-addr",
				"https://yorkie.example.test",
				"--project=custom",
				"--webhook-url",
				"https://codepair.example.test/yorkie/events",
				"--backend-env=config/backend.env",
				"--frontend-env",
				"config/frontend.env",
			],
			"/repo"
		),
		{
			root: "/repo",
			strict: true,
			scope: "yorkie",
			rpcAddress: "https://yorkie.example.test",
			projectName: "custom",
			webhookUrl: "https://codepair.example.test/yorkie/events",
			backendEnvPath: "config/backend.env",
			frontendEnvPath: "config/frontend.env",
		}
	);
	assert.throws(
		() => parseDoctorOptions(["--scope", "invalid"]),
		(error) => error?.code === "INVALID_SCOPE" && error?.exitCode === 2
	);
	assert.throws(
		() => parseDoctorOptions(["--rpc-addr", "http://alice:rpc-secret@["]),
		(error) => error?.code === "INVALID_RPC_ADDRESS" && error?.exitCode === 2
	);
});

test("setup options parse string, boolean, equals, and alias forms", () => {
	const options = parseSetupYorkieOptions(
		[
			"--rpc-addr=example.test:8080",
			"--project",
			"project 한글",
			"--username",
			"operator",
			"--webhook-url=https://example.test/hook",
			"--backend-env",
			"path with spaces/backend.env",
			"--frontend-env=frontend.env",
			"--password-stdin",
			"--secure",
			"--allow-insecure-remote",
			"-y",
			"--dry-run",
		],
		"/repo"
	);
	assert.deepEqual(options, {
		root: "/repo",
		rpcAddress: "example.test:8080",
		projectName: "project 한글",
		username: "operator",
		passwordFromStdin: true,
		webhookUrl: "https://example.test/hook",
		backendEnvPath: "path with spaces/backend.env",
		frontendEnvPath: "frontend.env",
		secure: true,
		allowInsecureRemote: true,
		legacyEnvironmentKeysOnly: false,
		yes: true,
		dryRun: true,
	});
	assert.throws(
		() => parseSetupYorkieOptions(["--insecure", "--secure"]),
		(error) => error?.code === "CONFLICTING_TRANSPORT_OPTIONS" && error?.exitCode === 2
	);
});

test("optionValue validates missing and inline values", () => {
	assert.deepEqual(optionValue(["--name=value"], 0, "--name"), {
		value: "value",
		consumed: 1,
	});
	assert.deepEqual(optionValue(["--name", "value"], 0, "--name"), {
		value: "value",
		consumed: 2,
	});
	assert.throws(
		() => optionValue(["--name"], 0, "--name"),
		(error) => error?.code === "MISSING_OPTION_VALUE"
	);
});
