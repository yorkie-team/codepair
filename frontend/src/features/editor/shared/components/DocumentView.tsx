import { Backdrop, Box, CircularProgress, Paper } from "@mui/material";
import { useWindowWidth } from "@react-hook/window-size";
import { useSelector } from "react-redux";
import Resizable from "react-resizable-layout";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import { selectConfig, EditorVersion } from "../../../../features/settings";
import { EditorModeType, selectEditor } from "../../store/editorSlice";
import ModeSwitcher from "./ModeSwitcher";

// CodeMirror editor components
import CodeMirrorEditor from "../../codemirror/components/Editor";
import CodeMirrorPreview from "../../codemirror/components/Preview";

/**
 * Editor component mapping by version.
 *
 * This architecture supports multiple editor implementations.
 * To add a new editor:
 * 1. Create Editor and Preview components in a new directory (e.g., features/editor/monaco/)
 * 2. Import them here
 * 3. Add entries to EDITOR_COMPONENTS and PREVIEW_COMPONENTS maps
 * 4. Add the corresponding EditorVersion enum value in configSlice.ts
 *
 * Each editor implementation should:
 * - Accept a `width` prop for the Editor component
 * - Handle Yorkie document synchronization internally
 * - Follow the same component interface pattern
 */
const EDITOR_COMPONENTS: Record<EditorVersion, React.ComponentType<{ width: number | string }>> = {
	[EditorVersion.CODEMIRROR]: CodeMirrorEditor,
	// Add more editors here:
	// [EditorVersion.MONACO]: MonacoEditor,
};

const PREVIEW_COMPONENTS: Record<EditorVersion, React.ComponentType> = {
	[EditorVersion.CODEMIRROR]: CodeMirrorPreview,
	// Add more previews here:
	// [EditorVersion.MONACO]: MonacoPreview,
};

function DocumentView() {
	const editorStore = useSelector(selectEditor);
	const windowWidth = useWindowWidth();
	const configStore = useSelector(selectConfig);

	// Select editor components based on current editor version
	const Editor = EDITOR_COMPONENTS[configStore.editorVersion];
	const Preview = PREVIEW_COMPONENTS[configStore.editorVersion];

	if (!editorStore.doc || !editorStore.client)
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);

	return (
		<>
			{editorStore.mode === EditorModeType.BOTH && (
				<Resizable axis={"x"} initial={windowWidth / 2} min={400}>
					{({ position: width, separatorProps }) => (
						<ScrollSync enabled={!configStore.disableScrollSync}>
							<div
								id="wrapper"
								style={{
									display: "flex",
									height: "100%",
									overflow: "hidden",
									position: "relative",
								}}
							>
								<div
									id="left-block"
									style={{
										width,
										position: "relative",
										height: "100%",
									}}
								>
									<Editor width={width} />
								</div>
								<Paper
									id="splitter"
									{...separatorProps}
									onMouseDown={() => {
										document.body.style.userSelect = "none";
									}}
									onMouseUp={() => {
										document.body.style.userSelect = "auto";
									}}
									sx={{
										height: "100%",
										width: 8,
										borderRadius: 0,
										cursor: "col-resize",
										zIndex: 0,
									}}
								/>
								<ScrollSyncPane>
									<div
										className="right-block"
										style={{
											width: `calc(100% - ${width}px)`,
											overflow: "auto",
										}}
									>
										<Box sx={{ p: 4 }} height="100%">
											<Preview />
										</Box>
									</div>
								</ScrollSyncPane>
							</div>
						</ScrollSync>
					)}
				</Resizable>
			)}

			{editorStore.mode === EditorModeType.EDIT && (
				<div style={{ position: "relative", height: "100%" }}>
					<Editor width={"100%"} />
				</div>
			)}

			{editorStore.mode === EditorModeType.READ && (
				<Box sx={{ p: 4, overflow: "auto" }} height="100%">
					<Preview />
				</Box>
			)}
			<ModeSwitcher />
		</>
	);
}

export default DocumentView;
