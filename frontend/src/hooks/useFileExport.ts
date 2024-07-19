import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import jspdfHtml2canvas from "jspdf-html2canvas";
import { useSnackbar } from "notistack";
import { useCallback, useContext } from "react";
import { useSelector } from "react-redux";
import { PreviewRefContext } from "../contexts/PreviewRefContext";
import { selectEditor } from "../store/editorSlice";
import { documentNameStorage } from "../utils/localStorage";

interface useFileExportReturn {
	exportToPDF: () => Promise<void>;
	exportToTXT: () => void;
	exportToDOCX: () => void;
}

export const useFileExport = (): useFileExportReturn => {
	const editorStore = useSelector(selectEditor);
	const markdown = editorStore.doc?.getRoot().content?.toString() || "";

	const { previewRef } = useContext(PreviewRefContext);

	const { enqueueSnackbar } = useSnackbar();

	const documentName = documentNameStorage.getDocumentName() || 'codepair_document';

	const exportToPDF = useCallback(async () => {
		if (previewRef.current?.mdp && previewRef.current.mdp.current instanceof HTMLDivElement) {
			try {
				await jspdfHtml2canvas(previewRef.current.mdp.current, {
					output: `${documentName}`,
					jsPDF: {
						format: "a4",
						orientation: "portrait",
					},
					html2canvas: {
						scale: 3,
					},
				});
			} catch (error) {
				if(previewRef.current.mdp.current) {
					enqueueSnackbar("Content is empty", { variant: "error" });
				} else {
					enqueueSnackbar("Failed to export PDF", { variant: "error" });
				}
			}
		} else {
			enqueueSnackbar("Please try again", { variant: "error" });
		}
	}, [previewRef, enqueueSnackbar, documentName]);

	const exportToTXT = useCallback(() => {
		const blob = new Blob([markdown], { type: "text/plain;charset=utf-8" });
		saveAs(blob, documentName);
	}, [documentName, markdown]);

	const exportToDOCX = useCallback(() => {
		const doc = new Document({
			sections: [
				{
					properties: {},
					children: [
						new Paragraph({
							children: [new TextRun(markdown)],
						}),
					],
				},
			],
		});

		Packer.toBlob(doc).then((blob) => {
			saveAs(blob, documentName);
		});
	}, [markdown, documentName]);

	return { exportToPDF, exportToTXT, exportToDOCX };
};
