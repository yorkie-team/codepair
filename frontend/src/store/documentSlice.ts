import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

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

export const documentSlice = createSlice({
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

export default documentSlice.reducer;
