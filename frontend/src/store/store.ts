import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";
import authSlice from "./authSlice";
import configSlice from "./configSlice";
import documentSlice from "./documentSlice";
import editorSlice from "./editorSlice";
import featureSettingSlice from "./featureSettingSlice";
import userSlice from "./userSlice";
import workspaceSlice from "./workspaceSlice";

const persistConfig = {
	key: "root",
	storage, // Use local storage
	whitelist: ["auth", "config"], // Only persis these slices
};

const rootReducer = combineReducers({
	// Persistent slices
	auth: authSlice,
	config: configSlice,

	// Volatile slices
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
					"editor/setCmView",
				],
				ignoredPaths: ["editor.doc", "editor.client", "editor.cmView"],
			},
			immutableCheck: {
				ignoredPaths: ["editor.doc", "editor.client", "editor.cmView"],
			},
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
