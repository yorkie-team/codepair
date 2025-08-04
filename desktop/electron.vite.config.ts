import { defineConfig } from "electron-vite";
import { resolve } from "path";

export default defineConfig({
	main: {
		build: {
			rollupOptions: {
				input: {
					index: resolve(__dirname, "electron/index.ts"),
				},
			},
		},
	},
});
