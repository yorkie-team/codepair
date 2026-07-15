import { runEnvChecks } from "../checks/env.js";
import { createDoctorContext, envValue, type DoctorContext } from "../checks/context.js";
import { runServiceChecks } from "../checks/services.js";
import { runToolchainChecks } from "../checks/toolchain.js";
import { runYorkieChecks, type YorkieCheckOptions } from "../checks/yorkie.js";
import { optionValue } from "../core/args.js";
import { UsageError } from "../core/errors.js";
import { discoverProjectRoot } from "../core/project-root.js";
import { normalizeYorkieRpcEndpoint, validateWebhookUrl } from "../core/url.js";
import {
	EXIT_FAILURE,
	EXIT_SUCCESS,
	type CheckScope,
	type DoctorCheck,
	type DoctorResult,
	type DoctorSummary,
	type RequestedScope,
} from "../types.js";

export interface DoctorOptions {
	root?: string;
	strict: boolean;
	scope: RequestedScope;
	rpcAddress?: string;
	projectName?: string;
	webhookUrl?: string;
	backendEnvPath?: string;
	frontendEnvPath?: string;
}

const SCOPES = new Set<RequestedScope>(["all", "toolchain", "env", "services", "yorkie"]);
const DEFAULT_RPC_ADDRESS = "localhost:8080";
const DEFAULT_PROJECT_NAME = "codepair";
const DEFAULT_WEBHOOK_URL = "http://host.docker.internal:3000/yorkie/document-events";
const STRING_OPTIONS = [
	["--rpc-addr", "rpcAddress"],
	["--project", "projectName"],
	["--webhook-url", "webhookUrl"],
	["--backend-env", "backendEnvPath"],
	["--frontend-env", "frontendEnvPath"],
] as const satisfies ReadonlyArray<readonly [string, keyof DoctorOptions]>;

function environment(name: string): string | undefined {
	return process.env[name]?.trim() || undefined;
}

function selectedYorkieConfiguration(
	context: DoctorContext,
	options: DoctorOptions
): YorkieCheckOptions {
	return {
		rpcAddress:
			options.rpcAddress ??
			envValue(context, "YORKIE_API_ADDR") ??
			envValue(context, "VITE_YORKIE_API_ADDR", "frontend") ??
			DEFAULT_RPC_ADDRESS,
		projectName:
			options.projectName ?? envValue(context, "YORKIE_PROJECT_NAME") ?? DEFAULT_PROJECT_NAME,
		webhookUrl: options.webhookUrl ?? envValue(context, "WEBHOOK_URL") ?? DEFAULT_WEBHOOK_URL,
	};
}

export function parseDoctorOptions(tokens: readonly string[], root?: string): DoctorOptions {
	const options: DoctorOptions = {
		root,
		strict: false,
		scope: "all",
	};
	const rpcAddress = environment("YORKIE_API_ADDR");
	const projectName = environment("YORKIE_PROJECT_NAME");
	const webhookUrl = environment("WEBHOOK_URL");
	const backendEnvPath = environment("BACKEND_ENV_FILE");
	const frontendEnvPath = environment("FRONTEND_ENV_FILE");
	if (rpcAddress) options.rpcAddress = rpcAddress;
	if (projectName) options.projectName = projectName;
	if (webhookUrl) options.webhookUrl = webhookUrl;
	if (backendEnvPath) options.backendEnvPath = backendEnvPath;
	if (frontendEnvPath) options.frontendEnvPath = frontendEnvPath;

	for (let index = 0; index < tokens.length; ) {
		const token = tokens[index];
		let matched = false;
		for (const [name, key] of STRING_OPTIONS) {
			const parsed = optionValue(tokens, index, name);
			if (!parsed) continue;
			if (name === "--rpc-addr") normalizeYorkieRpcEndpoint(parsed.value);
			if (name === "--webhook-url") validateWebhookUrl(parsed.value);
			options[key] = parsed.value;
			index += parsed.consumed;
			matched = true;
			break;
		}
		if (matched) continue;

		const parsedScope = optionValue(tokens, index, "--scope");
		if (parsedScope) {
			if (!SCOPES.has(parsedScope.value as RequestedScope)) {
				throw new UsageError(
					`Invalid doctor scope: ${parsedScope.value}. Expected all, toolchain, env, services, or yorkie.`,
					"INVALID_SCOPE"
				);
			}
			options.scope = parsedScope.value as RequestedScope;
			index += parsedScope.consumed;
			continue;
		}

		if (token === "--strict") {
			options.strict = true;
			index += 1;
			continue;
		}
		throw new UsageError(`Unknown doctor option: ${token ?? ""}`, "UNKNOWN_OPTION");
	}

	if (options.projectName !== undefined && !options.projectName.trim()) {
		throw new UsageError("--project must not be empty.");
	}
	return options;
}

function summarize(checks: readonly DoctorCheck[]): DoctorSummary {
	const summary: DoctorSummary = { pass: 0, warn: 0, fail: 0, skip: 0 };
	for (const check of checks) summary[check.status] += 1;
	return summary;
}

function selected(requested: RequestedScope, scope: CheckScope): boolean {
	return requested === "all" || requested === scope;
}

export async function runDoctor(options: DoctorOptions): Promise<DoctorResult> {
	const root = await discoverProjectRoot(options.root);
	const context = await createDoctorContext(root, {
		backendEnvPath: options.backendEnvPath,
		frontendEnvPath: options.frontendEnvPath,
	});
	const checks: DoctorCheck[] = [];

	if (selected(options.scope, "toolchain")) {
		checks.push(...(await runToolchainChecks(context)));
	}
	if (selected(options.scope, "env")) {
		checks.push(...runEnvChecks(context));
	}
	if (selected(options.scope, "services")) {
		checks.push(...(await runServiceChecks(context)));
	}
	if (selected(options.scope, "yorkie")) {
		checks.push(
			...(await runYorkieChecks(context, selectedYorkieConfiguration(context, options)))
		);
	}

	const summary = summarize(checks);
	const ok = summary.fail === 0 && (!options.strict || summary.warn === 0);
	return {
		command: "doctor",
		ok,
		exitCode: ok ? EXIT_SUCCESS : EXIT_FAILURE,
		root,
		strict: options.strict,
		checks,
		summary,
	};
}
