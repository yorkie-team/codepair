import { MarkdownPreviewRef } from "@uiw/react-markdown-preview";
import { PropsWithChildren, useRef } from "react";
import { PreviewRefContext } from "../contexts/PreviewRefContext";

export default function PreviewRefProvider(props: PropsWithChildren) {
	const { children } = props;
	const previewRef = useRef<MarkdownPreviewRef | null>(null);

	return (
		<PreviewRefContext.Provider value={{ previewRef }}>{children}</PreviewRefContext.Provider>
	);
}
