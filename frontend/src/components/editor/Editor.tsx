import { useCallback, useEffect, useState } from "react";
import { EditorState, Text, EditorSelection, Transaction } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDispatch, useSelector } from "react-redux";
import { selectEditor, setCmView } from "../../store/editorSlice";
import { yorkieCodeMirror } from "../../utils/yorkie";
import { xcodeLight, xcodeDark } from "@uiw/codemirror-theme-xcode";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { keymap, ViewUpdate } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { intelligencePivot } from "../../utils/intelligence/intelligencePivot";
import { imageUploader } from "../../utils/imageUploader";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../hooks/api/file";
import { selectWorkspace } from "../../store/workspaceSlice";
import { ScrollSyncPane } from "react-scroll-sync";
import { selectSetting } from "../../store/settingSlice";
import { FormatType } from "../../utils/format";

import FormatBar from "./FormatBar";

function Editor() {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const [element, setElement] = useState<HTMLElement>();
	const editorStore = useSelector(selectEditor);
	const settingStore = useSelector(selectSetting);
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createUploadUrl } = useCreateUploadUrlMutation();
	const { mutateAsync: uploadFile } = useUploadFileMutation();

	const [showFormatBar, setShowFormatBar] = useState(false);
	const [formatBarPosition, setFormatBarPosition] = useState({ top: 0, left: 0 });
	const [selectedFormats, setSelectedFormats] = useState<Set<FormatType>>(new Set());

	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	const getFormatMarker = useCallback((formatType: FormatType) => {
		switch (formatType) {
			case FormatType.BOLD:
				return "**";
			case FormatType.ITALIC:
				return "_";
			case FormatType.CODE:
				return "`";
			case FormatType.STRIKETHROUGH:
				return "~~";
		}
	}, []);

	const getFormatMarkerLength = (state: EditorState, from: number) => {
		const maxCheckLength = 10;
		const docSlice = state.sliceDoc(Math.max(0, from - maxCheckLength), from).toString();
		let cnt = 0;

		for (let i = docSlice.length - 1; i >= 0; i--) {
			if (!["*", "_", "`", "~"].includes(docSlice[i])) break;
			cnt++;
		}

		return cnt;
	};

	const updateFormatBar = useCallback((update: ViewUpdate) => {
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

				if (selectedTextStart.includes("**") && selectedTextEnd.includes("**"))
					formats.add(FormatType.BOLD);
				if (selectedTextStart.includes("_") && selectedTextEnd.includes("_"))
					formats.add(FormatType.ITALIC);
				if (selectedTextStart.includes("`") && selectedTextEnd.includes("`"))
					formats.add(FormatType.CODE);
				if (selectedTextStart.includes("~~") && selectedTextEnd.includes("~~"))
					formats.add(FormatType.STRIKETHROUGH);

				setSelectedFormats(formats);
				setFormatBarPosition({
					top: coords.top - 10,
					left: coords.left + 20,
				});
				setShowFormatBar(true);
			}
		} else {
			setShowFormatBar(false);
			setSelectedFormats(new Set());
		}
	}, []);

	const applyFormat = useCallback(
		(formatType: FormatType) => {
			const marker = getFormatMarker(formatType);
			const markerLength = marker.length;

			return ({ state, dispatch }: EditorView) => {
				const changes = state.changeByRange((range) => {
					const maxLength = getFormatMarkerLength(state, range.from);
					const beforeIdx = state
						.sliceDoc(
							range.from - maxLength < 0 ? 0 : range.from - maxLength,
							range.from
						)
						.indexOf(marker);
					const afterIdx = state.sliceDoc(range.to, range.to + maxLength).indexOf(marker);

					const changes = [];

					changes.push(
						beforeIdx === -1
							? {
									from: range.from,
									insert: Text.of([marker]),
								}
							: {
									from: range.from - maxLength + beforeIdx,
									to: range.from - maxLength + beforeIdx + markerLength,
									insert: Text.of([""]),
								}
					);

					changes.push(
						afterIdx === -1
							? {
									from: range.to,
									insert: Text.of([marker]),
								}
							: {
									from: range.to + afterIdx,
									to: range.to + afterIdx + markerLength,
									insert: Text.of([""]),
								}
					);

					const extendBefore = beforeIdx === -1 ? markerLength : -markerLength;
					const extendAfter = afterIdx === -1 ? markerLength : -markerLength;

					return {
						changes,
						range: EditorSelection.range(
							range.from + extendBefore,
							range.to + extendAfter
						),
					};
				});
				dispatch(
					state.update(changes, {
						scrollIntoView: true,
						annotations: Transaction.userEvent.of("input"),
					})
				);

				return true;
			};
		},
		[getFormatMarker]
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
				keymap.of([
					indentWithTab,
					{ key: "Mod-b", run: applyFormat(FormatType.BOLD) },
					{ key: "Mod-i", run: applyFormat(FormatType.ITALIC) },
					{ key: "Mod-e", run: applyFormat(FormatType.CODE) },
					{ key: "Mod-Shift-x", run: applyFormat(FormatType.STRIKETHROUGH) },
				]),
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
				{showFormatBar && editorStore.cmView && (
					<FormatBar
						showFormatBar={showFormatBar}
						setShowFormatBar={setShowFormatBar}
						formatBarPosition={formatBarPosition}
						selectedFormats={selectedFormats}
						setSelectedFormats={setSelectedFormats}
						applyFormat={applyFormat}
						cmView={editorStore.cmView}
					/>
				)}
			</div>
		</ScrollSyncPane>
	);
}

export default Editor;
