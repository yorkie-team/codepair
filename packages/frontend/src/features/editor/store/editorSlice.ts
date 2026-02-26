import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import * as yorkie from "@yorkie-js/sdk";
import { ShareRole } from "../../document";
import { RootState } from "../../../store/store";
import { EditorModeType } from "@codepair/ui";
import type { EditorPort } from "@codepair/ui";
import type { CodePairDocType } from "@codepair/codemirror";

export interface EditorState {
	mode: EditorModeType;
	shareRole: ShareRole | null;
	doc: CodePairDocType | null;
	client: yorkie.Client | null;
	editorPort: EditorPort | null;
}

const initialState: EditorState = {
	mode: EditorModeType.BOTH,
	shareRole: null,
	doc: null,
	client: null,
	editorPort: null,
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
		setEditorPort: (state, action: PayloadAction<EditorPort | null>) => {
			Object.assign(state, { editorPort: action.payload });
		},
	},
});

export const { setMode, setShareRole, setDoc, setClient, setEditorPort } = editorSlice.actions;

export const selectEditor = (state: RootState) => state.editor;

/**
 * Manages the state of the collaborative code editor
 *
 *  * This slice handles:
 * - `mode`: The editor's current mode (edit, read, or both).
 * - `shareRole`: The user's role in the session (e.g., viewer, editor).
 * - `doc`: The Yorkie document for real-time collaboration.
 * - `client`: The Yorkie client for syncing data with the server.
 * - `editorPort`: The editor instance (behind the EditorPort interface).
 */
const reducer = editorSlice.reducer;

export default reducer;
