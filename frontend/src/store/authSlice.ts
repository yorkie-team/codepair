import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface AuthState {
	accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
	accessToken: null,
    refreshToken: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setAccessToken: (state, action: PayloadAction<string | null>) => {
			state.accessToken = action.payload;
		},
        setRefreshToken(state, action: PayloadAction<string | null>) {
            state.refreshToken = action.payload;
        },
	},
});

export const { setAccessToken, setRefreshToken } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
