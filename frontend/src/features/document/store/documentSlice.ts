import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";

export interface Document {
	id: string;
	workspaceId: string;
	yorkieDocumentId: string;
	title: string;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DocumentState {
	data: Document | null;
}

const initialState: DocumentState = {
	data: null,
};

const documentSlice = createSlice({
	name: "document",
	initialState,
	reducers: {
		setDocumentData: (state, action: PayloadAction<Document | null>) => {
			state.data = action.payload;
		},
	},
});

export const { setDocumentData } = documentSlice.actions;

export const selectDocument = (state: RootState) => state.document;

/**
 * Handles document management state.
 * This slice is designed to manage the currently active document, its metadata, and related state in the application.
 */
const reducer = documentSlice.reducer;

export default reducer;
