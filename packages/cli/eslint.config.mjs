import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

const directory = dirname(fileURLToPath(import.meta.url));

export default [
	{
		ignores: ["dist/**", "coverage/**"],
	},
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: directory,
			},
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin,
		},
		rules: {
			...typescriptPlugin.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": "error",
		},
	},
];
