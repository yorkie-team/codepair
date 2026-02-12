import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	{
		files: ["**/*.ts", "**/*.tsx"],
		ignores: ["dist", "eslint.config.mjs"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: "./tsconfig.json",
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			...prettierPlugin.configs.recommended.rules,
			...typescriptPlugin.configs.recommended.rules,
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						"codemirror",
						"@codemirror/*",
						"@replit/*",
						"@yorkie-js/*",
						"@codepair/codemirror",
						"@codepair/frontend",
					],
				},
			],
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
];
