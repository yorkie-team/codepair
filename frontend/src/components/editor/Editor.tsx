import { useCallback, useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";

function Editor() {
	const [element, setElement] = useState<HTMLElement>();
	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	useEffect(() => {
		let view: EditorView | undefined = undefined;

		if (!element) {
			return;
		}

		const state = EditorState.create({
			doc: "123",
			extensions: [basicSetup, markdown()],
		});

		view = new EditorView({
			state,
			parent: element,
		});

		return () => {
			view?.destroy();
		};
	}, [element]);

	return <div ref={ref}></div>;
}

export default Editor;
