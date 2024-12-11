import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export enum ThemeType {
	DEFAULT = "default",
	DARK = "dark",
	LIGHT = "light",
}

export enum CodeKeyType {
	SUBLIME = "sublime",
	VIM = "vim",
}

export interface ConfigState {
	theme: ThemeType;
	drawerOpen: boolean;
	codeKey: CodeKeyType;
	disableScrollSync: boolean;
}

const initialState: ConfigState = {
	theme: ThemeType.DEFAULT,
	drawerOpen: true,
	codeKey: CodeKeyType.SUBLIME,
	disableScrollSync: false,
};

export const configSlice = createSlice({
	name: "config",
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<ThemeType>) => {
			state.theme = action.payload;
		},
		setDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.drawerOpen = action.payload;
		},
		setCodeKeyType: (state, action: PayloadAction<CodeKeyType>) => {
			state.codeKey = action.payload;
		},
		setDisableScrollSync: (state, action: PayloadAction<boolean>) => {
			state.disableScrollSync = action.payload;
		},
	},
});

export const { setTheme, setDrawerOpen, setCodeKeyType, setDisableScrollSync } =
	configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

/**
 * Handles global application settings.
 *
 *  * This slice handles:
 * - `theme`: The application theme (default, dark, or light).
 * - `drawerOpen`: Whether the application drawer (sidebar) is open.
 * - `codeKey`: The preferred keybinding type for code editing (Sublime, Vim, etc.).
 * - `disableScrollSync`: A flag to enable or disable scroll synchronization.
 */
const reducer = configSlice.reducer;

export default reducer;
