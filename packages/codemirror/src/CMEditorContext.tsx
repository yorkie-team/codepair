import { createContext, useContext } from "react";
import type { EditorPort } from "@codepair/ui";
import type { CodePairDocType } from "./types";
import { CodeKeyType } from "./types";

export interface CMEditorContextValue {
	doc: CodePairDocType;
	client: import("@yorkie-js/sdk").Client;
	editorPort: EditorPort | null;
	setEditorPort: (port: EditorPort | null) => void;
	themeMode: "light" | "dark";
	codeKey: CodeKeyType;
	setCodeKey: (key: CodeKeyType) => void;
	fileUploadEnabled: boolean;
	handleUploadImage: ((file: File) => Promise<string>) | null;
	intelligenceEnabled: boolean;
	width: number | string;
}

export const CMEditorContext = createContext<CMEditorContextValue | null>(null);

export function useCMEditorContext(): CMEditorContextValue {
	const ctx = useContext(CMEditorContext);
	if (!ctx) {
		throw new Error("useCMEditorContext must be used within CMEditorSuite");
	}
	return ctx;
}
