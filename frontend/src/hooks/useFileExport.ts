import axios from "axios";
import { useSnackbar } from "notistack";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectDocument } from "../store/documentSlice";
import { selectEditor } from "../store/editorSlice";

export const enum FileExtension {
	Markdown = "markdown",
	HTML = "html",
	PDF = "pdf",
}

interface UseFileExportReturn {
	handleExportToPDF: () => void;
	handleExportToHTML: () => void;
	handleExportToMarkdown: () => void;
}

export const useFileExport = (): UseFileExportReturn => {
	const { enqueueSnackbar } = useSnackbar();
	const editorStore = useSelector(selectEditor);
	const documentStore = useSelector(selectDocument);

	const markdown = editorStore.doc?.getRoot().content?.toString() || "";
	const documentName = documentStore.data?.title || "codepair_document";

	const handleExportFile = useCallback(
		async (exportType: string) => {
			try {
				enqueueSnackbar(`${exportType.toUpperCase()} 파일 내보내기 시작...`, {
					variant: "info",
				});

				const response = await axios.post(
					"/files/export-markdown",
					{
						exportType,
						content: markdown,
						fileName: documentName,
					},
					{
						responseType: "blob",
					}
				);

				const blob = new Blob([response.data], { type: `application/${exportType}` });
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", `${encodeURIComponent(documentName)}.${exportType}`);
				document.body.appendChild(link);
				link.click();
				if (link.parentNode) link.parentNode.removeChild(link);
				window.URL.revokeObjectURL(url);

				enqueueSnackbar(`${exportType.toUpperCase()} 파일이 성공적으로 내보내졌습니다.`, {
					variant: "success",
				});
			} catch (error) {
				console.error("오류:", error);
				enqueueSnackbar(`${exportType.toUpperCase()} 파일 내보내기에 실패했습니다.`, {
					variant: "error",
				});
			}
		},
		[markdown, documentName, enqueueSnackbar]
	);

	const handleExportToPDF = () => handleExportFile(FileExtension.PDF);
	const handleExportToHTML = () => handleExportFile(FileExtension.HTML);
	const handleExportToMarkdown = () => handleExportFile(FileExtension.Markdown);

	return { handleExportToPDF, handleExportToHTML, handleExportToMarkdown };
};
