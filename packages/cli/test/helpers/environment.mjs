export const CLI_CONFIGURATION_VARIABLES = [
	"BACKEND_ENV_FILE",
	"CODEPAIR_LEGACY_SETUP",
	"CODEPAIR_ROOT",
	"DATABASE_URL",
	"FRONTEND_BASE_URL",
	"FRONTEND_ENV_FILE",
	"GITHUB_CALLBACK_URL",
	"GITHUB_CLIENT_ID",
	"GITHUB_CLIENT_SECRET",
	"JWT_ACCESS_TOKEN_EXPIRATION_TIME",
	"JWT_ACCESS_TOKEN_SECRET",
	"JWT_REFRESH_TOKEN_EXPIRATION_TIME",
	"JWT_REFRESH_TOKEN_SECRET",
	"MINIO_ENDPOINT",
	"OLLAMA_HOST_URL",
	"QDRANT_URL",
	"VITE_API_ADDR",
	"VITE_YORKIE_API_ADDR",
	"VITE_YORKIE_API_KEY",
	"WEBHOOK_URL",
	"YORKIE_API_ADDR",
	"YORKIE_PASSWORD",
	"YORKIE_PROJECT_NAME",
	"YORKIE_PROJECT_SECRET_KEY",
	"YORKIE_USERNAME",
];

export function sanitizedEnvironment(overrides = {}) {
	const environment = { ...process.env };
	for (const name of CLI_CONFIGURATION_VARIABLES) delete environment[name];
	return { ...environment, ...overrides };
}

export function clearCliConfigurationEnvironment() {
	for (const name of CLI_CONFIGURATION_VARIABLES) delete process.env[name];
}
