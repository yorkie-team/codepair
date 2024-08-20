import { useCallback, useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDispatch, useSelector } from "react-redux";
import { selectEditor, setCmView } from "../../store/editorSlice";
import { yorkieCodeMirror } from "../../utils/yorkie";
import { xcodeLight, xcodeDark } from "@uiw/codemirror-theme-xcode";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { keymap, ViewUpdate } from "@codemirror/view";
import { intelligencePivot } from "../../utils/intelligence/intelligencePivot";
import { imageUploader } from "../../utils/imageUploader";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../hooks/api/file";
import { selectWorkspace } from "../../store/workspaceSlice";
import { ScrollSyncPane } from "react-scroll-sync";
import { selectSetting } from "../../store/settingSlice";
import { ToolBarState, useFormatUtils, FormatType } from "../../hooks/useFormatUtils";

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

	const [toolBarState, setToolBarState] = useState<ToolBarState>({
		show: false,
		position: { top: 0, left: 0 },
		selectedFormats: new Set<FormatType>(),
	});

	const { getFormatMarkerLength, applyFormat, setKeymapConfig } = useFormatUtils();

	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	const updateFormatBar = useCallback(
		(update: ViewUpdate) => {
			const selection = update.state.selection.main;
			if (!selection.empty) {
				const coords = update.view.coordsAtPos(selection.from);
				if (coords) {
					const maxLength = getFormatMarkerLength(update.view.state, selection.from);

					const selectedTextStart = update.state.sliceDoc(
						selection.from - maxLength,
						selection.from
					);
					const selectedTextEnd = update.state.sliceDoc(
						selection.to,
						selection.to + maxLength
					);
					const formats = new Set<FormatType>();

					const checkAndAddFormat = (marker: string, format: FormatType) => {
						if (
							selectedTextStart.includes(marker) &&
							selectedTextEnd.includes(marker)
						) {
							formats.add(format);
						}
					};

					checkAndAddFormat("**", FormatType.BOLD);
					checkAndAddFormat("_", FormatType.ITALIC);
					checkAndAddFormat("`", FormatType.CODE);
					checkAndAddFormat("~~", FormatType.STRIKETHROUGH);

					// TODO: Modify the rendering method so that it is not affected by the size of the Toolbar
					setToolBarState((prev) => ({
						...prev,
						show: true,
						position: {
							top: coords.top - 5,
							left: coords.left,
						},
						selectedFormats: formats,
					}));
				}
			} else {
				setToolBarState((prev) => ({
					...prev,
					show: false,
					selectedFormats: new Set(),
				}));
			}
		},
		[getFormatMarkerLength]
	);

	useEffect(() => {
		let view: EditorView | undefined = undefined;

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
				keymap.of(setKeymapConfig()),
				basicSetup,
				markdown(),
				yorkieCodeMirror(editorStore.doc, editorStore.client),
				themeMode == "light" ? xcodeLight : xcodeDark,
				EditorView.theme({
					"&": { width: "100%" },
				}),
				EditorView.lineWrapping,
				intelligencePivot,
				...(settingStore.fileUpload.enable
					? [imageUploader(handleUploadImage, editorStore.doc)]
					: []),
				EditorView.updateListener.of((update) => {
					if (update.selectionSet) {
						updateFormatBar(update);
					}
				}),
			],
		});

		view = new EditorView({
			state,
			parent: element,
		});

		dispatch(setCmView(view));

		return () => {
			view?.destroy();
		};
	}, [
		dispatch,
		editorStore.client,
		editorStore.doc,
		element,
		themeMode,
		workspaceStore.data,
		createUploadUrl,
		uploadFile,
		settingStore.fileUpload?.enable,
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
