import { connect } from "node:net";

export interface ProbeResult {
	ok: boolean;
	message: string;
	statusCode?: number;
}

export async function probeHttp(url: string, timeoutMs = 2_000): Promise<ProbeResult> {
	try {
		const response = await fetch(url, {
			method: "GET",
			redirect: "manual",
			signal: AbortSignal.timeout(timeoutMs),
		});
		return {
			ok: response.status >= 200 && response.status < 400,
			message: `HTTP ${response.status}`,
			statusCode: response.status,
		};
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

export async function probeTcp(
	host: string,
	port: number,
	timeoutMs = 2_000
): Promise<ProbeResult> {
	return await new Promise<ProbeResult>((resolve) => {
		let settled = false;
		const socket = connect({ host, port });
		const finish = (result: ProbeResult): void => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			socket.destroy();
			resolve(result);
		};
		const timer = setTimeout(
			() => finish({ ok: false, message: "connection timed out" }),
			timeoutMs
		);
		timer.unref();
		socket.once("connect", () => finish({ ok: true, message: "TCP connection succeeded" }));
		socket.once("error", (error) => finish({ ok: false, message: error.message }));
	});
}

export function parseHostPort(
	value: string,
	defaultPort: number
): { host: string; port: number } | undefined {
	try {
		const url = new URL(value.includes("://") ? value : `http://${value}`);
		const port = url.port ? Number(url.port) : defaultPort;
		if (!url.hostname || !Number.isInteger(port) || port < 1 || port > 65_535) {
			return undefined;
		}
		const host = url.hostname.replace(/^\[|\]$/g, "");
		return { host, port };
	} catch {
		return undefined;
	}
}

export function originFromCallback(value: string): string | undefined {
	try {
		return new URL(value).origin;
	} catch {
		return undefined;
	}
}
