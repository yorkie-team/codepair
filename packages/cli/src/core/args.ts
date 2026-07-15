import { UsageError } from "./errors.js";

export interface GlobalOptions {
	json: boolean;
	help: boolean;
	version: boolean;
	root?: string;
}

export interface GlobalParseResult {
	options: GlobalOptions;
	remaining: string[];
}

function requireValue(tokens: readonly string[], index: number, option: string): string {
	const value = tokens[index + 1];
	if (!value || value.startsWith("-")) {
		throw new UsageError(`${option} requires a value.`, "MISSING_OPTION_VALUE");
	}
	return value;
}

export function extractGlobalOptions(tokens: readonly string[]): GlobalParseResult {
	const options: GlobalOptions = { json: false, help: false, version: false };
	const remaining: string[] = [];

	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (token === "--json") {
			options.json = true;
		} else if (token === "--help" || token === "-h") {
			options.help = true;
		} else if (token === "--version" || token === "-V") {
			options.version = true;
		} else if (token === "--root") {
			options.root = requireValue(tokens, index, token);
			index += 1;
		} else if (token?.startsWith("--root=")) {
			const value = token.slice("--root=".length);
			if (!value) throw new UsageError("--root requires a value.");
			options.root = value;
		} else if (token !== undefined) {
			remaining.push(token);
		}
	}

	return { options, remaining };
}

export function optionValue(
	tokens: readonly string[],
	index: number,
	name: string
): { value: string; consumed: number } | undefined {
	const token = tokens[index];
	if (token === name) {
		return { value: requireValue(tokens, index, name), consumed: 2 };
	}
	if (token?.startsWith(`${name}=`)) {
		const value = token.slice(name.length + 1);
		if (!value) throw new UsageError(`${name} requires a value.`);
		return { value, consumed: 1 };
	}
	return undefined;
}
