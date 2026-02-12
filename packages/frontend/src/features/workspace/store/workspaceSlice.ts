import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";

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

/**
 * Manages workspace-related state.
 *
 *  * This slice handles:
 * - `data`: The currently active workspace, including:
 *   - `id`: Unique identifier for the workspace.
 *   - `title`: The name of the workspace.
 *   - `slug`: A URL-friendly identifier for the workspace.
 *   - `updatedAt`: The timestamp of the last update to the workspace.
 *   - `createdAt`: The timestamp when the workspace was created.
 */
const reducer = workspaceSlice.reducer;

export default reducer;
