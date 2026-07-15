import { CommandRunner } from "../core/process.js";
import { readEnv, type ParsedEnvFile } from "../core/env-file.js";
import { resolveProjectPath } from "../core/project-root.js";

export interface DoctorContext {
	root: string;
	runner: CommandRunner;
	backendEnv: ParsedEnvFile;
	frontendEnv: ParsedEnvFile;
}

export interface DoctorContextOptions {
	backendEnvPath?: string;
	frontendEnvPath?: string;
}

export async function createDoctorContext(
	root: string,
	options: DoctorContextOptions = {}
): Promise<DoctorContext> {
	const [backendEnv, frontendEnv] = await Promise.all([
		readEnv(
			resolveProjectPath(root, options.backendEnvPath, [
				"packages",
				"backend",
				".env.development",
			])
		),
		readEnv(
			resolveProjectPath(root, options.frontendEnvPath, [
				"packages",
				"frontend",
				".env.development",
			])
		),
	]);
	return {
		root,
		runner: new CommandRunner(),
		backendEnv,
		frontendEnv,
	};
}

export function envValue(
	context: DoctorContext,
	key: string,
	preference: "backend" | "frontend" = "backend"
): string | undefined {
	const processValue = process.env[key]?.trim();
	if (processValue) return processValue;
	return preference === "backend"
		? context.backendEnv.values.get(key)
		: context.frontendEnv.values.get(key);
}
