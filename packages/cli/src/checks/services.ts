import { probeHttp, probeTcp, parseHostPort, originFromCallback } from "../adapters/network.js";
import type { DoctorCheck } from "../types.js";
import { envValue, type DoctorContext } from "./context.js";

function skipped(id: string, message: string): DoctorCheck {
	return { id, scope: "services", status: "skip", message };
}

export async function httpCheck(
	id: string,
	label: string,
	url: string | undefined,
	path: string
): Promise<DoctorCheck> {
	if (!url) return skipped(id, `${label} endpoint is not configured.`);
	let target: string;
	try {
		const base = new URL(url);
		if (base.username || base.password) {
			return {
				id,
				scope: "services",
				status: "fail",
				message: `${label} endpoint must not contain URL credentials.`,
				remediation: `Remove the username and password from the configured ${label} URL.`,
			};
		}
		target = new URL(path, base).toString();
	} catch {
		return {
			id,
			scope: "services",
			status: "fail",
			message: `${label} endpoint is invalid.`,
			remediation: `Correct the configured ${label} URL.`,
		};
	}
	const result = await probeHttp(target);
	return result.ok
		? {
				id,
				scope: "services",
				status: "pass",
				message: `${label} is reachable (${result.message}).`,
				details: { endpoint: target },
			}
		: {
				id,
				scope: "services",
				status: "fail",
				message: `${label} is not reachable.`,
				details: { endpoint: target, diagnostic: result.message },
				remediation: `Start ${label} and verify its configured address.`,
			};
}

async function tcpCheck(
	id: string,
	label: string,
	address: string | undefined,
	defaultPort: number
): Promise<DoctorCheck> {
	if (!address) return skipped(id, `${label} address is not configured.`);
	const endpoint = parseHostPort(address, defaultPort);
	if (!endpoint) {
		return {
			id,
			scope: "services",
			status: "fail",
			message: `${label} address is invalid.`,
			remediation: `Correct the configured ${label} address.`,
		};
	}
	const result = await probeTcp(endpoint.host, endpoint.port);
	return result.ok
		? {
				id,
				scope: "services",
				status: "pass",
				message: `${label} accepts TCP connections.`,
				details: endpoint,
			}
		: {
				id,
				scope: "services",
				status: "fail",
				message: `${label} is not reachable.`,
				details: { ...endpoint, diagnostic: result.message },
				remediation: `Start ${label} and verify networking from this host.`,
			};
}

export async function runServiceChecks(context: DoctorContext): Promise<DoctorCheck[]> {
	const callbackOrigin = originFromCallback(envValue(context, "GITHUB_CALLBACK_URL") ?? "");
	const backendBase =
		envValue(context, "VITE_API_ADDR", "frontend") ?? callbackOrigin ?? "http://localhost:3000";
	const yorkieAddress =
		envValue(context, "VITE_YORKIE_API_ADDR", "frontend") ??
		envValue(context, "YORKIE_API_ADDR") ??
		process.env.YORKIE_API_ADDR ??
		"localhost:8080";

	return await Promise.all([
		httpCheck("services.backend", "CodePair backend", backendBase, "/settings"),
		tcpCheck("services.yorkie", "Yorkie", yorkieAddress, 8080),
		tcpCheck("services.mongo", "MongoDB", envValue(context, "DATABASE_URL"), 27017),
		httpCheck("services.qdrant", "Qdrant", envValue(context, "QDRANT_URL"), "/healthz"),
		httpCheck("services.ollama", "Ollama", envValue(context, "OLLAMA_HOST_URL"), "/api/tags"),
		httpCheck(
			"services.minio",
			"MinIO",
			envValue(context, "MINIO_ENDPOINT"),
			"/minio/health/live"
		),
	]);
}
