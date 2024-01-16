import { configureStore } from "@reduxjs/toolkit";
import editorSlice from "./editorSlice";
import configSlice from "./configSlice";
import supabaseSlice from "./supabaseSlice";

export const store = configureStore({
	reducer: {
		editor: editorSlice,
		config: configSlice,
		supabase: supabaseSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["editor/setDoc", "editor/setClient", "supabase/setClient"],
				ignoredPaths: ["editor.doc", "editor.client", "supabase.client"],
			},
			immutableCheck: {
				ignoredActions: ["editor/setDoc", "editor/setClient", "supabase/setClient"],
				ignoredPaths: ["editor.doc", "editor.client", "supabase.client"],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
