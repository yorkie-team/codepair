import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface User {
	id: string;
	nickname: string | null;
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

/**
 * Manage user profile and user-specific information.
 *
 *  * This slice handles:
 * - Storing user data, including:
 *   - `id`: Unique identifier for the user.
 *   - `nickname`: User's nickname, or `null` if not set.
 *   - `updatedAt`: Timestamp of the last user update.
 *   - `createdAt`: Timestamp of when the user was created.
 */
const reducer = userSlice.reducer;

export default reducer;
