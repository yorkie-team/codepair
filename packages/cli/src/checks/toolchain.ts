import type { DoctorCheck } from "../types.js";
import type { DoctorContext } from "./context.js";

interface ToolProbe {
	id: string;
	command: string;
	args: string[];
	remediationCommand?: string;
	required: boolean;
	label: string;
	expectedMajor?: number;
}

function nodeCheck(): DoctorCheck {
	const major = Number(process.versions.node.split(".")[0]);
	if (major === 20 || major === 22 || major === 24) {
		return {
			id: "toolchain.node",
			scope: "toolchain",
			status: "pass",
			message: `Node.js ${process.versions.node} is supported.`,
		};
	}
	return {
		id: "toolchain.node",
		scope: "toolchain",
		status: "fail",
		message: `Node.js ${process.versions.node} is not supported.`,
		remediation: "Install a supported LTS release: Node.js 20, 22, or 24.",
	};
}

function firstVersionMajor(output: string): number | undefined {
	const match = /(?:^|\s|v)(\d+)\.\d+(?:\.\d+)?(?:\s|$)/.exec(output.trim());
	if (!match?.[1]) return undefined;
	const major = Number(match[1]);
	return Number.isInteger(major) ? major : undefined;
}

async function probeTool(context: DoctorContext, probe: ToolProbe): Promise<DoctorCheck> {
	const remediationCommand = probe.remediationCommand ?? probe.command;
	try {
		const result = await context.runner.run(probe.command, probe.args, {
			allowFailure: true,
			timeoutMs: 5_000,
		});
		if (result.exitCode === 0) {
			const version = (result.stdout || result.stderr).trim().split(/\r?\n/)[0];
			if (probe.expectedMajor !== undefined) {
				const major = firstVersionMajor(version ?? "");
				if (major !== probe.expectedMajor) {
					return {
						id: probe.id,
						scope: "toolchain",
						status: "fail",
						message: `${probe.label} ${version || "with an unknown version"} is not supported.`,
						remediation: `Install ${probe.label} ${probe.expectedMajor}.x.`,
					};
				}
			}
			return {
				id: probe.id,
				scope: "toolchain",
				status: "pass",
				message: `${probe.label} is available${version ? ` (${version})` : ""}.`,
			};
		}
		return {
			id: probe.id,
			scope: "toolchain",
			status: probe.required ? "fail" : "warn",
			message: `${probe.label} returned exit code ${result.exitCode}.`,
			remediation: `Verify that ${remediationCommand} is installed and usable from this shell.`,
		};
	} catch {
		return {
			id: probe.id,
			scope: "toolchain",
			status: probe.required ? "fail" : "warn",
			message: `${probe.label} is not available.`,
			remediation: `Install ${probe.label} and ensure ${remediationCommand} is on PATH.`,
		};
	}
}

export async function runToolchainChecks(context: DoctorContext): Promise<DoctorCheck[]> {
	const probes: ToolProbe[] = [
		{
			id: "toolchain.pnpm",
			command: process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "pnpm",
			args:
				process.platform === "win32" ? ["/d", "/s", "/c", "pnpm --version"] : ["--version"],
			remediationCommand: "pnpm",
			required: true,
			label: "pnpm",
			expectedMajor: 9,
		},
		{
			id: "toolchain.yorkie",
			command: "yorkie",
			args: ["--help"],
			required: true,
			label: "Yorkie CLI",
		},
		{
			id: "toolchain.docker",
			command: "docker",
			args: ["--version"],
			required: true,
			label: "Docker",
		},
		{
			id: "toolchain.compose",
			command: "docker",
			args: ["compose", "version"],
			required: true,
			label: "Docker Compose",
		},
	];
	return [
		nodeCheck(),
		...(await Promise.all(probes.map(async (probe) => await probeTool(context, probe)))),
	];
}
