import { combineReducers, configureStore } from "@reduxjs/toolkit";
import editorSlice from "./editorSlice";
import configSlice from "./configSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import authSlice from "./authSlice";
import userSlice from "./userSlice";
import workspaceSlice from "./workspaceSlice";
import documentSlice from "./documentSlice";

const reducers = combineReducers({
	// Persistence
	auth: authSlice,
	config: configSlice,
	// Volatile
	user: userSlice,
	editor: editorSlice,
	workspace: workspaceSlice,
	document: documentSlice,
});

const persistConfig = {
	key: "root",
	storage, // Local Storage
	whitelist: ["auth", "config"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					"persist/PERSIST", // redux-persist
					"editor/setDoc",
					"editor/setClient",
					"editor/setCmView",
				],
				ignoredPaths: ["editor.doc", "editor.client", "editor.cmView"],
			},
			immutableCheck: {
				ignoredPaths: ["editor.doc", "editor.client", "editor.cmView"],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
