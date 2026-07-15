import type { DoctorCheck } from "../types.js";
import type { DoctorContext } from "./context.js";

const REQUIRED_BACKEND = [
	"DATABASE_URL",
	"GITHUB_CLIENT_ID",
	"GITHUB_CLIENT_SECRET",
	"GITHUB_CALLBACK_URL",
	"JWT_ACCESS_TOKEN_SECRET",
	"JWT_ACCESS_TOKEN_EXPIRATION_TIME",
	"JWT_REFRESH_TOKEN_SECRET",
	"JWT_REFRESH_TOKEN_EXPIRATION_TIME",
	"FRONTEND_BASE_URL",
	"YORKIE_API_ADDR",
	"YORKIE_PROJECT_SECRET_KEY",
] as const;

const REQUIRED_FRONTEND = ["VITE_API_ADDR", "VITE_YORKIE_API_ADDR", "VITE_YORKIE_API_KEY"] as const;

const UNSAFE_SECRET_VALUES = new Set([
	"admin",
	"password",
	"secret",
	"you_should_change_this_access_token_secret_key_in_production",
	"you_should_change_this_refresh_token_secret_key_in_production",
	"your_yorkie_project_secret_key_here",
]);

function fileCheck(id: string, label: string, file: DoctorContext["backendEnv"]): DoctorCheck {
	return file.exists
		? {
				id,
				scope: "env",
				status: "pass",
				message: `${label} exists.`,
				details: { path: file.path },
			}
		: {
				id,
				scope: "env",
				status: "fail",
				message: `${label} is missing.`,
				details: { path: file.path },
				remediation: "Create the development environment file before starting CodePair.",
			};
}

function requiredKeysCheck(
	id: string,
	label: string,
	values: Map<string, string>,
	required: readonly string[]
): DoctorCheck {
	const missing = required.filter((key) => !values.get(key)?.trim());
	return missing.length === 0
		? {
				id,
				scope: "env",
				status: "pass",
				message: `${label} contains all required variables.`,
			}
		: {
				id,
				scope: "env",
				status: "fail",
				message: `${label} is missing ${missing.length} required variable(s).`,
				details: { missing },
				remediation: `Define: ${missing.join(", ")}`,
			};
}

function secretSafetyCheck(context: DoctorContext): DoctorCheck {
	const secretKeys = [
		"GITHUB_CLIENT_SECRET",
		"JWT_ACCESS_TOKEN_SECRET",
		"JWT_REFRESH_TOKEN_SECRET",
		"YORKIE_PROJECT_SECRET_KEY",
	] as const;
	const unsafe = secretKeys.filter((key) => {
		const value = context.backendEnv.values.get(key)?.trim().toLowerCase();
		return value !== undefined && UNSAFE_SECRET_VALUES.has(value);
	});
	return unsafe.length === 0
		? {
				id: "env.secrets",
				scope: "env",
				status: "pass",
				message: "Configured backend secrets do not use known placeholder values.",
			}
		: {
				id: "env.secrets",
				scope: "env",
				status: "warn",
				message: `${unsafe.length} backend secret(s) use a default or placeholder value.`,
				details: { variables: unsafe },
				remediation:
					"Replace placeholder credentials before exposing CodePair beyond localhost.",
			};
}

function urlConsistencyCheck(context: DoctorContext): DoctorCheck {
	const callback = context.backendEnv.values.get("GITHUB_CALLBACK_URL");
	const frontend = context.backendEnv.values.get("FRONTEND_BASE_URL");
	const invalid: string[] = [];
	for (const [key, value] of [
		["GITHUB_CALLBACK_URL", callback],
		["FRONTEND_BASE_URL", frontend],
	] as const) {
		if (!value) continue;
		try {
			const parsed = new URL(value);
			if (parsed.protocol !== "http:" && parsed.protocol !== "https:") invalid.push(key);
		} catch {
			invalid.push(key);
		}
	}
	if (callback && !callback.endsWith("/auth/login/github"))
		invalid.push("GITHUB_CALLBACK_URL path");

	return invalid.length === 0
		? {
				id: "env.urls",
				scope: "env",
				status: "pass",
				message: "Configured application URLs are syntactically consistent.",
			}
		: {
				id: "env.urls",
				scope: "env",
				status: "fail",
				message: "One or more application URLs are invalid.",
				details: { invalid },
				remediation:
					"Use absolute http(s) URLs and end GITHUB_CALLBACK_URL with /auth/login/github.",
			};
}

export function runEnvChecks(context: DoctorContext): DoctorCheck[] {
	return [
		fileCheck("env.backend.file", "Backend .env.development", context.backendEnv),
		requiredKeysCheck(
			"env.backend.required",
			"Backend .env.development",
			context.backendEnv.values,
			REQUIRED_BACKEND
		),
		fileCheck("env.frontend.file", "Frontend .env.development", context.frontendEnv),
		requiredKeysCheck(
			"env.frontend.required",
			"Frontend .env.development",
			context.frontendEnv.values,
			REQUIRED_FRONTEND
		),
		secretSafetyCheck(context),
		urlConsistencyCheck(context),
	];
}
