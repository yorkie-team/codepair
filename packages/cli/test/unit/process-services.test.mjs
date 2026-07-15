import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { parseHostPort } from "../../dist/adapters/network.js";
import { httpCheck } from "../../dist/checks/services.js";
import { CommandRunner } from "../../dist/core/process.js";

test(
	"CommandRunner escalates and settles when a child ignores SIGTERM",
	{ timeout: 5_000 },
	async () => {
		const directory = await mkdtemp(join(tmpdir(), "codepair-process-test-"));
		const marker = join(directory, "sigterm-received");
		const script = [
			'import fs from "node:fs";',
			'process.on("SIGTERM", () => fs.writeFileSync(process.argv[1], "received"));',
			"setInterval(() => undefined, 1_000);",
		].join("");
		const startedAt = Date.now();

		try {
			await assert.rejects(
				new CommandRunner().run(
					process.execPath,
					["--input-type=module", "--eval", script, marker],
					{
						timeoutMs: 750,
					}
				),
				(error) => error?.code === "COMMAND_TIMEOUT"
			);
			assert.ok(Date.now() - startedAt < 3_000, "timeout should always settle promptly");
			if (process.platform !== "win32") {
				assert.equal(await readFile(marker, "utf8"), "received");
			}
		} finally {
			await rm(directory, { recursive: true, force: true });
		}
	}
);

test("service HTTP checks reject URL credentials without exposing them", async () => {
	const check = await httpCheck(
		"services.private",
		"Private service",
		"https://alice:s%40per-secret@example.test:8443/base",
		"/health"
	);
	const serialized = JSON.stringify(check);

	assert.equal(check.status, "fail");
	assert.match(check.message, /must not contain URL credentials/);
	assert.doesNotMatch(serialized, /alice|s%40per-secret|s@per-secret/);
	assert.equal(check.details, undefined);
});

test("TCP endpoint parsing removes URL brackets from IPv6 socket hosts", () => {
	assert.deepEqual(parseHostPort("http://[::1]:8080", 80), {
		host: "::1",
		port: 8080,
	});
});
