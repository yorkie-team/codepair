import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import version from "vite-plugin-package-version";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		sourcemap: true, // Source map generation must be turned on
	},
	plugins: [
		react(),
		version(),
		// Only enable Sentry plugin if the environment variables are set
		process.env.SENTRY_AUTH_TOKEN &&
			sentryVitePlugin({
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				authToken: process.env.SENTRY_AUTH_TOKEN,
			}),
	],
});
