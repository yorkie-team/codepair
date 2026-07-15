import { SafetyError, UsageError } from "./errors.js";

export type YorkieTransport = "secure" | "insecure";

export interface YorkieRpcEndpoint {
	rpcAddress: string;
	httpUrl: string;
	secure: boolean;
}

const URL_SCHEME = /^[A-Za-z][A-Za-z\d+.-]*:\/\//;

function requestedScheme(transport: YorkieTransport | undefined): "http:" | "https:" | undefined {
	if (transport === "secure") return "https:";
	if (transport === "insecure") return "http:";
	return undefined;
}

export function normalizeYorkieRpcEndpoint(
	value: string,
	transport?: YorkieTransport
): YorkieRpcEndpoint {
	const trimmed = value.trim();
	if (!trimmed) throw new UsageError("--rpc-addr must not be empty.");

	const hasScheme = URL_SCHEME.test(trimmed);
	let parsed: URL;
	try {
		parsed = new URL(hasScheme ? trimmed : `http://${trimmed}`);
	} catch (error) {
		throw new UsageError("Invalid Yorkie RPC address.", "INVALID_RPC_ADDRESS", {
			cause: error,
		});
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new UsageError("Yorkie RPC address must use http or https.", "INVALID_RPC_ADDRESS");
	}
	if (parsed.username || parsed.password) {
		throw new SafetyError(
			"Yorkie RPC address must not contain credentials.",
			"RPC_CREDENTIALS_REFUSED"
		);
	}
	if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
		throw new UsageError(
			"Yorkie RPC address must contain only a host and port.",
			"INVALID_RPC_ADDRESS"
		);
	}

	const explicitScheme = hasScheme ? parsed.protocol : undefined;
	const expectedScheme = requestedScheme(transport);
	if (explicitScheme && expectedScheme && explicitScheme !== expectedScheme) {
		const option = transport === "secure" ? "--secure" : "--insecure";
		throw new UsageError(
			`${option} conflicts with the ${explicitScheme.slice(0, -1)} scheme in --rpc-addr.`,
			"CONFLICTING_TRANSPORT_OPTIONS"
		);
	}

	const scheme = explicitScheme ?? expectedScheme ?? "http:";
	const port = parsed.port || (hasScheme ? (scheme === "https:" ? "443" : "80") : "8080");
	const rpcAddress = `${parsed.hostname}:${port}`;
	return {
		rpcAddress,
		httpUrl: `${scheme}//${rpcAddress}`,
		secure: scheme === "https:",
	};
}

export function getRpcHost(rpcAddress: string): string {
	return normalizeYorkieRpcEndpoint(rpcAddress).rpcAddress.replace(/:\d+$/, "");
}

export function isLoopbackHost(hostname: string): boolean {
	const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
	return (
		host === "localhost" ||
		host.endsWith(".localhost") ||
		host === "::1" ||
		host === "0:0:0:0:0:0:0:1" ||
		/^127(?:\.\d{1,3}){3}$/.test(host)
	);
}

export function assertSafeTransport(
	rpcAddress: string,
	insecure: boolean,
	allowInsecureRemote: boolean
): void {
	const host = getRpcHost(rpcAddress);
	if (insecure && !isLoopbackHost(host) && !allowInsecureRemote) {
		throw new SafetyError(
			`Refusing an insecure Yorkie login to non-loopback host ${host}. Use --secure, or explicitly pass --allow-insecure-remote if this is a trusted private network.`,
			"INSECURE_REMOTE_REFUSED"
		);
	}
}

export function validateWebhookUrl(value: string): URL {
	let parsed: URL;
	try {
		parsed = new URL(value);
	} catch (error) {
		throw new UsageError("Invalid webhook URL.", "INVALID_WEBHOOK_URL", {
			cause: error,
		});
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new UsageError("Webhook URL must use http or https.", "INVALID_WEBHOOK_URL");
	}
	if (parsed.username || parsed.password) {
		throw new SafetyError(
			"Webhook URL must not contain credentials. Configure authentication separately.",
			"WEBHOOK_CREDENTIALS_REFUSED"
		);
	}
	return parsed;
}
