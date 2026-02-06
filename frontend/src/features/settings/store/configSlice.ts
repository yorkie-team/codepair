import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";

export enum ThemeType {
	DEFAULT = "default",
	DARK = "dark",
	LIGHT = "light",
}

export enum CodeKeyType {
	SUBLIME = "sublime",
	VIM = "vim",
}

/**
 * EditorVersion enum for selecting different editor implementations.
 *
 * This enables an extensible architecture where multiple editor implementations
 * can coexist. To add a new editor:
 * 1. Add a new enum value here (e.g., MONACO = "monaco")
 * 2. Create a new directory under features/editor/ (e.g., monaco/)
 * 3. Implement Editor and Preview components following the codemirror/ pattern
 * 4. Update DocumentView.tsx to handle the new editor version
 *
 * Currently available:
 * - CODEMIRROR: Default markdown editor using CodeMirror 6
 */
export enum EditorVersion {
	CODEMIRROR = "codemirror",
	// To add more editors, add enum values here:
	// MONACO = "monaco",
	// PROSEMIRROR = "prosemirror",
}

export interface ConfigState {
	theme: ThemeType;
	drawerOpen: boolean;
	codeKey: CodeKeyType;
	disableScrollSync: boolean;
	editorVersion: EditorVersion;
}

const initialState: ConfigState = {
	theme: ThemeType.DEFAULT,
	drawerOpen: true,
	codeKey: CodeKeyType.SUBLIME,
	disableScrollSync: false,
	editorVersion: EditorVersion.CODEMIRROR,
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
		setEditorVersion: (state, action: PayloadAction<EditorVersion>) => {
			state.editorVersion = action.payload;
		},
	},
});

export const { setTheme, setDrawerOpen, setCodeKeyType, setDisableScrollSync, setEditorVersion } =
	configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

/**
 * Handles global application settings.
 *
 * This slice handles:
 * - `theme`: The application theme (default, dark, or light).
 * - `drawerOpen`: Whether the application drawer (sidebar) is open.
 * - `codeKey`: The preferred keybinding type for code editing (Sublime, Vim, etc.).
 * - `disableScrollSync`: A flag to enable or disable scroll synchronization.
 * - `editorVersion`: The editor implementation to use (see EditorVersion enum).
 */
const reducer = configSlice.reducer;

export default reducer;
