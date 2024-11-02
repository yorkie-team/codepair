import { CircularProgress, Stack } from "@mui/material";
import "katex/dist/katex.min.css";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { selectEditor } from "../../store/editorSlice";
import { addSoftLineBreak } from "../../utils/document";
import MarkdownIt from "markdown-it";
import { toHtml } from "hast-util-to-html";
import markdownItKatex from "@vscode/markdown-it-katex";
import { refractor } from "refractor";
import { Root } from "hast";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markdownItIncrementalDOM from "markdown-it-incremental-dom";
import * as IncrementalDOM from "incremental-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markdownItSanitizer from "markdown-it-sanitizer";
import "./editor.css";
import "./preview.css";

const md = new MarkdownIt({
	html: true,
	linkify: true,
	breaks: true,
	highlight(code: string, lang: string) {
		return `<pre class="language-${lang}"><code>${toHtml(
			refractor.highlight(code, lang) as Root
		)}</code></pre>`;
	},
})
	.use(markdownItIncrementalDOM, IncrementalDOM)
	.use(markdownItKatex)
	.use(markdownItSanitizer);

const Preview = () => {
	const currentTheme = useCurrentTheme();
	const editorStore = useSelector(selectEditor);
	const [content, setContent] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!editorStore.doc) return;

		const updatePreviewContent = () => {
			const editorText = editorStore.doc?.getRoot().content?.toString() || "";
			// Add soft line break
			setContent(addSoftLineBreak(editorText));
		};

		updatePreviewContent();

		const unsubscribe = editorStore.doc.subscribe("$.content", () => {
			updatePreviewContent();
		});

		return () => {
			unsubscribe();
			setContent("");
		};
	}, [editorStore.doc]);

	useEffect(() => {
		if (containerRef.current == null) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		IncrementalDOM.patch(containerRef.current, md.renderToIncrementalDOM(content));
	}, [content, md]);

	if (!editorStore?.doc) {
		return (
			<Stack direction="row" justifyContent="center">
				<CircularProgress sx={{ mt: 2 }} />
			</Stack>
		);
	}

	return (
		<div
			ref={containerRef}
			data-color-mode={currentTheme}
			style={{ paddingBottom: "2rem" }}
			className="markdown-preview"
		/>
	);
};

export default Preview;
