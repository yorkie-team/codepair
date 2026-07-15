import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { createCodePairRoot, parseSingleJson, runCli } from "../e2e/helpers/cli-harness.mjs";

const rpcAddress = process.env.CODEPAIR_YORKIE_RPC_ADDR;
const webhookUrl = "http://host.docker.internal:3000/yorkie/document-events";

function setupArguments(root, projectName) {
	return [
		"setup",
		"yorkie",
		"--root",
		root,
		"--rpc-addr",
		rpcAddress,
		"--project",
		projectName,
		"--webhook-url",
		webhookUrl,
		"--yes",
		"--json",
	];
}

test(
	"setup and doctor interoperate with a real Yorkie server",
	{
		skip: rpcAddress ? false : "Set CODEPAIR_YORKIE_RPC_ADDR to run this integration test.",
		timeout: 60_000,
	},
	(t) => {
		const root = createCodePairRoot(t, "real yorkie");
		const projectName = `codepair-cli-${randomUUID().slice(0, 8)}`;
		const env = {
			OPENAI_API_KEY: "must-not-be-persisted",
			YORKIE_PASSWORD: "admin",
		};

		const first = runCli(setupArguments(root, projectName), { env, timeout: 60_000 });
		assert.equal(first.status, 0, first.stderr);
		const firstOutput = parseSingleJson(first);
		assert.equal(firstOutput.ok, true);
		assert.equal(firstOutput.changed, true);
		assert.equal(
			firstOutput.actions.find(({ id }) => id === "yorkie.project")?.status,
			"changed"
		);
		assert.equal(
			firstOutput.actions.find(({ id }) => id === "yorkie.webhook")?.status,
			"changed"
		);

		const backendEnv = readFileSync(
			join(root, "packages", "backend", ".env.development"),
			"utf8"
		);
		const frontendEnv = readFileSync(
			join(root, "packages", "frontend", ".env.development"),
			"utf8"
		);
		assert.match(backendEnv, /^YORKIE_PROJECT_SECRET_KEY="[^"]+"$/m);
		assert.match(backendEnv, /^YORKIE_API_ADDR="http:\/\/127\.0\.0\.1:18080"$/m);
		assert.doesNotMatch(backendEnv, /must-not-be-persisted/);
		assert.match(frontendEnv, /^VITE_YORKIE_API_KEY="[^"]+"$/m);
		assert.match(frontendEnv, /^VITE_YORKIE_API_ADDR="http:\/\/127\.0\.0\.1:18080"$/m);

		const second = runCli(setupArguments(root, projectName), { env, timeout: 60_000 });
		assert.equal(second.status, 0, second.stderr);
		const secondOutput = parseSingleJson(second);
		assert.equal(secondOutput.ok, true);
		assert.equal(secondOutput.changed, false);

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
				"--json",
			],
			{
				env,
				timeout: 60_000,
			}
		);
		assert.equal(doctor.status, 0, doctor.stderr);
		const doctorOutput = parseSingleJson(doctor);
		assert.equal(doctorOutput.ok, true);
		assert.deepEqual(doctorOutput.summary, { pass: 5, warn: 0, fail: 0, skip: 0 });
		assert.ok(doctorOutput.checks.every(({ status }) => status === "pass"));
	}
);
