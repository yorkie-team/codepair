import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { xcodeDark, xcodeLight } from "@uiw/codemirror-theme-xcode";
import { EditorView } from "codemirror";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollSyncPane } from "react-scroll-sync";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../hooks/api/file";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { useFormatUtils } from "../../hooks/useFormatUtils";
import { useToolBar } from "../../hooks/useToolBar";
import { CodeKeyType, selectConfig } from "../../store/configSlice";
import { selectEditor, setCmView } from "../../store/editorSlice";
import { selectSetting } from "../../store/settingSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { imageUploader } from "../../utils/imageUploader";
import { intelligencePivot } from "../../utils/intelligence/intelligencePivot";
import { urlHyperlinkInserter } from "../../utils/urlHyperlinkInserter";
import { yorkieCodeMirror } from "../../utils/yorkie";
import EditorBottomBar, { BOTTOM_BAR_HEIGHT } from "./EditorBottomBar";
import ToolBar from "./ToolBar";

interface EditorProps {
	width: number | string;
}

function Editor(props: EditorProps) {
	const { width } = props;
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const [element, setElement] = useState<HTMLElement>();
	const editorStore = useSelector(selectEditor);
	const configStore = useSelector(selectConfig);
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
				configStore.codeKey === CodeKeyType.VIM ? vim() : [],
				keymap.of(setKeymapConfig()),
				basicSetup({ highlightSelectionMatches: false }),
				markdown(),
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

		const view = new EditorView({ state, parent: element });
		dispatch(setCmView(view));

		return () => {
			view?.destroy();
		};
	}, [
		element,
		editorStore.client,
		editorStore.doc,
		configStore.codeKey,
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
		<>
			<div style={{ height: `calc(100% - ${BOTTOM_BAR_HEIGHT}px)` }}>
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
							<ToolBar
								toolBarState={toolBarState}
								onChangeToolBarState={setToolBarState}
							/>
						)}
					</div>
				</ScrollSyncPane>
			</div>
			<EditorBottomBar width={width} />
		</>
	);
}

export default Editor;
