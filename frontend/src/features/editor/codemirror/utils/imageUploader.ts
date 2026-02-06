import { EditorView } from "codemirror";
import { CodePairDocType } from "../../store/editorSlice";

export type UploadCallback = (file: File) => Promise<string>;

const convertImageFilesToUrlList = async (fileList: FileList, uploadCallback: UploadCallback) => {
	return await Promise.all(
		Array.from(fileList).map((file) => {
			if (!file.type.startsWith("image/")) return;

			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(file);

				reader.onload = function () {
					resolve(uploadCallback(file));
				};
				reader.onerror = function (error) {
					reject(error);
				};
			});
		})
	);
};

const insertImageToEditor = (url: string, view: EditorView, doc: CodePairDocType) => {
	if (!url) return;

	const selection = view.state.selection.main;
	const from = selection.to;
	const to = from;
	const insert = `\n![image](${url})\n`;
	const newAnchor = to + insert.length;

	doc.update((root, presence) => {
		root.content.edit(from, to, insert);
		presence.set({
			selection: root.content.indexRangeToPosRange([newAnchor, newAnchor]),
		});
	});

	view.dispatch({
		changes: { from, to, insert },
		selection: {
			anchor: newAnchor,
		},
	});
};

export const imageUploader = (uploadCallback: UploadCallback, doc: CodePairDocType) => {
	return EditorView.domEventHandlers({
		paste(event, view) {
			if (!event.clipboardData?.files || event.clipboardData?.files.length == 0) return;

			convertImageFilesToUrlList(event.clipboardData.files, uploadCallback).then((urlList) =>
				urlList.forEach((url) => insertImageToEditor(url as string, view, doc))
			);
		},
		drop(event, view) {
			if (!event.dataTransfer?.files || event.dataTransfer?.files.length == 0) return;

			convertImageFilesToUrlList(event.dataTransfer.files, uploadCallback).then((urlList) =>
				urlList.forEach((url) => insertImageToEditor(url as string, view, doc))
			);
		},
	});
};
