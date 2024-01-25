import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface Workspace {
	id: string;
	title: string;
	slug: string;
	updatedAt: Date;
	createdAt: Date;
}

export interface WorkspaceState {
	data: Workspace | null;
}

const initialState: WorkspaceState = {
	data: null,
};

export const workspaceSlice = createSlice({
	name: "workspace",
	initialState,
	reducers: {
		setWorkspaceData: (state, action: PayloadAction<Workspace | null>) => {
			state.data = action.payload;
		},
	},
});

export const { setWorkspaceData } = workspaceSlice.actions;

export const selectWorkspace = (state: RootState) => state.workspace;

export default workspaceSlice.reducer;
