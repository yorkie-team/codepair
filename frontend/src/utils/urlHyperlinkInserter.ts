import { EditorView } from "codemirror";
import { CodePairDocType } from "../store/editorSlice";

const isValidUrl = (url: string) => {
	// eslint-disable-next-line no-useless-escape
	const urlRegex = /^(https?|ftp):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i;
	return urlRegex.test(url);
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

			insertLinkToEditor(url, view, doc);
			event.preventDefault();
		},
	});
};
