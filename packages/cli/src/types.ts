export const EXIT_SUCCESS = 0 as const;
export const EXIT_FAILURE = 1 as const;
export const EXIT_USAGE = 2 as const;

export type ExitCode = typeof EXIT_SUCCESS | typeof EXIT_FAILURE | typeof EXIT_USAGE;

export type CheckScope = "toolchain" | "env" | "services" | "yorkie";
export type RequestedScope = CheckScope | "all";
export type CheckStatus = "pass" | "warn" | "fail" | "skip";

export interface DoctorCheck {
	id: string;
	scope: CheckScope;
	status: CheckStatus;
	message: string;
	details?: Record<string, unknown>;
	remediation?: string;
}

export interface DoctorSummary {
	pass: number;
	warn: number;
	fail: number;
	skip: number;
}

export interface DoctorResult {
	command: "doctor";
	ok: boolean;
	exitCode: ExitCode;
	root: string;
	strict: boolean;
	checks: DoctorCheck[];
	summary: DoctorSummary;
}

export type SetupActionStatus = "changed" | "unchanged" | "planned";

export interface SetupAction {
	id: string;
	status: SetupActionStatus;
	message: string;
}

export interface SetupResult {
	command: "setup yorkie";
	ok: boolean;
	exitCode: ExitCode;
	root: string;
	dryRun: boolean;
	changed: boolean;
	actions: SetupAction[];
}

export interface ErrorResult {
	command: string;
	ok: false;
	exitCode: ExitCode;
	error: {
		code: string;
		message: string;
	};
}
