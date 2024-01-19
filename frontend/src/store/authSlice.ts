import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface AuthState {
	accessToken: string | null;
}

const initialState: AuthState = {
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

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
