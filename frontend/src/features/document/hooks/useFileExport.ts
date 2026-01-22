import { useSnackbar } from "notistack";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectDocument } from "../store/documentSlice";
import { selectEditor } from "../../editor";
import { useExportFileMutation } from "../../../hooks/api/file";

export const enum FileExtension {
	Markdown = "markdown",
	HTML = "html",
	PDF = "pdf",
}

type ExportFunction = () => void;

interface UseFileExportReturn {
	handleExportToPDF: ExportFunction;
	handleExportToHTML: ExportFunction;
	handleExportToMarkdown: ExportFunction;
}

export const useFileExport = (): UseFileExportReturn => {
	const { enqueueSnackbar } = useSnackbar();
	const editorStore = useSelector(selectEditor);
	const documentStore = useSelector(selectDocument);

	const exportFileMutation = useExportFileMutation();

	const handleExportFile = useCallback(
		async (exportType: string) => {
			try {
				const markdown = editorStore.doc?.getRoot().content?.toString() || "";
				const documentName = documentStore.data?.title || "codepair_document";
				enqueueSnackbar(`${exportType.toUpperCase()} file export started`, {
					variant: "info",
				});

				const response = await exportFileMutation.mutateAsync({
					exportType,
					content: markdown,
					fileName: documentName,
				});

				const contentDisposition = response.headers["content-disposition"];
				const fileNameMatch = contentDisposition?.match(/filename="?(.+)"?\s*$/i);
				const fileName = fileNameMatch ? fileNameMatch[1] : `${documentName}.${exportType}`;

				const blob = new Blob([response.data], { type: response.headers["content-type"] });

				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", fileName);
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);

				enqueueSnackbar(`${exportType.toUpperCase()} file exported successfully`, {
					variant: "success",
				});
			} catch (error) {
				console.error("Error:", error);
				enqueueSnackbar(`Failed to export ${exportType.toUpperCase()} file`, {
					variant: "error",
				});
			}
		},
		[editorStore, documentStore, enqueueSnackbar, exportFileMutation]
	);

	const handleExportToPDF = () => handleExportFile(FileExtension.PDF);
	const handleExportToHTML = () => handleExportFile(FileExtension.HTML);
	const handleExportToMarkdown = () => handleExportFile(FileExtension.Markdown);

	return { handleExportToPDF, handleExportToHTML, handleExportToMarkdown };
};
