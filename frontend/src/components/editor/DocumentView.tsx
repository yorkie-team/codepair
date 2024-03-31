import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";
import Resizable from "react-resizable-layout";
import { useWindowWidth } from "@react-hook/window-size";
import Editor from "./Editor";
import { CircularProgress } from "@mui/material";
import Preview from "./Preview";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import { Box, Dialog } from "yorkie-ui";

function DocumentView() {
	const editorStore = useSelector(selectEditor);
	const windowWidth = useWindowWidth();

	if (!editorStore.doc || !editorStore.client)
		return (
			<Dialog.Root open>
				<Dialog.Backdrop>
					<Dialog.Positioner>
						<CircularProgress color="inherit" />
					</Dialog.Positioner>
				</Dialog.Backdrop>
			</Dialog.Root>
		);

	return (
		<>
			{/* For Markdown Preview Theme */}
			<div className="wmde-markdown-var" />
			{editorStore.mode === "both" && (
				<Resizable axis={"x"} initial={windowWidth / 2} min={400}>
					{({ position: width, separatorProps }) => (
						<ScrollSync>
							<div
								id="wrapper"
								style={{
									display: "flex",
									height: "100%",
									overflow: "hidden",
								}}
							>
								<div id="left-block" style={{ width }}>
									<Editor />
								</div>
								<Box
									id="splitter"
									{...separatorProps}
									style={{
										height: "100%",
										width: 8,
										borderRadius: 0,
										cursor: "col-resize",
										zIndex: 0,
										// Shadow
										boxShadow: "0 0 8px 0 rgba(0, 0, 0, 0.1)",
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
										<Box style={{ padding: 16 }} height="100%">
											<Preview />
										</Box>
									</div>
								</ScrollSyncPane>
							</div>
						</ScrollSync>
					)}
				</Resizable>
			)}
			{editorStore.mode === "read" && (
				<Box style={{ padding: 16, overflow: "auto" }} height="100%">
					<Preview />
				</Box>
			)}
			{editorStore.mode === "edit" && <Editor />}
		</>
	);
}

export default DocumentView;
