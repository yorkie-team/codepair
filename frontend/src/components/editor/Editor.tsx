import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { Vim, vim } from "@replit/codemirror-vim";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-theme-xcode";
import { basicSetup, EditorView } from "codemirror";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollSyncPane } from "react-scroll-sync";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../hooks/api/file";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { useFormatUtils } from "../../hooks/useFormatUtils";
import { useToolBar } from "../../hooks/useToolBar";
import { CodeKeyType, selectEditor, setCmView } from "../../store/editorSlice";
import { selectSetting } from "../../store/settingSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { imageUploader } from "../../utils/imageUploader";
import { intelligencePivot } from "../../utils/intelligence/intelligencePivot";
import { urlHyperlinkInserter } from "../../utils/urlHyperlinkInserter";
import { yorkieCodeMirror } from "../../utils/yorkie";
import ToolBar from "./ToolBar";

function Editor() {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const [element, setElement] = useState<HTMLElement>();
	const editorStore = useSelector(selectEditor);
	const settingStore = useSelector(selectSetting);
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createUploadUrl } = useCreateUploadUrlMutation();
	const { mutateAsync: uploadFile } = useUploadFileMutation();
	const { applyFormat, setKeymapConfig } = useFormatUtils();
	const { toolBarState, setToolBarState, updateFormatBar } = useToolBar();

	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	useEffect(() => {
		if (
			!element ||
			!editorStore.doc ||
			!editorStore.client ||
			!editorStore.codeKey ||
			typeof settingStore.fileUpload?.enable !== "boolean"
		) {
			return;
		}

		const handleUploadImage = async (file: File) => {
			if (!workspaceStore.data) return "";

			const uploadUrlData = await createUploadUrl({
				workspaceId: workspaceStore.data.id,
				contentLength: new Blob([file]).size,
				contentType: file.type,
			});

			await uploadFile({ ...uploadUrlData, file });

			return `${import.meta.env.VITE_API_ADDR}/files/${uploadUrlData.fileKey}`;
		};

		const state = EditorState.create({
			doc: editorStore.doc.getRoot().content?.toString() ?? "",
			extensions: [
				keymap.of(setKeymapConfig()),
				basicSetup,
				markdown(),
				editorStore.codeKey === CodeKeyType.vim ? vim() : [],
				themeMode == "light" ? xcodeLight : xcodeDark,
				EditorView.theme({ "&": { width: "100%" } }),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						updateFormatBar(update);
					}
				}),
				yorkieCodeMirror(editorStore.doc, editorStore.client),
				intelligencePivot,
				...(settingStore.fileUpload.enable
					? [imageUploader(handleUploadImage, editorStore.doc)]
					: []),
				urlHyperlinkInserter(editorStore.doc),
			],
		});

		// Vim key mapping: Map 'jj' to '<Esc>' in insert mode
		Vim.map("jj", "<Esc>", "insert");

		const view = new EditorView({ state, parent: element });
		dispatch(setCmView(view));

		return () => {
			view?.destroy();
		};
	}, [
		element,
		editorStore.client,
		editorStore.doc,
		editorStore.codeKey,
		themeMode,
		workspaceStore.data,
		settingStore.fileUpload?.enable,
		dispatch,
		createUploadUrl,
		uploadFile,
		applyFormat,
		updateFormatBar,
		setKeymapConfig,
	]);

	return (
		<ScrollSyncPane>
			<div
				style={{
					height: "100%",
					overflow: "auto",
				}}
			>
				<div
					ref={ref}
					style={{
						display: "flex",
						alignItems: "stretch",
						minHeight: "100%",
					}}
				/>
				{Boolean(toolBarState.show) && (
					<ToolBar toolBarState={toolBarState} onChangeToolBarState={setToolBarState} />
				)}
			</div>
		</ScrollSyncPane>
	);
}

export default Editor;
