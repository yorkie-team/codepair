import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";
import { authReducer as authSlice } from "../features/auth";
import {
	configReducer as configSlice,
	featureSettingReducer as featureSettingSlice,
} from "../features/settings";
import { documentReducer as documentSlice } from "../features/document";
import { editorReducer as editorSlice } from "../features/editor";
import { userReducer as userSlice } from "../features/user";
import { workspaceReducer as workspaceSlice } from "../features/workspace";

const persistConfig = {
	key: "root",
	storage, // Use local storage
	whitelist: ["auth", "config"], // Only persis these slices
};

const rootReducer = combineReducers({
	/*
	 * Persistent slices:
	 * These slices persist their state in local storage and can restore it when the app restarts.
	 */
	auth: authSlice,
	config: configSlice,

	/**
	 * Volatile slices:
	 * These slices only retain their state during a session. Their state is reset when the app restarts.
	 */
	user: userSlice,
	editor: editorSlice,
	workspace: workspaceSlice,
	document: documentSlice,
	featureSetting: featureSettingSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					"persist/PERSIST", // redux-persist
					"editor/setDoc",
					"editor/setClient",
					"editor/setEditorPort",
				],
				ignoredPaths: ["editor.doc", "editor.client", "editor.editorPort"],
			},
			immutableCheck: {
				ignoredPaths: ["editor.doc", "editor.client", "editor.editorPort"],
			},
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
