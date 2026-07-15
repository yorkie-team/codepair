import assert from "node:assert/strict";
import test from "node:test";

import {
	createCodePairRoot,
	createFakeToolchain,
	existingProject,
	parseSingleJson,
	readCliPackage,
	runCli,
	writeEnvFiles,
} from "./helpers/cli-harness.mjs";

test("top-level help documents the stable command surface", () => {
	for (const args of [["--help"], ["-h"], ["help"]]) {
		const result = runCli(args);
		assert.equal(result.status, 0, `${args.join(" ")} failed: ${result.stderr}`);
		assert.equal(result.stderr, "");
		assert.match(result.stdout, /Usage:\s+codepair/i);
		assert.match(result.stdout, /doctor/);
		assert.match(result.stdout, /setup\s+yorkie/);
		assert.match(result.stdout, /--version/);
	}
});

test("version flags and command report the package version", () => {
	const expected = readCliPackage().version;
	for (const args of [["--version"], ["-V"], ["version"]]) {
		const result = runCli(args);
		assert.equal(result.status, 0, `${args.join(" ")} failed: ${result.stderr}`);
		assert.equal(result.stderr, "");
		assert.equal(result.stdout.trim(), expected);
	}
});

test("invalid command and options use the usage exit code", () => {
	for (const args of [
		["definitely-not-a-command"],
		["doctor", "--scope", "nope"],
		["doctor", "--scope"],
		["setup", "not-yorkie"],
		["setup", "yorkie", "--definitely-not-an-option"],
		["setup", "yorkie", "--secure", "--insecure"],
	]) {
		const result = runCli(args);
		assert.equal(result.status, 2, `${args.join(" ")} should be invalid usage`);
		assert.notEqual(result.stderr.trim(), "");
	}
});

test("JSON usage errors are one machine-readable document", () => {
	const result = runCli(["--json", "doctor", "--scope", "invalid"]);
	assert.equal(result.status, 2);
	const output = parseSingleJson(result);
	assert.equal(output.ok, false);
	assert.equal(output.exitCode, 2);
	assert.equal(output.command, "doctor");
	assert.equal(typeof output.error?.code, "string");
	assert.equal(typeof output.error?.message, "string");
});

test("JSON usage errors do not echo credentials from malformed URLs", () => {
	for (const [option, value] of [
		["--rpc-addr", "http://alice:rpc-secret@["],
		["--webhook-url", "http://alice:webhook-secret@["],
	]) {
		const result = runCli(["setup", "yorkie", option, value, "--json"]);
		assert.equal(result.status, 2);
		parseSingleJson(result);
		assert.doesNotMatch(result.stdout, /alice|secret/);
	}
});

test("unknown-command diagnostics never echo trailing secret arguments", () => {
	const secret = "must-not-appear-in-output";
	for (const args of [
		["not-a-command", "--password", secret, "--json"],
		["--password", secret, "--json"],
		[`--token=${secret}`, "--json"],
		["setup", "yorkie", `--credential=${secret}`, "--json"],
	]) {
		const result = runCli(args);
		assert.equal(result.status, 2);
		parseSingleJson(result);
		assert.doesNotMatch(result.stdout, new RegExp(secret));
	}
});

test("doctor toolchain emits a complete JSON envelope and accepts global flags anywhere", (t) => {
	const root = createCodePairRoot(t, "doctor json");
	const fake = createFakeToolchain(t);
	for (const args of [
		["doctor", "--scope", "toolchain", "--root", root, "--json"],
		["--json", "--root", root, "doctor", "--scope", "toolchain"],
	]) {
		const result = runCli(args, { env: fake.env });
		assert.equal(result.status, 0, result.stderr);
		const output = parseSingleJson(result);
		assert.deepEqual(
			{
				command: output.command,
				ok: output.ok,
				exitCode: output.exitCode,
				root: output.root,
				strict: output.strict,
			},
			{ command: "doctor", ok: true, exitCode: 0, root, strict: false }
		);
		assert.deepEqual(
			new Set(output.checks.map((check) => check.id)),
			new Set([
				"toolchain.node",
				"toolchain.pnpm",
				"toolchain.yorkie",
				"toolchain.docker",
				"toolchain.compose",
			])
		);
		assert.ok(output.checks.every((check) => check.scope === "toolchain"));
		assert.ok(output.checks.every((check) => check.status === "pass"));
		assert.deepEqual(output.summary, { pass: 5, warn: 0, fail: 0, skip: 0 });
	}
});

