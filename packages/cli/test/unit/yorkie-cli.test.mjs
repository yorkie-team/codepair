import assert from "node:assert/strict";
import test from "node:test";

import { parseYorkieProjects } from "../../dist/adapters/yorkie-cli.js";

test("parseYorkieProjects accepts snake_case arrays and comma-separated events", () => {
	assert.deepEqual(
		parseYorkieProjects(
			JSON.stringify([
				{
					name: "codepair",
					secret_key: "secret",
					public_key: "public",
					event_webhook_url: "https://example.test/hook",
					event_webhook_events: "DocumentRootChanged, OtherEvent",
				},
			])
		),
		[
			{
				name: "codepair",
				secretKey: "secret",
				publicKey: "public",
				eventWebhookUrl: "https://example.test/hook",
				eventWebhookEvents: ["DocumentRootChanged", "OtherEvent"],
			},
		]
	);
});

test("parseYorkieProjects accepts supported wrappers and camelCase fields", () => {
	for (const wrapper of ["projects", "items", "data"]) {
		const output = parseYorkieProjects(
			JSON.stringify({
				[wrapper]: [
					{
						name: wrapper,
						secretKey: "secret",
						publicKey: "public",
						eventWebhookUrl: "http://localhost/hook",
						eventWebhookEvents: ["DocumentRootChanged"],
					},
				],
			})
		);
		assert.equal(output[0].name, wrapper);
		assert.deepEqual(output[0].eventWebhookEvents, ["DocumentRootChanged"]);
	}
});

test("parseYorkieProjects reports malformed and unexpected JSON", () => {
	assert.throws(
		() => parseYorkieProjects("{not-json"),
		(error) => error?.code === "INVALID_YORKIE_PROJECT_JSON" && error?.exitCode === 1
	);
	assert.throws(
		() => parseYorkieProjects('{"notProjects":true}'),
		(error) => error?.code === "INVALID_YORKIE_PROJECT_OUTPUT"
	);
	assert.throws(
		() => parseYorkieProjects('[{"public_key":"missing-name"}]'),
		(error) => error?.code === "INVALID_YORKIE_PROJECT_OUTPUT"
	);
});
