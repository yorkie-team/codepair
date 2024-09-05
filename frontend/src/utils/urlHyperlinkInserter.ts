import { EditorView } from "codemirror";
import validator from "validator";
import { CodePairDocType } from "../store/editorSlice";

const isValidUrl = (url: string) => {
	return validator.isURL(url);
};

const insertLinkToEditor = (url: string, view: EditorView, doc: CodePairDocType) => {
	const { from, to } = view.state.selection.main;
	const selectedText = view.state.sliceDoc(from, to);
	const insert = `[${selectedText}](${url})`;

	doc.update((root, presence) => {
		root.content.edit(from, to, insert);
		presence.set({
			selection: root.content.indexRangeToPosRange([
				from + insert.length,
				from + insert.length,
			]),
		});
	});

	view.dispatch({
		changes: { from, to, insert },
		selection: {
			anchor: from + insert.length,
		},
	});
};

export const urlHyperlinkInserter = (doc: CodePairDocType) => {
	return EditorView.domEventHandlers({
		paste(event, view) {
			const url = event.clipboardData?.getData("text/plain");
			if (!url || !isValidUrl(url)) return;

			const { from, to } = view.state.selection.main;
			if (from === to) return;

			insertLinkToEditor(url, view, doc);
			event.preventDefault();
		},
	});
};
