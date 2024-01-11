import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import * as yorkie from "yorkie-js-sdk";

export type EditorModeType = "view" | "both" | "read";
export type CodePairDocType = yorkie.Document;

export interface EditorState {
	mode: EditorModeType;
	doc: CodePairDocType | null;
	client: yorkie.Client | null;
}

const initialState: EditorState = {
	mode: "both",
	doc: null,
	client: null,
};

export const editorSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setMode: (state, action: PayloadAction<EditorModeType>) => {
			state.mode = action.payload;
		},
		setDoc: (state, action: PayloadAction<CodePairDocType | null>) => {
			state.doc = action.payload;
		},
		setClient: (state, action: PayloadAction<yorkie.Client | null>) => {
			state.client = action.payload;
		},
	},
});

export const { setMode, setDoc, setClient } = editorSlice.actions;

export const selectEditor = (state: RootState) => state.editor;

export default editorSlice.reducer;
