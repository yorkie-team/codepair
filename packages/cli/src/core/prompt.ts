import { createInterface } from "node:readline/promises";
import { ConfirmationDeclinedError, ConfirmationRequiredError, UsageError } from "./errors.js";

export async function confirmMutation(
	message: string,
	assumeYes: boolean,
	disablePrompt = false
): Promise<void> {
	if (assumeYes) return;
	if (disablePrompt || !process.stdin.isTTY || !process.stdout.isTTY) {
		throw new ConfirmationRequiredError();
	}

	const readline = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	try {
		const answer = (await readline.question(`${message} [y/N] `)).trim().toLowerCase();
		if (answer !== "y" && answer !== "yes") {
			throw new ConfirmationDeclinedError();
		}
	} finally {
		readline.close();
	}
}

export async function readPasswordFromStdin(): Promise<string> {
	if (process.stdin.isTTY) {
		throw new UsageError(
			"--password-stdin expects piped input. Use YORKIE_PASSWORD for an interactive shell.",
			"PASSWORD_STDIN_IS_TTY"
		);
	}

	const chunks: Buffer[] = [];
	let total = 0;
	for await (const chunk of process.stdin) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
		total += buffer.length;
		if (total > 64 * 1024) {
			throw new UsageError("Password input is unexpectedly large.", "PASSWORD_TOO_LARGE");
		}
		chunks.push(buffer);
	}
	const password = Buffer.concat(chunks)
		.toString("utf8")
		.replace(/[\r\n]+$/, "");
	if (!password) {
		throw new UsageError("Password from stdin is empty.", "EMPTY_PASSWORD");
	}
	return password;
}
