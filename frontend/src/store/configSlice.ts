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
}

const initialState: ConfigState = {
	theme: ThemeType.DEFAULT,
	drawerOpen: true,
	codeKey: CodeKeyType.SUBLIME,
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
	},
});

export const { setTheme, setDrawerOpen, setCodeKeyType } = configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

export default configSlice.reducer;
