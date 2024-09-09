import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { EditorView } from "codemirror";
import * as yorkie from "yorkie-js-sdk";
import { ShareRole } from "../utils/share";
import { YorkieCodeMirrorDocType, YorkieCodeMirrorPresenceType } from "../utils/yorkie/yorkieSync";
import { RootState } from "./store";

export enum EditorModeType {
	EDIT = "edit",
	BOTH = "both",
	READ = "read",
}

export enum CodeKeyType {
	SUBLIME = "sublime",
	VIM = "vim",
}

export type CodePairDocType = yorkie.Document<
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType
>;

export interface EditorState {
	mode: EditorModeType;
	codeKey: CodeKeyType;
	shareRole: ShareRole | null;
	doc: CodePairDocType | null;
	client: yorkie.Client | null;
	cmView: EditorView | null;
}

const initialState: EditorState = {
	mode: EditorModeType.BOTH,
	codeKey: CodeKeyType.SUBLIME,
	shareRole: null,
	doc: null,
	client: null,
	cmView: null,
};

export const editorSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setMode: (state, action: PayloadAction<EditorModeType>) => {
			state.mode = action.payload;
		},
		setCodeKeyType: (state, action: PayloadAction<CodeKeyType>) => {
			state.codeKey = action.payload;
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
		setCmView: (state, action: PayloadAction<EditorView | null>) => {
			Object.assign(state, { cmView: action.payload });
		},
	},
});

export const { setMode, setCodeKeyType, setShareRole, setDoc, setClient, setCmView } =
	editorSlice.actions;

export const selectEditor = (state: RootState) => state.editor;

export default editorSlice.reducer;
