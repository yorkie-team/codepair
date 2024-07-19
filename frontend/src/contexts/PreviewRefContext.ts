import { MarkdownPreviewRef } from "@uiw/react-markdown-preview";
import React from "react";

export interface PreviewRefContextValue {
	previewRef: React.RefObject<MarkdownPreviewRef>;
}

export const PreviewRefContext = React.createContext<PreviewRefContextValue>({
	previewRef: { current: null },
});
