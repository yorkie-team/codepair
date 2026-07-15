import { open, mkdir, readFile, rename, stat, unlink } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export interface ParsedEnvFile {
	exists: boolean;
	path: string;
	values: Map<string, string>;
	content: string;
}

const ENV_ASSIGNMENT = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/;

function decodeEnvValue(raw: string): string {
	const trimmed = raw.trim();
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
		try {
			return JSON.parse(trimmed) as string;
		} catch {
			return trimmed.slice(1, -1);
		}
	}
	if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
		return trimmed.slice(1, -1);
	}
	return trimmed.replace(/\s+#.*$/, "").trim();
}

export function parseEnv(content: string): Map<string, string> {
	const values = new Map<string, string>();
	for (const line of content.split(/\r?\n/)) {
		const match = ENV_ASSIGNMENT.exec(line);
		if (!match?.[1]) continue;
		const equalsIndex = line.indexOf("=");
		values.set(match[1], decodeEnvValue(line.slice(equalsIndex + 1)));
	}
	return values;
}

export async function readEnv(path: string): Promise<ParsedEnvFile> {
	const absolutePath = resolve(path);
	try {
		const content = await readFile(absolutePath, "utf8");
		return {
			exists: true,
			path: absolutePath,
			values: parseEnv(content),
			content,
		};
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return {
				exists: false,
				path: absolutePath,
				values: new Map<string, string>(),
				content: "",
			};
		}
		throw error;
	}
}

function quoteEnvValue(value: string): string {
	return JSON.stringify(value);
}

export function updateEnvContent(
	content: string,
	updates: Readonly<Record<string, string>>
): string {
	for (const key of Object.keys(updates)) {
		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
			throw new Error(`Invalid environment variable name: ${key}`);
		}
	}

	const newline = content.includes("\r\n") ? "\r\n" : "\n";
	const hadTrailingNewline = content.endsWith("\n");
	const lines = content.length > 0 ? content.split(/\r?\n/) : [];
	if (hadTrailingNewline) lines.pop();
	const remaining = new Set(Object.keys(updates));
	const seen = new Set<string>();
	const output: string[] = [];

	for (const line of lines) {
		const match = ENV_ASSIGNMENT.exec(line);
		const key = match?.[1];
		if (!key || !(key in updates)) {
			output.push(line);
			continue;
		}
		if (seen.has(key)) continue;
		seen.add(key);
		remaining.delete(key);
		output.push(`${key}=${quoteEnvValue(updates[key] ?? "")}`);
	}

	if (remaining.size > 0 && output.length > 0 && output.at(-1) !== "") {
		output.push("");
	}
	for (const key of remaining) {
		output.push(`${key}=${quoteEnvValue(updates[key] ?? "")}`);
	}

	if (output.length === 0) return "";
	return `${output.join(newline)}${newline}`;
}

export async function updateEnvFileAtomic(
	path: string,
	updates: Readonly<Record<string, string>>,
	options: { mode?: number; initialContent?: string } = {}
): Promise<boolean> {
	const absolutePath = resolve(path);
	const existing = await readEnv(absolutePath);
	const content = existing.exists ? existing.content : (options.initialContent ?? "");
	const updated = updateEnvContent(content, updates);
	if (existing.exists && updated === content) return false;

	await mkdir(dirname(absolutePath), { recursive: true });
	let mode = options.mode ?? 0o600;
	if (existing.exists && options.mode === undefined) {
		mode = (await stat(absolutePath)).mode & 0o777;
	}
	const temporaryPath = resolve(
		dirname(absolutePath),
		`.${basename(absolutePath)}.${process.pid}.${randomUUID()}.tmp`
	);
	const handle = await open(temporaryPath, "wx", mode);
	try {
		await handle.writeFile(updated, "utf8");
		await handle.sync();
		await handle.chmod(mode);
		await handle.close();
		await rename(temporaryPath, absolutePath);
	} catch (error) {
		await handle.close().catch(() => undefined);
		await unlink(temporaryPath).catch(() => undefined);
		throw error;
	}
	return true;
}
