import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import * as yorkie from "yorkie-js-sdk";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";
import { ShareRole } from "../utils/share";

export type EditorModeType = "edit" | "both" | "read";
export type CodePairDocType = yorkie.Document<
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType
>;

export interface EditorState {
	mode: EditorModeType;
	shareRole: ShareRole | null;
	doc: CodePairDocType | null;
	client: yorkie.Client | null;
}

const initialState: EditorState = {
	mode: "both",
	shareRole: null,
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
		setShareRole: (state, action: PayloadAction<ShareRole | null>) => {
			state.shareRole = action.payload;
		},
		setDoc: (state, action: PayloadAction<CodePairDocType | null>) => {
			state.doc = action.payload;
		},
		setClient: (state, action: PayloadAction<yorkie.Client | null>) => {
			state.client = action.payload;
		},
	},
});

export const { setMode, setDoc, setClient, setShareRole } = editorSlice.actions;

export const selectEditor = (state: RootState) => state.editor;

export default editorSlice.reducer;