test("doctor text output is human-readable", (t) => {
	const root = createCodePairRoot(t, "doctor text");
	const fake = createFakeToolchain(t);
	const result = runCli(["doctor", "--root", root, "--scope", "toolchain"], {
		env: fake.env,
	});
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stderr, "");
	assert.match(result.stdout, /CodePair doctor/);
	assert.match(result.stdout, /\[PASS\].*Node\.js/);
	assert.match(result.stdout, /\[PASS\].*Yorkie CLI/);
	assert.match(result.stdout, /Summary:\s+5 passed, 0 warnings, 0 failed, 0 skipped/);
});

test("doctor warnings are non-fatal unless strict mode is requested", (t) => {
	const root = createCodePairRoot(t, "doctor strict");
	writeEnvFiles(
		root,
		[
			"DATABASE_URL=mongodb://localhost/codepair",
			"GITHUB_CLIENT_ID=test-id",
			"GITHUB_CLIENT_SECRET=secret",
			"GITHUB_CALLBACK_URL=http://localhost:3000/auth/login/github",
			"JWT_ACCESS_TOKEN_SECRET=strong-access-value",
			"JWT_ACCESS_TOKEN_EXPIRATION_TIME=86400",
			"JWT_REFRESH_TOKEN_SECRET=strong-refresh-value",
			"JWT_REFRESH_TOKEN_EXPIRATION_TIME=604800",
			"FRONTEND_BASE_URL=http://localhost:5173",
			"YORKIE_API_ADDR=http://localhost:8080",
			"YORKIE_PROJECT_SECRET_KEY=strong-yorkie-value",
			"",
		].join("\n"),
		[
			"VITE_API_ADDR=http://localhost:3000",
			"VITE_YORKIE_API_ADDR=http://localhost:8080",
			"VITE_YORKIE_API_KEY=public-key",
			"",
		].join("\n")
	);

	const lenient = runCli(["doctor", "--root", root, "--scope", "env", "--json"]);
	assert.equal(lenient.status, 0, lenient.stderr);
	const lenientOutput = parseSingleJson(lenient);
	assert.equal(lenientOutput.ok, true);
	assert.equal(lenientOutput.summary.warn, 1);
	assert.equal(lenientOutput.summary.fail, 0);

	const strict = runCli(["doctor", "--root", root, "--scope", "env", "--strict", "--json"]);
	assert.equal(strict.status, 1, strict.stderr);
	const strictOutput = parseSingleJson(strict);
	assert.equal(strictOutput.ok, false);
	assert.equal(strictOutput.exitCode, 1);
	assert.equal(strictOutput.strict, true);
	assert.equal(strictOutput.summary.warn, 1);
});

test("doctor required-tool failures exit 1 without strict mode", (t) => {
	const root = createCodePairRoot(t, "doctor failure");
	const fake = createFakeToolchain(t, {
		tools: ["docker", "yorkie"],
		inheritPath: false,
	});
	const result = runCli(["doctor", "--root", root, "--scope", "toolchain", "--json"], {
		env: fake.env,
	});
	assert.equal(result.status, 1, result.stderr);
	const output = parseSingleJson(result);
	assert.equal(output.ok, false);
	assert.equal(output.exitCode, 1);
	assert.equal(output.summary.fail, 1);
	assert.equal(output.checks.find((check) => check.id === "toolchain.pnpm")?.status, "fail");
});

test("doctor rejects unsupported pnpm and missing Docker/Compose", async (t) => {
	await t.test("pnpm major version", (subtest) => {
		const root = createCodePairRoot(subtest, "doctor pnpm version");
		const fake = createFakeToolchain(subtest, { pnpmVersion: "10.1.0" });
		const result = runCli(["doctor", "--root", root, "--scope", "toolchain", "--json"], {
			env: fake.env,
		});
		assert.equal(result.status, 1, result.stderr);
		const output = parseSingleJson(result);
		assert.equal(output.checks.find(({ id }) => id === "toolchain.pnpm")?.status, "fail");
	});

	await t.test("Docker executables", (subtest) => {
		const root = createCodePairRoot(subtest, "doctor docker missing");
		const fake = createFakeToolchain(subtest, {
			tools: ["pnpm", "yorkie"],
			inheritPath: false,
		});
		const result = runCli(["doctor", "--root", root, "--scope", "toolchain", "--json"], {
			env: fake.env,
		});
		assert.equal(result.status, 1, result.stderr);
		const output = parseSingleJson(result);
		assert.equal(output.summary.fail, 2);
		for (const id of ["toolchain.docker", "toolchain.compose"]) {
			assert.equal(output.checks.find((check) => check.id === id)?.status, "fail");
		}
	});
});

