import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	Box,
	Typography,
	Chip,
	CircularProgress,
	Alert,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import moment from "moment";
import { YSON } from "@yorkie-js/sdk";
import type { RevisionSummary } from "@yorkie-js/sdk";
import { useEffect, useRef, useState } from "react";
import { useCurrentTheme } from "../../../hooks/useCurrentTheme";
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
import "katex/dist/katex.min.css";
import "@codepair/codemirror/src/styles/editor.css";
import "@codepair/codemirror/src/styles/preview.css";
import { addSoftLineBreak } from "../../../features/document";

interface PreviewRevisionDialogProps {
	open: boolean;
	revision: RevisionSummary | null;
	onClose: () => void;
	getRevision: (revisionId: string) => Promise<RevisionSummary>;
}

// markdown-it plugin to inject a copy button into fenced code blocks
const markdownItFencedCodeBlockCopy = (md: MarkdownIt) => {
	md.renderer.rules.fence = (tokens, idx) => {
		const token = tokens[idx];
		const info = token.info ? token.info.trim() : "";
		const lang = info.split(/\s+/g)[0] || "";
		const code = token.content || "";
		const hasContent = code.trim().length > 0;

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

		const buttonHtml = `<button type="button" class="copy-button" aria-label="Copy code" title="Copy code">
				<span class="material-icons">content_copy</span><span class="material-icons">check</span>
				</button>`;

		if (!hasContent) {
			return highlighted;
		}
		return highlighted.replace(/<pre(\s[^>]*)?>/, (m) => `${m}${buttonHtml}`);
	};
};

const md = new MarkdownIt({
	html: true,
	linkify: true,
	breaks: true,
	highlight: (code: string, lang: string): string => {
		if (lang.trim() === "") {
			return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
		}
		try {
			return `<pre class="language-${lang}"><code>${toHtml(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				refractor.highlight(code, lang) as any
			)}</code></pre>`;
		} catch (error) {
			console.error(`Error highlighting code with language '${lang}':`, error);
			return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
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
	.use(markdownItFencedCodeBlockCopy)
	.use(markdownItKatex)
	.use(markdownItSanitizer)
	.use(markdownItImageLazyLoading);

function PreviewRevisionDialog({
	open,
	revision,
	onClose,
	getRevision,
}: PreviewRevisionDialogProps) {
	const currentTheme = useCurrentTheme();
	const containerRef = useRef<HTMLDivElement>(null);
	const [content, setContent] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!open || !revision) {
			setContent("");
			setError(null);
			return;
		}

		const loadRevisionSnapshot = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const fullRevision = await getRevision(revision.id);
				if (fullRevision.snapshot) {
					// Parse YSON and convert to Markdown
					try {
						const root = YSON.parse<{ content: YSON.Text }>(fullRevision.snapshot);
						const text = YSON.textToString(root.content);
						setContent(addSoftLineBreak(text));
					} catch {
						// If YSON parsing fails, fallback to original snapshot
						setContent(addSoftLineBreak(fullRevision.snapshot));
					}
				} else {
					setContent("");
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Failed to load revision");
				setError(error);
				setContent("");
			} finally {
				setIsLoading(false);
			}
		};

		loadRevisionSnapshot();
	}, [open, revision, getRevision]);

	useEffect(() => {
		if (containerRef.current == null || !content) {
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
					const success = document.execCommand("copy");
					document.body.removeChild(textArea);
					return success;
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
			const copyButton = target.closest(".copy-button") as HTMLElement | null;
			if (!copyButton) return;

			const pre = copyButton.closest("pre");
			const code = pre?.querySelector("code");
			const text = code?.textContent ?? "";
			if (!text) return;

			const success = await copyText(text);
			if (success) {
				activate(copyButton);
			}
		};

		container.addEventListener("click", onClick);
		return () => {
			container.removeEventListener("click", onClick);
		};
	}, [open, content]);

	if (!revision) return null;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					height: { xs: "100%", sm: "90vh" },
					maxHeight: { xs: "100%", sm: "90vh" },
				},
			}}
		>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						pr: 1,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
						<Typography variant="h6" component="span">
							{revision.label}
						</Typography>
						<Chip
							label={moment(revision.createdAt).fromNow()}
							size="small"
							variant="outlined"
						/>
					</Box>
					<IconButton edge="end" onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
				{revision.description && (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						{revision.description}
					</Typography>
				)}
			</DialogTitle>

			<DialogContent dividers>
				{isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress />
					</Box>
				) : error ? (
					<Alert severity="error" sx={{ m: 2 }}>
						{error.message}
					</Alert>
				) : content ? (
					<div
						ref={containerRef}
						data-color-mode={currentTheme}
						style={{ paddingBottom: "2rem" }}
						className="markdown-preview"
					/>
				) : (
					<Typography color="text.secondary" align="center" sx={{ py: 4 }}>
						No content available
					</Typography>
				)}
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}

export default PreviewRevisionDialog;
