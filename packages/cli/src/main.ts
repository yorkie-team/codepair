import { readFile } from "node:fs/promises";
import { extractGlobalOptions } from "./core/args.js";
import { UsageError, toCliError } from "./core/errors.js";
import { writeResult } from "./core/output.js";
import { redactText } from "./core/redact.js";
import { parseDoctorOptions, runDoctor } from "./commands/doctor.js";
import { parseSetupYorkieOptions, runSetupYorkie } from "./commands/setup-yorkie.js";
import { helpFor, MAIN_HELP } from "./help.js";
import type { ErrorResult, ExitCode } from "./types.js";

export async function packageVersion(): Promise<string> {
	const packageUrl = new URL("../package.json", import.meta.url);
	const parsed = JSON.parse(await readFile(packageUrl, "utf8")) as {
		version?: unknown;
	};
	if (typeof parsed.version !== "string") throw new Error("CLI package version is missing.");
	return parsed.version;
}

function commandLabel(tokens: readonly string[]): string {
	if (tokens[0] === "setup" && tokens[1] === "yorkie") return "setup yorkie";
	return tokens[0] ?? "codepair";
}

export async function runCli(argv: readonly string[]): Promise<ExitCode> {
	let json = argv.includes("--json");
	let remaining: string[] = [...argv];
	try {
		const parsed = extractGlobalOptions(argv);
		json = parsed.options.json;
		remaining = parsed.remaining;

		if (parsed.options.version || remaining[0] === "version") {
			process.stdout.write(`${await packageVersion()}\n`);
			return 0;
		}

		if (remaining[0] === "help") {
			process.stdout.write(helpFor(remaining.slice(1)));
			return 0;
		}

		if (parsed.options.help) {
			process.stdout.write(helpFor(remaining));
			return 0;
		}

		if (remaining.length === 0) {
			process.stdout.write(MAIN_HELP);
			return 0;
		}

		if (remaining[0] === "doctor") {
			const result = await runDoctor(
				parseDoctorOptions(remaining.slice(1), parsed.options.root)
			);
			writeResult(result, json);
			return result.exitCode;
		}

		if (remaining[0] === "setup" && remaining[1] === "yorkie") {
			const result = await runSetupYorkie(
				parseSetupYorkieOptions(remaining.slice(2), parsed.options.root),
				{ disablePrompt: parsed.options.json }
			);
			writeResult(result, json);
			return result.exitCode;
		}

		if (remaining[0] === "setup") {
			throw new UsageError("Unknown setup target. Expected: codepair setup yorkie");
		}
		throw new UsageError(`Unknown command: ${remaining[0]}`, "UNKNOWN_COMMAND");
	} catch (error) {
		const cliError = toCliError(error);
		const result: ErrorResult = {
			command: commandLabel(remaining),
			ok: false,
			exitCode: cliError.exitCode,
			error: {
				code: cliError.code,
				message: redactText(cliError.message),
			},
		};
		writeResult(result, json);
		return cliError.exitCode;
	}
}
