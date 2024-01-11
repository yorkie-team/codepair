import { configureStore } from "@reduxjs/toolkit";
import editorSlice from "./editorSlice";
import configSlice from "./configSlice";

export const store = configureStore({
	reducer: {
		editor: editorSlice,
		config: configSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredPaths: ["editor.doc", "editor.client"],
			},
			immutableCheck: {
				ignoredPaths: ["editor.doc", "editor.client"],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
