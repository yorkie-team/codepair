import { useCallback, useEffect, useState } from "react";
import { EditorState, Text, EditorSelection, Transaction } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { useDispatch, useSelector } from "react-redux";
import { selectEditor, setCmView } from "../../store/editorSlice";
import { yorkieCodeMirror } from "../../utils/yorkie";
import { xcodeLight, xcodeDark } from "@uiw/codemirror-theme-xcode";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { intelligencePivot } from "../../utils/intelligence/intelligencePivot";
import { imageUploader } from "../../utils/imageUploader";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../hooks/api/file";
import { selectWorkspace } from "../../store/workspaceSlice";
import { ScrollSyncPane } from "react-scroll-sync";
import { selectSetting } from "../../store/settingSlice";

function Editor() {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const [element, setElement] = useState<HTMLElement>();
	const editorStore = useSelector(selectEditor);
	const settingStore = useSelector(selectSetting);
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createUploadUrl } = useCreateUploadUrlMutation();
	const { mutateAsync: uploadFile } = useUploadFileMutation();

	const ref = useCallback((node: HTMLElement | null) => {
		if (!node) return;
		setElement(node);
	}, []);

	const getMarker = useCallback((formatType: "bold" | "italic" | "code") => {
		switch (formatType) {
			case "bold":
				return "**";
			case "italic":
				return "_";
			case "code":
				return "`";
		}
	}, []);

	const applyFormat = useCallback(
		(formatType: "bold" | "italic" | "code") => {
			const marker = getMarker(formatType);
			const markerLength = marker.length;

			return (view: EditorView) => {
				const changes = view.state.changeByRange((range) => {
					const isBefore = view.state
						.sliceDoc(range.from - markerLength, range.from)
						.includes(marker);
					const isAfter = view.state
						.sliceDoc(range.to, range.to + markerLength)
						.includes(marker);

					const changes = [];

					changes.push(
						isBefore
							? {
									from: range.from - markerLength,
									to: range.from,
									insert: Text.of([""]),
								}
							: {
									from: range.from,
									insert: Text.of([marker]),
								}
					);

					changes.push(
						isAfter
							? {
									from: range.to,
									to: range.to + markerLength,
									insert: Text.of([""]),
								}
							: {
									from: range.to,
									insert: Text.of([marker]),
								}
					);

					const extendBefore = isBefore ? -markerLength : markerLength;
					const extendAfter = isAfter ? -markerLength : markerLength;

					return {
						changes,
						range: EditorSelection.range(
							range.from + extendBefore,
							range.to + extendAfter
						),
					};
				});
				view.dispatch(
					view.state.update(changes, {
						scrollIntoView: true,
						annotations: Transaction.userEvent.of("input"),
					})
				);

				return true;
			};
		},
		[getMarker]
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
				basicSetup,
				markdown(),
				yorkieCodeMirror(editorStore.doc, editorStore.client),
				themeMode == "light" ? xcodeLight : xcodeDark,
				EditorView.theme({
					"&": { width: "100%" },
				}),
				EditorView.lineWrapping,
				keymap.of([
					indentWithTab,
					{ key: "Mod-b", run: applyFormat("bold") },
					{ key: "Mod-k", run: applyFormat("italic") },
					{ key: "Mod-e", run: applyFormat("code") },
				]),
				intelligencePivot,
				...(settingStore.fileUpload.enable
					? [imageUploader(handleUploadImage, editorStore.doc)]
					: []),
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
			</div>
		</ScrollSyncPane>
	);
}

export default Editor;
