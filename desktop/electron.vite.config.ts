import { defineConfig } from "electron-vite";
import { resolve } from "path";

export default defineConfig({
	main: {
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, "src/index.ts"),
				},
			},
		},
	},
});