test("doctor compares Yorkie project keys and webhook with local configuration", (t) => {
	const root = createCodePairRoot(t, "doctor yorkie");
	const project = {
		name: "codepair",
		public_key: "pk_doctor_public",
		secret_key: "sk_doctor_secret",
		event_webhook_url: "http://host.docker.internal:3000/yorkie/document-events",
		event_webhook_events: ["DocumentRootChanged"],
	};
	const fake = createFakeToolchain(t, { projects: [project] });
	const env = {
		...fake.env,
		YORKIE_PROJECT_NAME: "codepair",
		WEBHOOK_URL: project.event_webhook_url,
	};
	writeEnvFiles(
		root,
		`YORKIE_API_ADDR="http://localhost:8080"\nYORKIE_PROJECT_SECRET_KEY="${project.secret_key}"\n`,
		`VITE_YORKIE_API_ADDR="http://localhost:8080"\nVITE_YORKIE_API_KEY="${project.public_key}"\n`
	);

	const matching = runCli(["doctor", "--root", root, "--scope", "yorkie", "--json"], { env });
	assert.equal(matching.status, 0, matching.stderr);
	const matchingOutput = parseSingleJson(matching);
	assert.deepEqual(matchingOutput.summary, { pass: 5, warn: 0, fail: 0, skip: 0 });

	writeEnvFiles(
		root,
		"YORKIE_API_ADDR=http://localhost:8080\nYORKIE_PROJECT_SECRET_KEY=wrong-secret\n",
		"VITE_YORKIE_API_ADDR=http://localhost:8080\nVITE_YORKIE_API_KEY=wrong-public\n"
	);
	const mismatching = runCli(["doctor", "--root", root, "--scope", "yorkie", "--json"], { env });
	assert.equal(mismatching.status, 1, mismatching.stderr);
	const mismatchingOutput = parseSingleJson(mismatching);
	for (const id of ["yorkie.backend-key", "yorkie.frontend-key"]) {
		assert.equal(mismatchingOutput.checks.find((check) => check.id === id)?.status, "fail");
	}
});

test("doctor reports invalid or divergent Yorkie configuration as a failed check", (t) => {
	const root = createCodePairRoot(t, "doctor yorkie configuration");
	const fake = createFakeToolchain(t, { projects: [existingProject()] });
	writeEnvFiles(
		root,
		"YORKIE_API_ADDR=http://localhost:8080\nYORKIE_PROJECT_SECRET_KEY=secret\n",
		"VITE_YORKIE_API_ADDR=http://localhost:9090\nVITE_YORKIE_API_KEY=public\n"
	);

	const divergent = runCli(["doctor", "--root", root, "--scope", "yorkie", "--json"], {
		env: fake.env,
	});
	assert.equal(divergent.status, 1, divergent.stderr);
	const divergentOutput = parseSingleJson(divergent);
	assert.equal(divergentOutput.checks[0].id, "yorkie.configuration");
	assert.match(divergentOutput.checks[0].message, /do not match/);
	assert.deepEqual(fake.readInvocations(), []);

	writeEnvFiles(
		root,
		"YORKIE_API_ADDR=http://localhost:8080\nYORKIE_PROJECT_SECRET_KEY=secret\n",
		"VITE_YORKIE_API_ADDR=http://localhost:8080\nVITE_YORKIE_API_KEY=public\n"
	);
	const malformed = runCli(["doctor", "--root", root, "--scope", "yorkie", "--json"], {
		env: { ...fake.env, WEBHOOK_URL: "http://alice:webhook-secret@[" },
	});
	assert.equal(malformed.status, 1, malformed.stderr);
	const malformedOutput = parseSingleJson(malformed);
	assert.equal(malformedOutput.checks[0].id, "yorkie.configuration");
	assert.doesNotMatch(malformed.stdout, /alice|secret/);
});
