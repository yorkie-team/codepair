import { useCallback, useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";
import { yorkieCodeMirror } from "../../utils/yorkie";
import toolbar, { markdownItems } from "codemirror-toolbar";
import { xcodeLight, xcodeDark } from "@uiw/codemirror-theme-xcode";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

function Editor() {
	const themeMode = useCurrentTheme();
	const [element, setElement] = useState<HTMLElement>();
	const editorStore = useSelector(selectEditor);
	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	useEffect(() => {
		let view: EditorView | undefined = undefined;

		if (!element || !editorStore.doc || !editorStore.client) {
			return;
		}

		const state = EditorState.create({
			doc: editorStore.doc.getRoot().content?.toString() ?? "",
			extensions: [
				basicSetup,
				markdown(),
				yorkieCodeMirror(editorStore.doc, editorStore.client),
				toolbar({
					items: markdownItems,
				}),
				themeMode == "light" ? xcodeLight : xcodeDark,
				EditorView.theme({
					"&": { width: "100%" },
				}),
				EditorView.lineWrapping,
				keymap.of([indentWithTab]),
			],
		});

		view = new EditorView({
			state,
			parent: element,
		});

		return () => {
			view?.destroy();
		};
	}, [editorStore.client, editorStore.doc, element, themeMode]);

	return (
		<div
			ref={ref}
			style={{
				display: "flex",
				alignItems: "stretch",
				height: "100%",
			}}
		/>
	);
}

export default Editor;
