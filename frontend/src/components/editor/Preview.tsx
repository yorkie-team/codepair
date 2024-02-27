import MarkdownPreview from "@uiw/react-markdown-preview";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";
import { CircularProgress, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import "./editor.css";
import { addSoftLineBreak } from "../../utils/document";
import katex from "katex";
import { getCodeString } from "rehype-rewrite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

function Preview() {
	const currentTheme = useCurrentTheme();
	const editorStore = useSelector(selectEditor);
	const [content, setContent] = useState("");

	useEffect(() => {
		if (!editorStore.doc) return;

		const updatePreviewContent = () => {
			const editorText = editorStore.doc?.getRoot().content?.toString() || "";
			// Add soft line break
			setContent(addSoftLineBreak(editorText));
		};

		updatePreviewContent();

		const unsubsribe = editorStore.doc.subscribe("$.content", () => {
			updatePreviewContent();
		});

		return () => {
			unsubsribe();
			setContent("");
		};
	}, [editorStore.doc]);

	if (!editorStore?.doc)
		return (
			<Stack direction="row" justifyContent="center">
				<CircularProgress sx={{ mt: 2 }} />
			</Stack>
		);

	return (
		<MarkdownPreview
			source={addSoftLineBreak(content)}
			wrapperElement={{
				"data-color-mode": currentTheme,
				style: {
					whiteSpace: "wrap !important",
					WebkitUserModify: "read-only",
				},
			}}
			remarkPlugins={[remarkMath]}
			rehypePlugins={[rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]]}
			components={{
				code: ({ children = [], className, ...props }) => {
					// https://www.npmjs.com/package/@uiw/react-markdown-preview#support-custom-katex-preview
					if (typeof children === "string" && /^\$\$(.*)\$\$/.test(children)) {
						const html = katex.renderToString(children.replace(/^\$\$(.*)\$\$/, "$1"), {
							throwOnError: false,
						});
						return (
							<code
								dangerouslySetInnerHTML={{ __html: html }}
								style={{ background: "transparent" }}
							/>
						);
					}
					const code =
						props.node && props.node.children
							? getCodeString(props.node.children)
							: children;
					if (
						typeof code === "string" &&
						typeof className === "string" &&
						/^language-katex/.test(className.toLocaleLowerCase())
					) {
						const html = katex.renderToString(code, {
							throwOnError: false,
						});
						return (
							<code
								style={{ fontSize: "150%" }}
								dangerouslySetInnerHTML={{ __html: html }}
							/>
						);
					}
					return <code className={String(className)}>{children}</code>;
				},
			}}
		/>
	);
}

export default Preview;
