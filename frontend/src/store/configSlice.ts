import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

type ThemeType = "default" | "dark" | "light";

export interface ConfigState {
	theme: ThemeType;
}

const initialState: ConfigState = {
	theme: "default",
};

export const configSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<ThemeType>) => {
			state.theme = action.payload;
		},
	},
});

export const { setTheme } = configSlice.actions;

export const selectConfig = (state: RootState) => state.config;

export default configSlice.reducer;
