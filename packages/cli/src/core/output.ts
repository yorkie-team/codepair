import { redactValue } from "./redact.js";
import type { DoctorCheck, DoctorResult, ErrorResult, SetupResult } from "../types.js";

export type ResultEnvelope = DoctorResult | SetupResult | ErrorResult;

function checkMarker(check: DoctorCheck): string {
	switch (check.status) {
		case "pass":
			return "PASS";
		case "warn":
			return "WARN";
		case "fail":
			return "FAIL";
		case "skip":
			return "SKIP";
	}
}

export function writeResult(
	result: ResultEnvelope,
	json: boolean,
	secrets: Iterable<string> = []
): void {
	if (json) {
		process.stdout.write(`${JSON.stringify(redactValue(result, secrets), null, 2)}\n`);
		return;
	}

	if (result.command === "doctor" && "checks" in result) {
		process.stdout.write(`CodePair doctor (${result.root})\n`);
		for (const check of result.checks) {
			process.stdout.write(`[${checkMarker(check)}] ${check.message}\n`);
			if ((check.status === "warn" || check.status === "fail") && check.remediation) {
				process.stdout.write(`       ${check.remediation}\n`);
			}
		}
		process.stdout.write(
			`Summary: ${result.summary.pass} passed, ${result.summary.warn} warnings, ${result.summary.fail} failed, ${result.summary.skip} skipped\n`
		);
		return;
	}

	if (result.command === "setup yorkie" && "actions" in result) {
		process.stdout.write(
			`${result.dryRun ? "CodePair Yorkie setup plan" : "CodePair Yorkie setup"} (${result.root})\n`
		);
		for (const action of result.actions) {
			process.stdout.write(`[${action.status.toUpperCase()}] ${action.message}\n`);
		}
		process.stdout.write(result.ok ? "Yorkie setup complete.\n" : "Yorkie setup failed.\n");
		return;
	}

	if ("error" in result) {
		process.stderr.write(`${result.error.message}\n`);
	}
}
