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

const DELAY = 500;

// markdown-it plugin to inject a copy button into fenced code blocks (single render pass)
const addCopyButtonFencePlugin = (md: MarkdownIt) => {
	md.renderer.rules.fence = (tokens, idx) => {
		const token = tokens[idx];
		const info = token.info ? token.info.trim() : "";
		const lang = info.split(/\s+/g)[0] || "";
		const code = token.content || "";

		// Prefer using configured highlighter if available (keeps current highlighting behavior)
		let highlighted = "";
		try {
			const rendererWithHighlight = md as MarkdownIt & {
				options?: { highlight?: (str: string, lang: string) => string };
			};
			const highlighter = rendererWithHighlight.options?.highlight;
			if (typeof highlighter === "function") {
				highlighted = highlighter(code, lang) || "";
			}
		} catch {
			highlighted = "";
		}

		const buttonHtml =
			'<button type="button" class="copied" aria-label="Copy code" title="Copy code">' +
			'<span class="octicon-copy"></span><span class="octicon-check"></span>' +
			"</button>";

		if (highlighted && highlighted !== code) {
			// If highlighter returns full markup, insert button as first child of <pre>
			return highlighted.replace(/<pre(\s[^>]*)?>/, (m) => `${m}${buttonHtml}`);
		}

		// Fallback rendering if no highlighter result: escape and wrap manually
		const escaped = md.utils.escapeHtml(code);
		const langClass = lang ? ` language-${lang}` : "";
		return `<pre class="${langClass.trim()}">${buttonHtml}<code>${escaped}</code></pre>`;
	};
};

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
	.use(addCopyButtonFencePlugin)
	.use(markdownItKatex)
	.use(markdownItSanitizer)
	.use(markdownItImageLazyLoading);

const Preview = () => {
	const currentTheme = useCurrentTheme();
	const editorStore = useSelector(selectEditor);
	const [content, setContent] = useState("");
	const [showCopySuccess, setShowCopySuccess] = useState(false);
	const [showCopyError, setShowCopyError] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

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
	}, [content]);

	// Event delegation for copy button interactions
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const copyText = async (text: string): Promise<boolean> => {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch {
				try {
					const textArea = document.createElement("textarea");
					textArea.value = text;
					textArea.style.position = "absolute";
					textArea.style.visibility = "hidden";
					document.body.appendChild(textArea);
					textArea.select();
					const ok = document.execCommand("copy");
					document.body.removeChild(textArea);
					return ok;
				} catch {
					return false;
				}
			}
		};

		const activate = (el: HTMLElement) => {
			el.classList.add("active");
			window.setTimeout(() => el.classList.remove("active"), 2000);
		};

		const onClick = async (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const btn = target.closest(".copied") as HTMLElement | null;
			if (!btn) return;

			const pre = btn.closest("pre");
			const code = pre?.querySelector("code");
			const text = code?.textContent ?? "";
			if (!text) return;

			const ok = await copyText(text);
			if (ok) {
				activate(btn);
				setShowCopySuccess(true);
			} else {
				setShowCopyError(true);
			}
		};

		container.addEventListener("click", onClick);
		return () => {
			container.removeEventListener("click", onClick);
		};
	}, []);

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

			<Snackbar
				open={showCopyError}
				autoHideDuration={3000}
				onClose={() => setShowCopyError(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setShowCopyError(false)}
					severity="error"
					sx={{ width: "100%" }}
				>
					Failed to copy code to clipboard
				</Alert>
			</Snackbar>
		</>
	);
};

export default Preview;
