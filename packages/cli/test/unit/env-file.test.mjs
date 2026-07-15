import assert from "node:assert/strict";
import test from "node:test";

import { parseEnv, updateEnvContent } from "../../dist/core/env-file.js";

test("parseEnv reads exported, quoted, bare, and duplicate assignments", () => {
	const parsed = parseEnv(
		[
			"# ignored",
			'export DOUBLE="two words"',
			"SINGLE='single value'",
			"BARE=bare-value # trailing comment",
			"EMPTY=",
			"NOT AN ASSIGNMENT",
			"DOUBLE=last-value",
			"",
		].join("\n")
	);

	assert.deepEqual(Object.fromEntries(parsed), {
		DOUBLE: "last-value",
		SINGLE: "single value",
		BARE: "bare-value",
		EMPTY: "",
	});
});

test("updateEnvContent preserves CRLF and unrelated lines while replacing keys once", () => {
	const original = "# heading\r\nKEEP=1\r\nTARGET=old\r\nTARGET=duplicate\r\n# footer\r\n";
	const updated = updateEnvContent(original, {
		TARGET: "new value",
		ADDED: 'quote " and slash \\',
	});

	assert.equal(
		updated,
		'# heading\r\nKEEP=1\r\nTARGET="new value"\r\n# footer\r\n\r\nADDED="quote \\" and slash \\\\"\r\n'
	);
	assert.equal((updated.match(/^TARGET=/gm) || []).length, 1);
	assert.ok(!updated.replaceAll("\r\n", "").includes("\n"));
});

test("updateEnvContent rejects invalid environment variable names", () => {
	assert.throws(
		() => updateEnvContent("", { "NOT-SAFE": "value" }),
		/Invalid environment variable name/
	);
});
