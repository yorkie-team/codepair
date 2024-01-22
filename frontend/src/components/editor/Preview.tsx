import MarkdownPreview from "@uiw/react-markdown-preview";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import "./editor.css";

function Preview() {
	const currentTheme = useCurrentTheme();
	const editorStore = useSelector(selectEditor);
	const [content, setContent] = useState("");

	useEffect(() => {
		if (!editorStore.doc) return;

		setContent(editorStore.doc?.getRoot().content?.toString() || "");

		const unsubsribe = editorStore.doc.subscribe("$.content", () => {
			setContent(editorStore.doc?.getRoot().content.toString() as string);
		});

		return () => {
			unsubsribe();
			setContent("");
		};
	}, [editorStore.doc]);

	if (!editorStore?.doc) return <CircularProgress sx={{ marginX: "auto", mt: 4 }} />;

	return (
		<MarkdownPreview
			source={content}
			wrapperElement={{
				"data-color-mode": currentTheme,
			}}
		/>
	);
}

export default Preview;
