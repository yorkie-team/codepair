import { access, readFile, realpath } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, isAbsolute, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { UsageError } from "./errors.js";

export function resolveProjectPath(
	root: string,
	configuredPath: string | undefined,
	fallback: readonly string[]
): string {
	if (!configuredPath) return resolve(root, ...fallback);
	return isAbsolute(configuredPath) ? configuredPath : resolve(root, configuredPath);
}

async function exists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

export async function isCodePairRoot(candidate: string): Promise<boolean> {
	const packagePath = resolve(candidate, "package.json");
	if (
		!(await exists(packagePath)) ||
		!(await exists(resolve(candidate, "pnpm-workspace.yaml"))) ||
		!(await exists(resolve(candidate, "packages", "backend"))) ||
		!(await exists(resolve(candidate, "packages", "frontend")))
	) {
		return false;
	}

	try {
		const parsed = JSON.parse(await readFile(packagePath, "utf8")) as {
			name?: unknown;
		};
		return parsed.name === "codepair";
	} catch {
		return false;
	}
}

async function searchUp(start: string): Promise<string | undefined> {
	let current = resolve(start);
	const root = parse(current).root;
	while (true) {
		if (await isCodePairRoot(current)) {
			return await realpath(current);
		}
		if (current === root) return undefined;
		current = dirname(current);
	}
}

export async function discoverProjectRoot(explicitRoot?: string): Promise<string> {
	if (explicitRoot) {
		const candidate = resolve(explicitRoot);
		if (!(await isCodePairRoot(candidate))) {
			throw new UsageError(
				`${candidate} is not a CodePair project root (expected package.json, pnpm-workspace.yaml, packages/backend, and packages/frontend).`,
				"INVALID_PROJECT_ROOT"
			);
		}
		return await realpath(candidate);
	}

	const environmentRoot = process.env.CODEPAIR_ROOT;
	if (environmentRoot) {
		return await discoverProjectRoot(environmentRoot);
	}

	const moduleDirectory = dirname(fileURLToPath(import.meta.url));
	for (const start of [process.cwd(), moduleDirectory]) {
		const found = await searchUp(start);
		if (found) return found;
	}

	throw new UsageError(
		"Could not find a CodePair project root. Run inside the repository or pass --root PATH.",
		"PROJECT_ROOT_NOT_FOUND"
	);
}
