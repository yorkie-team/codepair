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
	EditorModeType,
} from "./store/editorSlice";
export type { EditorState, CodePairDocType } from "./store/editorSlice";
export type { EditorPort } from "./port/EditorPort";

// Shared components
export { default as DocumentView } from "./shared/components/DocumentView";
export { default as ModeSwitcher } from "./shared/components/ModeSwitcher";
export { default as EditorBottomBar, BOTTOM_BAR_HEIGHT } from "./shared/components/EditorBottomBar";

// CodeMirror exports
export { default as Editor } from "./codemirror/components/Editor";
export { default as Preview } from "./codemirror/components/Preview";
export { default as ToolBar } from "./codemirror/components/ToolBar";
export { useToolBar } from "./codemirror/hooks/useToolBar";
export { useFormatUtils, FormatType } from "./codemirror/hooks/useFormatUtils";
export type { ToolBarState } from "./codemirror/hooks/useFormatUtils";
export { useSpeechToText } from "./codemirror/hooks/useSpeechToText";
export type { SpeechToTextState } from "./codemirror/hooks/useSpeechToText";

// Hooks
export { useYorkieDocument } from "./hooks/useYorkieDocument";
export { useYorkieRevisions } from "./hooks/useYorkieRevisions";
export type { UseYorkieRevisionsOptions } from "./hooks/useYorkieRevisions";
export { useUserPresence } from "./hooks/useUserPresence";
export type { Presence } from "./hooks/useUserPresence";

// Utils
export {
	yorkieCodeMirror,
	yorkieSync,
	yorkieSyncFacet,
	YorkieSyncConfig,
} from "./codemirror/utils/yorkie";
export { imageUploader } from "./codemirror/utils/imageUploader";
export type { UploadCallback } from "./codemirror/utils/imageUploader";
export { urlHyperlinkInserter } from "./codemirror/utils/urlHyperlinkInserter";
export type {
	YorkieCodeMirrorDocType,
	YorkieCodeMirrorPresenceType,
} from "./codemirror/utils/yorkie/yorkieSync";

// Components (legacy - revision related)
export { default as RevisionPanel } from "./components/RevisionPanel";
export { default as RevisionListItem } from "./components/RevisionListItem";
export { default as CreateRevisionDialog } from "./components/CreateRevisionDialog";
export { default as RestoreRevisionDialog } from "./components/RestoreRevisionDialog";
export { default as PreviewRevisionDialog } from "./components/PreviewRevisionDialog";

// Namespace exports for version-specific access
export * as codemirror from "./codemirror";
export * as shared from "./shared";
