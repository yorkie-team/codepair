import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface ConfigState {
	accessToken: string | null;
}

const initialState: ConfigState = {
	accessToken: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setAccessToken: (state, action: PayloadAction<string | null>) => {
			state.accessToken = action.payload;
		},
	},
});

export const { setAccessToken } = authSlice.actions;

export const selectConfig = (state: RootState) => state.config;

export default authSlice.reducer;
