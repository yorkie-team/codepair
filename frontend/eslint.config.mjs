import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export default [
	{
		files: ["**/*.ts", "**/*.tsx"],
		ignores: ["dist", "eslint.config.mjs", "vite.config.ts"],
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
			"react-hooks": reactHooksPlugin,
			"react-refresh": reactRefreshPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
			"prettier/prettier": "error",
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
];
