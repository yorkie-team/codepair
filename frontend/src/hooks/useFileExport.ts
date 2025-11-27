import { useSnackbar } from "notistack";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectDocument } from "../store/documentSlice";
import { selectEditor } from "../store/editorSlice";
import { marked } from "marked";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

	const handleExportFile = useCallback(
		async (exportType: string) => {
			try {
				const markdown = editorStore.doc?.getRoot().content?.toString() || "";
				const documentName = documentStore.data?.title || "codepair_document";

				enqueueSnackbar(`${exportType.toUpperCase()} file export started`, {
					variant: "info",
				});

				let blob: Blob;
				let fileName: string;

				switch (exportType) {
					case FileExtension.Markdown:
						blob = new Blob([markdown], { type: "text/markdown" });
						fileName = `${documentName}.md`;
						break;
					case FileExtension.HTML:
						{
							const html = await marked(markdown);
							blob = new Blob([html], { type: "text/html" });
							fileName = `${documentName}.html`;
						}
						break;
					case FileExtension.PDF:
						{
							const html = await marked(markdown);

							const element = document.createElement("div");
							element.innerHTML = html;
							element.style.width = "794px"; // A4
							element.style.padding = "40px";
							element.style.fontFamily = "Arial, sans-serif";
							element.style.fontSize = "14px";
							element.style.lineHeight = "1.6";
							element.style.color = "#000000";
							element.style.backgroundColor = "#ffffff";
							element.style.position = "absolute";
							element.style.left = "-9999px";
							element.style.top = "0";

							document.body.appendChild(element);

							try {
								const canvas = await html2canvas(element, {
									scale: 2,
									useCORS: true,
									logging: false,
									backgroundColor: "#ffffff",
								});

								const imgData = canvas.toDataURL("image/png");
								const pdf = new jsPDF({
									orientation: "portrait",
									unit: "mm",
									format: "a4",
								});

								const imgWidth = 210;
								const pageHeight = 297; // A4
								const imgHeight = (canvas.height * imgWidth) / canvas.width;
								let heightLeft = imgHeight;
								let position = 0;

								pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
								heightLeft -= pageHeight;

								while (heightLeft > 0) {
									position = heightLeft - imgHeight;
									pdf.addPage();
									pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
									heightLeft -= pageHeight;
								}

								blob = pdf.output("blob");
								fileName = `${documentName}.pdf`;
							} finally {
								document.body.removeChild(element);
							}
						}
						break;
					default:
						throw new Error(`Unsupported export type: ${exportType}`);
				}

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
		[editorStore, documentStore, enqueueSnackbar]
	);

	const handleExportToPDF = () => handleExportFile(FileExtension.PDF);
	const handleExportToHTML = () => handleExportFile(FileExtension.HTML);
	const handleExportToMarkdown = () => handleExportFile(FileExtension.Markdown);

	return { handleExportToPDF, handleExportToHTML, handleExportToMarkdown };
};
