import { CircularProgress, Stack, Snackbar, Alert } from "@mui/material";
import "katex/dist/katex.min.css";
import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { selectEditor } from "../../store/editorSlice";
import MarkdownIt from "markdown-it";
import { toHtml } from "hast-util-to-html";
import markdownItKatex from "@vscode/markdown-it-katex";
import { refractor } from "refractor";
import markdownItIncrementalDOM from "markdown-it-incremental-dom";
import markdownItSanitizer from "markdown-it-sanitizer";
import markdownItTaskCheckbox from "markdown-it-task-checkbox";
import markdownItImageLazyLoading from "markdown-it-image-lazy-loading";
import mila from "markdown-it-link-attributes";
import * as IncrementalDOM from "incremental-dom";
import "./editor.css";
import "./preview.css";
import _ from "lodash";
import { addSoftLineBreak } from "../../utils/document";
import CodeBlockCopyButton from "../common/CodeBlockCopyButton";
import { useCodeBlocks } from "../../hooks/useCodeBlocks";

const DELAY = 500;

const md = new MarkdownIt({
	html: true,
	linkify: true,
	breaks: true,
	highlight: (code: string, lang: string): string => {
		try {
			return `<pre class="language-${lang}"><code>${toHtml(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				refractor.highlight(code, lang) as any
			)}</code></pre>`;
		} catch (error) {
			console.error(`Error highlighting code with language '${lang}':`, error);
			return `<pre class="language-"><code>${md.utils.escapeHtml(code)}</code></pre>`;
		}
	},
})
	.use(markdownItTaskCheckbox)
	.use(mila, {
		attrs: {
			target: "_blank",
			rel: "noopener noreferrer",
		},
	})
	.use(markdownItIncrementalDOM, IncrementalDOM, {
		incrementalizeDefaultRules: false,
	})
	.use(markdownItKatex)
	.use(markdownItSanitizer)
	.use(markdownItImageLazyLoading);

const Preview = () => {
	const currentTheme = useCurrentTheme();
	const editorStore = useSelector(selectEditor);
	const [content, setContent] = useState("");
	const [showCopySuccess, setShowCopySuccess] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const { codeBlocks, detectCodeBlocks } = useCodeBlocks();

	const throttledUpdatePreviewContent = useMemo(
		() =>
			_.throttle(
				() => {
					const editorText = editorStore.doc?.getRoot().content?.toString() || "";

					// Add soft line break
					setContent(addSoftLineBreak(editorText));
				},
				DELAY,
				// Set trailing true to prevent ignoring last call
				{ trailing: true }
			),
		[editorStore.doc]
	);

	useEffect(() => {
		if (!editorStore.doc) return;

		throttledUpdatePreviewContent();

		const unsubscribe = editorStore.doc.subscribe("$.content", () => {
			throttledUpdatePreviewContent();
		});

		return () => {
			unsubscribe();
			setContent("");
		};
	}, [editorStore.doc, throttledUpdatePreviewContent]);

	useEffect(() => {
		if (containerRef.current == null) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		IncrementalDOM.patch(containerRef.current, md.renderToIncrementalDOM(content));

		setTimeout(() => detectCodeBlocks(containerRef), 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content]);

	if (!editorStore?.doc) {
		return (
			<Stack direction="row" justifyContent="center">
				<CircularProgress sx={{ mt: 2 }} />
			</Stack>
		);
	}

	return (
		<>
			<div
				ref={containerRef}
				data-color-mode={currentTheme}
				style={{ paddingBottom: "2rem" }}
				className="markdown-preview"
			/>

			{codeBlocks.map(({ id, text, container }) => (
				<CodeBlockCopyButton
					key={id}
					codeText={text}
					onCopy={() => setShowCopySuccess(true)}
					container={container}
				/>
			))}

			<Snackbar
				open={showCopySuccess}
				autoHideDuration={2000}
				onClose={() => setShowCopySuccess(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setShowCopySuccess(false)}
					severity="success"
					sx={{ width: "100%" }}
				>
					Code copied to clipboard!
				</Alert>
			</Snackbar>
		</>
	);
};

export default Preview;
