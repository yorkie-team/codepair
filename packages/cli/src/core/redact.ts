const SENSITIVE_KEY =
	/(?:password|passwd|secret|authorization|credential|private[_-]?key|access[_-]?token|refresh[_-]?token|api[_-]?key)/i;

export const REDACTED = "[REDACTED]";

export function redactText(value: string, secrets: Iterable<string> = []): string {
	let result = value;
	const orderedSecrets = [...secrets]
		.filter((secret) => secret.length > 0)
		.sort((left, right) => right.length - left.length);

	for (const secret of orderedSecrets) {
		result = result.split(secret).join(REDACTED);
	}

	result = result.replace(
		/((?:password|passwd|secret|authorization|credential|private[_-]?key|access[_-]?token|refresh[_-]?token|api[_-]?key|token)\s*[=:]\s*)([^\s,;]+)/gi,
		`$1${REDACTED}`
	);
	return result;
}

export function redactCommandArgs(args: readonly string[]): string[] {
	const result: string[] = [];
	let redactNext = false;
	for (const arg of args) {
		if (redactNext) {
			result.push(REDACTED);
			redactNext = false;
			continue;
		}
		if (arg === "-p" || arg === "--password" || arg === "--token") {
			result.push(arg);
			redactNext = true;
			continue;
		}
		if (/^--(?:password|token)=/i.test(arg)) {
			result.push(`${arg.slice(0, arg.indexOf("=") + 1)}${REDACTED}`);
			continue;
		}
		result.push(arg);
	}
	return result;
}

export function redactValue(value: unknown, secrets: Iterable<string> = []): unknown {
	return redactValueInternal(value, secrets, new WeakSet<object>());
}

function redactValueInternal(
	value: unknown,
	secrets: Iterable<string>,
	seen: WeakSet<object>
): unknown {
	if (typeof value === "string") {
		return redactText(value, secrets);
	}
	if (value === null || typeof value !== "object") {
		return value;
	}
	if (seen.has(value)) {
		return "[Circular]";
	}
	seen.add(value);

	if (Array.isArray(value)) {
		return value.map((entry) => redactValueInternal(entry, secrets, seen));
	}

	const output: Record<string, unknown> = {};
	for (const [key, entry] of Object.entries(value)) {
		output[key] = SENSITIVE_KEY.test(key)
			? REDACTED
			: redactValueInternal(entry, secrets, seen);
	}
	return output;
}
