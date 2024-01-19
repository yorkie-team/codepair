import { combineReducers, configureStore } from "@reduxjs/toolkit";
import editorSlice from "./editorSlice";
import configSlice from "./configSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const reducers = combineReducers({
	editor: editorSlice,
	config: configSlice,
});

const persistConfig = {
	key: "root",
	storage, // Local Storage
	whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["editor/setDoc", "editor/setClient"],
				ignoredPaths: ["editor.doc", "editor.client"],
			},
			immutableCheck: {
				ignoredPaths: ["editor.doc", "editor.client"],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
