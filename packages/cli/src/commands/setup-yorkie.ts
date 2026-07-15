import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { REQUIRED_EVENT, YorkieCli, type YorkieProject } from "../adapters/yorkie-cli.js";
import { UsageError, OperationalError } from "../core/errors.js";
import { parseEnv, readEnv, updateEnvFileAtomic } from "../core/env-file.js";
import { optionValue } from "../core/args.js";
import { CommandRunner } from "../core/process.js";
import { discoverProjectRoot, resolveProjectPath } from "../core/project-root.js";
import { confirmMutation, readPasswordFromStdin } from "../core/prompt.js";
import {
	assertSafeTransport,
	normalizeYorkieRpcEndpoint,
	validateWebhookUrl,
	type YorkieRpcEndpoint,
	type YorkieTransport,
} from "../core/url.js";
import { EXIT_SUCCESS, type SetupAction, type SetupResult } from "../types.js";

export interface SetupYorkieOptions {
	root?: string;
	rpcAddress?: string;
	projectName: string;
	username: string;
	passwordFromStdin: boolean;
	webhookUrl: string;
	backendEnvPath?: string;
	frontendEnvPath?: string;
	secure?: boolean;
	allowInsecureRemote: boolean;
	legacyEnvironmentKeysOnly: boolean;
	yes: boolean;
	dryRun: boolean;
}

function environment(name: string, fallback: string): string {
	return process.env[name]?.trim() || fallback;
}

function optionalEnvironment(name: string): string | undefined {
	return process.env[name]?.trim() || undefined;
}

export function parseSetupYorkieOptions(
	tokens: readonly string[],
	root?: string
): SetupYorkieOptions {
	let transportMode: YorkieTransport | undefined;
	const options: SetupYorkieOptions = {
		root,
		rpcAddress: optionalEnvironment("YORKIE_API_ADDR"),
		projectName: environment("YORKIE_PROJECT_NAME", "codepair"),
		username: environment("YORKIE_USERNAME", "admin"),
		passwordFromStdin: false,
		webhookUrl: environment(
			"WEBHOOK_URL",
			"http://host.docker.internal:3000/yorkie/document-events"
		),
		backendEnvPath: process.env.BACKEND_ENV_FILE,
		frontendEnvPath: process.env.FRONTEND_ENV_FILE,
		allowInsecureRemote: false,
		legacyEnvironmentKeysOnly: process.env.CODEPAIR_LEGACY_SETUP === "1",
		yes: false,
		dryRun: false,
	};

	for (let index = 0; index < tokens.length; ) {
		const token = tokens[index];
		const stringOptions: Array<[keyof SetupYorkieOptions, string]> = [
			["rpcAddress", "--rpc-addr"],
			["projectName", "--project"],
			["username", "--username"],
			["webhookUrl", "--webhook-url"],
			["backendEnvPath", "--backend-env"],
			["frontendEnvPath", "--frontend-env"],
		];
		let matched = false;
		for (const [key, name] of stringOptions) {
			const parsed = optionValue(tokens, index, name);
			if (!parsed) continue;
			(options as unknown as Record<string, unknown>)[key] = parsed.value;
			index += parsed.consumed;
			matched = true;
			break;
		}
		if (matched) continue;

		switch (token) {
			case "--password-stdin":
				options.passwordFromStdin = true;
				break;
			case "--secure":
				if (transportMode === "insecure") {
					throw new UsageError(
						"--secure and --insecure cannot be used together.",
						"CONFLICTING_TRANSPORT_OPTIONS"
					);
				}
				transportMode = "secure";
				options.secure = true;
				break;
			case "--insecure":
				if (transportMode === "secure") {
					throw new UsageError(
						"--secure and --insecure cannot be used together.",
						"CONFLICTING_TRANSPORT_OPTIONS"
					);
				}
				transportMode = "insecure";
				options.secure = false;
				break;
			case "--allow-insecure-remote":
				options.allowInsecureRemote = true;
				break;
			case "--yes":
			case "-y":
				options.yes = true;
				break;
			case "--dry-run":
				options.dryRun = true;
				break;
			default:
				throw new UsageError(`Unknown setup yorkie option: ${token}`, "UNKNOWN_OPTION");
		}
		index += 1;
	}

	if (!options.projectName.trim()) throw new UsageError("--project must not be empty.");
	if (!options.username.trim()) throw new UsageError("--username must not be empty.");
	if (options.rpcAddress !== undefined) {
		const endpoint = normalizeYorkieRpcEndpoint(options.rpcAddress, transportMode);
		options.rpcAddress = endpoint.rpcAddress;
		options.secure = endpoint.secure;
	}
	return options;
}

