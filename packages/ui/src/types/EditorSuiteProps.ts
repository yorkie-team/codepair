import type { EditorPort } from "./EditorPort";
import type { EditorModeType } from "./EditorModeType";
import type { CodeKeyType } from "./CodeKeyType";

/**
 * Shared props contract for editor suite components.
 *
 * Any editor package (CodeMirror, ProseMirror, internal, etc.) should accept
 * this interface. Editor-specific props belong inside each editor package,
 * not here.
 *
 * @typeParam TDoc   - Yorkie document type used by the editor.
 * @typeParam TClient - Yorkie client type used by the editor.
 */
export interface EditorSuiteProps<TDoc = unknown, TClient = unknown> {
	/** Yorkie document for real-time collaboration. */
	doc: TDoc;
	/** Yorkie client for syncing data with the server. */
	client: TClient;

	/** Current editor display mode (edit, read, or both). */
	mode: EditorModeType;
	/** Available width for the editor layout. */
	width: number | string;
	/** Current color theme. */
	themeMode: "light" | "dark";

	/** User's preferred keybinding style (optional — editors may ignore). */
	codeKey?: CodeKeyType;
	/** Callback when the user changes keybinding style (optional). */
	onCodeKeyChange?: (key: CodeKeyType) => void;

	/** Whether file upload (image paste/drop) is enabled. */
	fileUploadEnabled: boolean;
	/** Handler for uploading an image file; returns the URL. */
	handleUploadImage: ((file: File) => Promise<string>) | null;

	/** Whether AI intelligence features are enabled. */
	intelligenceEnabled: boolean;
	/** React node to render as the intelligence UI slot. */
	intelligenceSlot?: React.ReactNode;

	/** Callback when the EditorPort instance is created or destroyed. */
	onEditorPortChange?: (port: EditorPort | null) => void;
}
