import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	{
		files: ["src/**/*.ts"],
		ignores: ["dist", "eslint.config.mjs"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			...typescriptPlugin.configs.recommended.rules,
			...prettierPlugin.configs.recommended.rules,
			"@typescript-eslint/interface-name-prefix": "off",
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "error",
		},
	},
];
