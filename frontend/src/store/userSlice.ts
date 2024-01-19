import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface User {
	id: string;
	nickname: string;
	lastWorkspaceId: string;
	updatedAt: Date;
	createdAt: Date;
}

export interface UserState {
	data: User | null;
}

const initialState: UserState = {
	data: null,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUserData: (state, action: PayloadAction<User | null>) => {
			state.data = action.payload;
		},
	},
});

export const { setUserData } = userSlice.actions;

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
