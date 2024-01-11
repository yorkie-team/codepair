import { useCallback, useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";
import { yorkieCodeMirror } from "../../utils/yorkie";

function Editor() {
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
			],
		});

		view = new EditorView({
			state,
			parent: element,
		});

		return () => {
			view?.destroy();
		};
	}, [editorStore.doc, element]);

	return <div ref={ref}></div>;
}

export default Editor;
