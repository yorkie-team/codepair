import assert from "node:assert/strict";
import test from "node:test";

import {
	assertSafeTransport,
	getRpcHost,
	isLoopbackHost,
	normalizeYorkieRpcEndpoint,
	validateWebhookUrl,
} from "../../dist/core/url.js";
import { REDACTED, redactCommandArgs, redactText, redactValue } from "../../dist/core/redact.js";

test("URL safety accepts loopback and secure transports but rejects plaintext remote login", () => {
	assert.equal(getRpcHost("localhost:8080"), "localhost");
	assert.equal(getRpcHost("https://yorkie.example.test:443"), "yorkie.example.test");
	for (const host of ["localhost", "api.localhost", "127.0.0.1", "::1"]) {
		assert.equal(isLoopbackHost(host), true, host);
	}
	assert.doesNotThrow(() => assertSafeTransport("localhost:8080", true, false));
	assert.doesNotThrow(() => assertSafeTransport("yorkie.example.test:8080", false, false));
	assert.doesNotThrow(() => assertSafeTransport("yorkie.example.test:8080", true, true));
	assert.throws(
		() => assertSafeTransport("yorkie.example.test:8080", true, false),
		(error) => error?.code === "INSECURE_REMOTE_REFUSED" && error?.exitCode === 2
	);
});

test("Yorkie RPC endpoints use canonical CLI and application forms", () => {
	assert.deepEqual(normalizeYorkieRpcEndpoint("localhost:8080"), {
		rpcAddress: "localhost:8080",
		httpUrl: "http://localhost:8080",
		secure: false,
	});
	assert.deepEqual(normalizeYorkieRpcEndpoint("yorkie.example.test"), {
		rpcAddress: "yorkie.example.test:8080",
		httpUrl: "http://yorkie.example.test:8080",
		secure: false,
	});
	assert.deepEqual(normalizeYorkieRpcEndpoint("https://yorkie.example.test"), {
		rpcAddress: "yorkie.example.test:443",
		httpUrl: "https://yorkie.example.test:443",
		secure: true,
	});
	assert.throws(
		() => normalizeYorkieRpcEndpoint("http://yorkie.example.test", "secure"),
		(error) => error?.code === "CONFLICTING_TRANSPORT_OPTIONS"
	);
	assert.throws(
		() => normalizeYorkieRpcEndpoint("https://yorkie.example.test/path"),
		(error) => error?.code === "INVALID_RPC_ADDRESS"
	);
});

test("webhook validation allows HTTP(S) without embedded credentials", () => {
	assert.equal(validateWebhookUrl("https://example.test/hook").protocol, "https:");
	assert.throws(
		() => validateWebhookUrl("file:///tmp/hook"),
		(error) => error?.code === "INVALID_WEBHOOK_URL"
	);
	assert.throws(
		() => validateWebhookUrl("https://user:pass@example.test/hook"),
		(error) => error?.code === "WEBHOOK_CREDENTIALS_REFUSED"
	);
});

test("malformed URLs never echo embedded credentials", () => {
	for (const [input, operation] of [
		["http://alice:rpc-secret@[", normalizeYorkieRpcEndpoint],
		["http://alice:webhook-secret@[", validateWebhookUrl],
	]) {
		assert.throws(operation.bind(undefined, input), (error) => {
			assert.doesNotMatch(error.message, /alice|secret/);
			return true;
		});
	}
});

test("redaction covers known secrets, labeled values, command arguments, and object keys", () => {
	const secret = "sensitive-value-123";
	const text = redactText(`login ${secret} password=visible token=generic api_key:also-visible`, [
		secret,
	]);
	assert.doesNotMatch(
		text,
		/sensitive-value-123|password=visible|token=generic|api_key:also-visible/
	);
	assert.match(text, new RegExp(REDACTED.replace(/[\[\]]/g, "\\$&")));
	assert.deepEqual(
		redactCommandArgs(["login", "-p", secret, "--token=abc", "--project", "codepair"]),
		["login", "-p", REDACTED, `--token=${REDACTED}`, "--project", "codepair"]
	);
	assert.deepEqual(redactValue({ password: secret, nested: { apiKey: "abc", ok: 1 } }), {
		password: REDACTED,
		nested: { apiKey: REDACTED, ok: 1 },
	});
});
