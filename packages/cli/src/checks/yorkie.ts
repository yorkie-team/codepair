import { REQUIRED_EVENT, YorkieCli } from "../adapters/yorkie-cli.js";
import {
	normalizeYorkieRpcEndpoint,
	validateWebhookUrl,
	type YorkieRpcEndpoint,
} from "../core/url.js";
import type { DoctorCheck } from "../types.js";
import type { DoctorContext } from "./context.js";

export interface YorkieCheckOptions {
	rpcAddress: string;
	projectName: string;
	webhookUrl: string;
}

function configurationFailure(message: string, remediation: string): DoctorCheck {
	return {
		id: "yorkie.configuration",
		scope: "yorkie",
		status: "fail",
		message,
		remediation,
	};
}

function localAddressProblem(context: DoctorContext): DoctorCheck | undefined {
	const configured = [
		["YORKIE_API_ADDR", context.backendEnv.values.get("YORKIE_API_ADDR")?.trim()],
		["VITE_YORKIE_API_ADDR", context.frontendEnv.values.get("VITE_YORKIE_API_ADDR")?.trim()],
	] as const;
	const endpoints: Array<readonly [string, YorkieRpcEndpoint]> = [];
	for (const [name, value] of configured) {
		if (!value) continue;
		try {
			endpoints.push([name, normalizeYorkieRpcEndpoint(value)] as const);
		} catch {
			return configurationFailure(
				`${name} is not a valid Yorkie address.`,
				`Correct ${name}, then rerun codepair doctor.`
			);
		}
	}
	if (endpoints.length === 2 && endpoints[0]?.[1].httpUrl !== endpoints[1]?.[1].httpUrl) {
		return configurationFailure(
			"Backend and frontend Yorkie addresses do not match.",
			"Run codepair setup yorkie with an explicit --rpc-addr to synchronize both files."
		);
	}
	return undefined;
}

function localProjectKeyCheck(
	id: string,
	label: string,
	configured: string | undefined,
	projectValue: string | undefined
): DoctorCheck {
	if (!projectValue) {
		return {
			id,
			scope: "yorkie",
			status: "skip",
			message: `${label} cannot be compared because the project key is unavailable.`,
		};
	}
	if (!configured) {
		return {
			id,
			scope: "yorkie",
			status: "fail",
			message: `${label} is not configured.`,
			remediation: "Run codepair setup yorkie to synchronize local project keys.",
		};
	}
	if (configured === projectValue) {
		return {
			id,
			scope: "yorkie",
			status: "pass",
			message: `${label} matches the selected Yorkie project.`,
		};
	}
	return {
		id,
		scope: "yorkie",
		status: "fail",
		message: `${label} does not match the selected Yorkie project.`,
		remediation: "Run codepair setup yorkie to synchronize local project keys.",
	};
}

export async function runYorkieChecks(
	context: DoctorContext,
	options: YorkieCheckOptions
): Promise<DoctorCheck[]> {
	const localProblem = localAddressProblem(context);
	if (localProblem) return [localProblem];

	let endpoint: YorkieRpcEndpoint;
	try {
		endpoint = normalizeYorkieRpcEndpoint(options.rpcAddress);
		validateWebhookUrl(options.webhookUrl);
	} catch {
		return [
			configurationFailure(
				"The selected Yorkie address or webhook URL is invalid.",
				"Correct the environment value or pass a valid doctor option."
			),
		];
	}
	const cli = new YorkieCli(context.runner, endpoint.rpcAddress);

	try {
		await cli.assertAvailable();
	} catch {
		return [
			{
				id: "yorkie.cli",
				scope: "yorkie",
				status: "fail",
				message: "Yorkie CLI is not available.",
				remediation: "Install Yorkie CLI and ensure yorkie is on PATH.",
			},
		];
	}

	let projects;
	try {
		projects = await cli.listProjects();
	} catch {
		return [
			{
				id: "yorkie.connection",
				scope: "yorkie",
				status: "fail",
				message: `Could not list Yorkie projects at ${endpoint.rpcAddress}.`,
				remediation: "Run codepair setup yorkie or log in with Yorkie CLI.",
			},
		];
	}

	const project = projects.find((candidate) => candidate.name === options.projectName);
	if (!project) {
		return [
			{
				id: "yorkie.project",
				scope: "yorkie",
				status: "fail",
				message: `Yorkie project ${options.projectName} does not exist.`,
				remediation: "Run codepair setup yorkie to create and configure it.",
			},
		];
	}

	const keysPresent = Boolean(project.secretKey && project.publicKey);
	const backendSecret = context.backendEnv.values.get("YORKIE_PROJECT_SECRET_KEY");
	const frontendPublicKey = context.frontendEnv.values.get("VITE_YORKIE_API_KEY");
	const webhookMatches = project.eventWebhookUrl === options.webhookUrl;
	const eventPresent = project.eventWebhookEvents.includes(REQUIRED_EVENT);
	return [
		{
			id: "yorkie.project",
			scope: "yorkie",
			status: "pass",
			message: `Yorkie project ${options.projectName} exists.`,
		},
		keysPresent
			? {
					id: "yorkie.keys",
					scope: "yorkie",
					status: "pass",
					message: "Yorkie project public and secret keys are available.",
				}
			: {
					id: "yorkie.keys",
					scope: "yorkie",
					status: "fail",
					message: "Yorkie project data is missing a public or secret key.",
					remediation: "Verify Yorkie CLI/server compatibility and project permissions.",
				},
		localProjectKeyCheck(
			"yorkie.backend-key",
			"Backend Yorkie project secret",
			backendSecret,
			project.secretKey
		),
		localProjectKeyCheck(
			"yorkie.frontend-key",
			"Frontend Yorkie API key",
			frontendPublicKey,
			project.publicKey
		),
		webhookMatches && eventPresent
			? {
					id: "yorkie.webhook",
					scope: "yorkie",
					status: "pass",
					message: "Yorkie DocumentRootChanged event webhook is configured.",
				}
			: {
					id: "yorkie.webhook",
					scope: "yorkie",
					status: "fail",
					message: "Yorkie event webhook does not match the expected URL and event.",
					details: {
						urlMatches: webhookMatches,
						documentRootChangedEnabled: eventPresent,
					},
					remediation: "Run codepair setup yorkie with the intended --webhook-url.",
				},
	];
}
