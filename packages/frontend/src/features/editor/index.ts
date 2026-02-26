// Store
export { default as editorReducer } from "./store/editorSlice";
export {
	selectEditor,
	setMode,
	setShareRole,
	setDoc,
	setClient,
	setEditorPort,
	editorSlice,
} from "./store/editorSlice";
export { EditorModeType } from "@codepair/ui";
export type { EditorState } from "./store/editorSlice";
export type { CodePairDocType } from "@codepair/codemirror";
export type { EditorPort } from "@codepair/ui";

// Shared components
export { default as DocumentView } from "./shared/components/DocumentView";
export { default as ModeSwitcher } from "./shared/components/ModeSwitcher";
export { default as EditorBottomBar, BOTTOM_BAR_HEIGHT } from "./shared/components/EditorBottomBar";

// Hooks
export { useYorkieDocument } from "./hooks/useYorkieDocument";
export { useYorkieRevisions } from "./hooks/useYorkieRevisions";
export type { UseYorkieRevisionsOptions } from "./hooks/useYorkieRevisions";
export { useUserPresence } from "./hooks/useUserPresence";
export type { Presence } from "./hooks/useUserPresence";

// Components
export { default as RevisionPanel } from "./components/RevisionPanel";
export { default as RevisionListItem } from "./components/RevisionListItem";
export { default as CreateRevisionDialog } from "./components/CreateRevisionDialog";
export { default as RestoreRevisionDialog } from "./components/RestoreRevisionDialog";
export { default as PreviewRevisionDialog } from "./components/PreviewRevisionDialog";
