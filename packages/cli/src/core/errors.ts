import { EXIT_FAILURE, EXIT_USAGE, type ExitCode } from "../types.js";

export class CliError extends Error {
	readonly code: string;
	readonly exitCode: ExitCode;

	constructor(message: string, code: string, exitCode: ExitCode, options?: ErrorOptions) {
		super(message, options);
		this.name = "CliError";
		this.code = code;
		this.exitCode = exitCode;
	}
}

export class UsageError extends CliError {
	constructor(message: string, code = "INVALID_USAGE", options?: ErrorOptions) {
		super(message, code, EXIT_USAGE, options);
		this.name = "UsageError";
	}
}

export class SafetyError extends CliError {
	constructor(message: string, code = "UNSAFE_CONFIGURATION", options?: ErrorOptions) {
		super(message, code, EXIT_USAGE, options);
		this.name = "SafetyError";
	}
}

export class ConfirmationRequiredError extends CliError {
	constructor(message = "Non-interactive setup requires --yes.") {
		super(message, "CONFIRMATION_REQUIRED", EXIT_USAGE);
		this.name = "ConfirmationRequiredError";
	}
}

export class ConfirmationDeclinedError extends CliError {
	constructor(message = "Setup cancelled by user.") {
		super(message, "CONFIRMATION_DECLINED", EXIT_FAILURE);
		this.name = "ConfirmationDeclinedError";
	}
}

export class OperationalError extends CliError {
	constructor(message: string, code = "OPERATION_FAILED", options?: ErrorOptions) {
		super(message, code, EXIT_FAILURE, options);
		this.name = "OperationalError";
	}
}

export function toCliError(error: unknown): CliError {
	if (error instanceof CliError) {
		return error;
	}
	if (error instanceof Error) {
		return new OperationalError(error.message, "UNEXPECTED_ERROR", {
			cause: error,
		});
	}
	return new OperationalError(String(error), "UNEXPECTED_ERROR");
}
