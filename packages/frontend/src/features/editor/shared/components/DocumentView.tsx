import { Backdrop, CircularProgress } from "@mui/material";
import { useWindowWidth } from "@react-hook/window-size";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectConfig, selectFeatureSetting, setCodeKeyType } from "../../../../features/settings";
import { selectEditor, setEditorPort } from "../../store/editorSlice";
import { selectWorkspace } from "../../../../features/workspace";
import { useCurrentTheme } from "../../../../hooks/useCurrentTheme";
import { useCreateUploadUrlMutation, useUploadFileMutation } from "../../../../hooks/api/file";
import { EditorSuite } from "@codepair/codemirror";
import { YorkieIntelligence } from "../../../../features/intelligence";
import type { EditorPort } from "@codepair/ui";
import { CodeKeyType } from "@codepair/ui";
import ModeSwitcher from "./ModeSwitcher";

function DocumentView() {
	const dispatch = useDispatch();
	const editorStore = useSelector(selectEditor);
	const windowWidth = useWindowWidth();
	const configStore = useSelector(selectConfig);
	const featureSettingStore = useSelector(selectFeatureSetting);
	const workspaceStore = useSelector(selectWorkspace);
	const themeMode = useCurrentTheme();
	const { mutateAsync: createUploadUrl } = useCreateUploadUrlMutation();
	const { mutateAsync: uploadFile } = useUploadFileMutation();

	const handleUploadImage = useCallback(
		async (file: File) => {
			if (!workspaceStore.data) return "";

			const uploadUrlData = await createUploadUrl({
				workspaceId: workspaceStore.data.id,
				contentLength: new Blob([file]).size,
				contentType: file.type,
			});

			await uploadFile({ ...uploadUrlData, file });

			return `${import.meta.env.VITE_API_ADDR}/files/${uploadUrlData.fileKey}`;
		},
		[workspaceStore.data, createUploadUrl, uploadFile]
	);

	const handleEditorPortChange = useCallback(
		(port: EditorPort | null) => {
			dispatch(setEditorPort(port));
		},
		[dispatch]
	);

	const handleCodeKeyChange = useCallback(
		(key: CodeKeyType) => {
			dispatch(setCodeKeyType(key));
		},
		[dispatch]
	);

	if (!editorStore.doc || !editorStore.client)
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);

	return (
		<>
			<EditorSuite
				doc={editorStore.doc}
				client={editorStore.client}
				mode={editorStore.mode}
				width={windowWidth}
				themeMode={themeMode}
				codeKey={configStore.codeKey}
				onCodeKeyChange={handleCodeKeyChange}
				fileUploadEnabled={featureSettingStore.fileUpload?.enable ?? false}
				handleUploadImage={
					featureSettingStore.fileUpload?.enable ? handleUploadImage : null
				}
				intelligenceEnabled={Boolean(featureSettingStore.yorkieIntelligence)}
				intelligenceSlot={<YorkieIntelligence />}
				disableScrollSync={configStore.disableScrollSync}
				onEditorPortChange={handleEditorPortChange}
			/>
			<ModeSwitcher />
		</>
	);
}

export default DocumentView;
