import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

type ThemeType = "default" | "dark" | "light";

export interface ConfigState {
	theme: ThemeType;
	drawerOpen: boolean;
}

const initialState: ConfigState = {
	theme: "default",
	drawerOpen: true,
};

export const configSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<ThemeType>) => {
			state.theme = action.payload;
		},
		setDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.drawerOpen = action.payload;
		},
	},
});

export const { setTheme, setDrawerOpen } = configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

export default configSlice.reducer;