async function exists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function templateContent(
	root: string,
	target: string,
	area: "backend" | "frontend"
): Promise<string> {
	if (await exists(target)) return "";
	const template = resolve(root, "packages", area, ".env.example");
	try {
		return await readFile(template, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
		throw error;
	}
}

interface EnvironmentSeed {
	backendInitialContent: string;
	frontendInitialContent: string;
}

function selectedSeedRpcAddress(seed: EnvironmentSeed): string | undefined {
	const backendAddress = parseEnv(seed.backendInitialContent).get("YORKIE_API_ADDR")?.trim();
	const frontendAddress = parseEnv(seed.frontendInitialContent)
		.get("VITE_YORKIE_API_ADDR")
		?.trim();
	if (backendAddress && frontendAddress) {
		const backendEndpoint = normalizeYorkieRpcEndpoint(backendAddress);
		const frontendEndpoint = normalizeYorkieRpcEndpoint(frontendAddress);
		if (backendEndpoint.httpUrl !== frontendEndpoint.httpUrl) {
			throw new UsageError(
				"Backend and frontend Yorkie addresses differ. Pass --rpc-addr to select one explicitly.",
				"CONFLICTING_YORKIE_ADDRESSES"
			);
		}
	}
	return backendAddress || frontendAddress;
}

async function prepareEnvironmentSeed(
	root: string,
	backendEnvPath: string,
	frontendEnvPath: string,
	seedExamples: boolean
): Promise<EnvironmentSeed> {
	const backendFile = await readEnv(backendEnvPath);
	const frontendFile = await readEnv(frontendEnvPath);
	const backendInitialContent = backendFile.exists
		? backendFile.content
		: seedExamples
			? await templateContent(root, backendEnvPath, "backend")
			: "";
	const frontendInitialContent = frontendFile.exists
		? frontendFile.content
		: seedExamples
			? await templateContent(root, frontendEnvPath, "frontend")
			: "";

	return {
		backendInitialContent,
		frontendInitialContent,
	};
}

function findProject(projects: readonly YorkieProject[], name: string): YorkieProject | undefined {
	return projects.find((project) => project.name === name);
}

function assertProjectPostconditions(
	project: YorkieProject | undefined,
	projectName: string,
	webhookUrl: string
): asserts project is YorkieProject & { secretKey: string; publicKey: string } {
	if (!project) {
		throw new OperationalError(
			`Yorkie project ${projectName} was not found after setup.`,
			"PROJECT_VERIFICATION_FAILED"
		);
	}
	if (!project.secretKey || !project.publicKey) {
		throw new OperationalError(
			"Yorkie project is missing its public or secret key after setup.",
			"PROJECT_KEYS_MISSING"
		);
	}
	if (project.eventWebhookUrl !== webhookUrl) {
		throw new OperationalError(
			"Yorkie event webhook URL did not match after setup.",
			"WEBHOOK_VERIFICATION_FAILED"
		);
	}
	if (!project.eventWebhookEvents.includes(REQUIRED_EVENT)) {
		throw new OperationalError(
			`${REQUIRED_EVENT} was not enabled after setup.`,
			"WEBHOOK_EVENT_VERIFICATION_FAILED"
		);
	}
}

async function verifyEnvValue(path: string, key: string, expected: string): Promise<void> {
	const file = await readEnv(path);
	if (file.values.get(key) !== expected) {
		throw new OperationalError(
			`Failed to verify ${key} in ${path}.`,
			"ENV_VERIFICATION_FAILED"
		);
	}
}

export async function runSetupYorkie(
	options: SetupYorkieOptions,
	runtime: { disablePrompt?: boolean } = {}
): Promise<SetupResult> {
	const root = await discoverProjectRoot(options.root);
	const backendEnvPath = resolveProjectPath(root, options.backendEnvPath, [
		"packages",
		"backend",
		".env.development",
	]);
	const frontendEnvPath = resolveProjectPath(root, options.frontendEnvPath, [
		"packages",
		"frontend",
		".env.development",
	]);
	validateWebhookUrl(options.webhookUrl);
	const seed = await prepareEnvironmentSeed(
		root,
		backendEnvPath,
		frontendEnvPath,
		!options.legacyEnvironmentKeysOnly
	);
	const transport: YorkieTransport | undefined =
		options.secure === undefined ? undefined : options.secure ? "secure" : "insecure";
	const endpoint: YorkieRpcEndpoint = normalizeYorkieRpcEndpoint(
		options.rpcAddress ?? selectedSeedRpcAddress(seed) ?? "localhost:8080",
		transport
	);
	assertSafeTransport(endpoint.rpcAddress, !endpoint.secure, options.allowInsecureRemote);

	const actions: SetupAction[] = [];
	const runner = new CommandRunner();
	const yorkie = new YorkieCli(runner, endpoint.rpcAddress);
	await yorkie.assertAvailable();

	if (options.dryRun) {
		actions.push(
			{
				id: "yorkie.login",
				status: "planned",
				message: `Log in to Yorkie at ${endpoint.rpcAddress}.`,
			},
			{
				id: "yorkie.project",
				status: "planned",
				message: `Ensure Yorkie project ${options.projectName} exists.`,
			},
			{
				id: "yorkie.webhook",
				status: "planned",
				message: `Configure the ${REQUIRED_EVENT} event webhook.`,
			},
			{
				id: "env.backend",
				status: "planned",
				message: `Update ${backendEnvPath}.`,
			},
			{
				id: "env.frontend",
				status: "planned",
				message: `Update ${frontendEnvPath}.`,
			}
		);
		return {
			command: "setup yorkie",
			ok: true,
			exitCode: EXIT_SUCCESS,
			root,
			dryRun: true,
			changed: true,
			actions,
		};
	}

	await confirmMutation(
		`Configure Yorkie project ${options.projectName} at ${endpoint.rpcAddress} and update two environment files?`,
		options.yes,
		runtime.disablePrompt
	);
	const password = options.passwordFromStdin
		? await readPasswordFromStdin()
		: environment("YORKIE_PASSWORD", "admin");
	runner.addSecret(password);

	await yorkie.login(options.username, password, !endpoint.secure);
	actions.push({
		id: "yorkie.login",
		status: "unchanged",
		message: `Authenticated to Yorkie at ${endpoint.rpcAddress}.`,
	});

	let projects = await yorkie.listProjects();
	let project = findProject(projects, options.projectName);
	let changed = false;
	if (!project) {
		await yorkie.createProject(options.projectName);
		changed = true;
		actions.push({
			id: "yorkie.project",
			status: "changed",
			message: `Created Yorkie project ${options.projectName}.`,
		});
		projects = await yorkie.listProjects();
		project = findProject(projects, options.projectName);
	} else {
		actions.push({
			id: "yorkie.project",
			status: "unchanged",
			message: `Yorkie project ${options.projectName} already exists.`,
		});
	}

	if (!project) {
		throw new OperationalError(
			`Yorkie project ${options.projectName} was not visible after creation.`,
			"PROJECT_CREATION_FAILED"
		);
	}
	const webhookNeedsUpdate =
		project.eventWebhookUrl !== options.webhookUrl ||
		!project.eventWebhookEvents.includes(REQUIRED_EVENT);
	if (webhookNeedsUpdate) {
		await yorkie.configureEventWebhook(options.projectName, options.webhookUrl);
		changed = true;
		actions.push({
			id: "yorkie.webhook",
			status: "changed",
			message: `Configured the ${REQUIRED_EVENT} event webhook.`,
		});
	} else {
		actions.push({
			id: "yorkie.webhook",
			status: "unchanged",
			message: `The ${REQUIRED_EVENT} event webhook is already configured.`,
		});
	}

	project = findProject(await yorkie.listProjects(), options.projectName);
	assertProjectPostconditions(project, options.projectName, options.webhookUrl);
	runner.addSecret(project.secretKey);

	const backendUpdates: Readonly<Record<string, string>> = options.legacyEnvironmentKeysOnly
		? { YORKIE_PROJECT_SECRET_KEY: project.secretKey }
		: {
				YORKIE_API_ADDR: endpoint.httpUrl,
				YORKIE_PROJECT_SECRET_KEY: project.secretKey,
			};
	const frontendUpdates: Readonly<Record<string, string>> = options.legacyEnvironmentKeysOnly
		? { VITE_YORKIE_API_KEY: project.publicKey }
		: {
				VITE_YORKIE_API_ADDR: endpoint.httpUrl,
				VITE_YORKIE_API_KEY: project.publicKey,
			};
	const backendChanged = await updateEnvFileAtomic(backendEnvPath, backendUpdates, {
		mode: 0o600,
		initialContent: seed.backendInitialContent,
	});
	const frontendChanged = await updateEnvFileAtomic(frontendEnvPath, frontendUpdates, {
		mode: 0o600,
		initialContent: seed.frontendInitialContent,
	});
	changed ||= backendChanged || frontendChanged;
	actions.push(
		{
			id: "env.backend",
			status: backendChanged ? "changed" : "unchanged",
			message: `${backendChanged ? "Updated" : "Verified"} backend environment file ${backendEnvPath}.`,
		},
		{
			id: "env.frontend",
			status: frontendChanged ? "changed" : "unchanged",
			message: `${frontendChanged ? "Updated" : "Verified"} frontend environment file ${frontendEnvPath}.`,
		}
	);

	if (!options.legacyEnvironmentKeysOnly) {
		await verifyEnvValue(backendEnvPath, "YORKIE_API_ADDR", endpoint.httpUrl);
		await verifyEnvValue(frontendEnvPath, "VITE_YORKIE_API_ADDR", endpoint.httpUrl);
	}
	await verifyEnvValue(backendEnvPath, "YORKIE_PROJECT_SECRET_KEY", project.secretKey);
	await verifyEnvValue(frontendEnvPath, "VITE_YORKIE_API_KEY", project.publicKey);
	actions.push({
		id: "verify",
		status: "unchanged",
		message: "Verified Yorkie project, webhook, events, and environment files.",
	});

	return {
		command: "setup yorkie",
		ok: true,
		exitCode: EXIT_SUCCESS,
		root,
		dryRun: false,
		changed,
		actions,
	};
}
