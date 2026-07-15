import { spawn } from "node:child_process";
import { OperationalError } from "./errors.js";
import { redactCommandArgs, redactText } from "./redact.js";

const DEFAULT_TIMEOUT_MS = 15_000;
const TERMINATION_GRACE_MS = 250;
const MAX_CAPTURE_BYTES = 4 * 1024 * 1024;

export interface CommandResult {
	command: string;
	args: string[];
	exitCode: number;
	stdout: string;
	stderr: string;
}

export interface RunCommandOptions {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	input?: string;
	timeoutMs?: number;
	allowFailure?: boolean;
}

export class CommandRunner {
	readonly #secrets = new Set<string>();

	addSecret(secret: string | undefined): void {
		if (secret) {
			this.#secrets.add(secret);
		}
	}

	get secrets(): ReadonlySet<string> {
		return this.#secrets;
	}

	async run(
		command: string,
		args: readonly string[],
		options: RunCommandOptions = {}
	): Promise<CommandResult> {
		const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		return await new Promise<CommandResult>((resolve, reject) => {
			let stdout = "";
			let stderr = "";
			let settled = false;
			let timedOut = false;
			let timeoutTimer: NodeJS.Timeout | undefined;
			let terminationTimer: NodeJS.Timeout | undefined;

			const child = spawn(command, [...args], {
				cwd: options.cwd,
				env: options.env ?? process.env,
				shell: false,
				windowsHide: true,
				stdio: ["pipe", "pipe", "pipe"],
			});

			child.stdout.setEncoding("utf8");
			child.stderr.setEncoding("utf8");
			const captureStdout = (chunk: string): void => {
				if (stdout.length < MAX_CAPTURE_BYTES) {
					stdout += chunk.slice(0, MAX_CAPTURE_BYTES - stdout.length);
				}
			};
			const captureStderr = (chunk: string): void => {
				if (stderr.length < MAX_CAPTURE_BYTES) {
					stderr += chunk.slice(0, MAX_CAPTURE_BYTES - stderr.length);
				}
			};
			child.stdout.on("data", captureStdout);
			child.stderr.on("data", captureStderr);
			// A child may close stdin before the provided input is flushed. Its exit event
			// remains the authoritative command result, so an EPIPE must not be unhandled.
			child.stdin.on("error", () => undefined);

			const clearTimers = (): void => {
				if (timeoutTimer !== undefined) {
					clearTimeout(timeoutTimer);
					timeoutTimer = undefined;
				}
				if (terminationTimer !== undefined) {
					clearTimeout(terminationTimer);
					terminationTimer = undefined;
				}
			};

			const stopCapturing = (): void => {
				child.stdout.off("data", captureStdout);
				child.stderr.off("data", captureStderr);
			};

			const timeoutError = (): OperationalError => {
				const display = [command, ...redactCommandArgs(args)].join(" ");
				return new OperationalError(
					redactText(`Command timed out after ${timeoutMs}ms: ${display}`, this.#secrets),
					"COMMAND_TIMEOUT"
				);
			};

			const forceSettleTimeout = (): void => {
				if (settled) return;
				settled = true;
				clearTimers();
				stopCapturing();
				child.stdin.destroy();
				child.stdout.destroy();
				child.stderr.destroy();
				child.unref();
				reject(timeoutError());
			};

			timeoutTimer = setTimeout(() => {
				if (settled) return;
				timedOut = true;
				try {
					child.kill("SIGTERM");
				} catch {
					// The escalation timer below still guarantees settlement.
				}
				terminationTimer = setTimeout(() => {
					if (settled) return;
					try {
						child.kill("SIGKILL");
					} catch {
						// Releasing the child handle below prevents an unkillable child from
						// keeping the caller or event loop waiting indefinitely.
					}
					forceSettleTimeout();
				}, TERMINATION_GRACE_MS);
				terminationTimer.unref();
			}, timeoutMs);
			timeoutTimer.unref();

			child.once("error", (error) => {
				if (settled) return;
				settled = true;
				clearTimers();
				stopCapturing();
				child.stdin.destroy();
				child.stdout.destroy();
				child.stderr.destroy();
				child.unref();
				const display = [command, ...redactCommandArgs(args)].join(" ");
				reject(
					new OperationalError(
						redactText(`Unable to run ${display}: ${error.message}`, this.#secrets),
						"COMMAND_NOT_AVAILABLE",
						{ cause: error }
					)
				);
			});

			child.once("close", (code, signal) => {
				if (settled) return;
				settled = true;
				clearTimers();
				stopCapturing();
				child.stdin.destroy();
				const exitCode = code ?? 1;
				const result: CommandResult = {
					command,
					args: [...args],
					exitCode,
					stdout,
					stderr,
				};

				if (timedOut) {
					reject(timeoutError());
					return;
				}

				if (exitCode !== 0 && !options.allowFailure) {
					const diagnostic =
						stderr.trim() || stdout.trim() || `signal ${signal ?? "unknown"}`;
					const display = [command, ...redactCommandArgs(args)].join(" ");
					reject(
						new OperationalError(
							redactText(
								`Command failed (${exitCode}): ${display}\n${diagnostic}`,
								this.#secrets
							),
							"COMMAND_FAILED"
						)
					);
					return;
				}

				resolve(result);
			});

			if (options.input !== undefined) {
				child.stdin.end(options.input);
			} else {
				child.stdin.end();
			}
		});
	}
}
