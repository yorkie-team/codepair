import { Backdrop, Box, CircularProgress, Paper } from "@mui/material";
import { useWindowWidth } from "@react-hook/window-size";
import { useSelector } from "react-redux";
import Resizable from "react-resizable-layout";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import { EditorModeType, selectEditor } from "../../store/editorSlice";
import Editor from "./Editor";
import EditorBottomBar, { BOTTOM_BAR_HEIGHT } from "./EditorBottomBar";
import Preview from "./Preview";

function DocumentView() {
	const editorStore = useSelector(selectEditor);
	const windowWidth = useWindowWidth();

	if (!editorStore.doc || !editorStore.client)
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);

	return (
		<>
			{editorStore.mode === EditorModeType.both && (
				<Resizable axis={"x"} initial={windowWidth / 2} min={400}>
					{({ position: width, separatorProps }) => (
						<ScrollSync>
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
									<div style={{ height: `calc(100% - ${BOTTOM_BAR_HEIGHT}px)` }}>
										<Editor />
									</div>
									<EditorBottomBar width={width} />
								</div>
								<Paper
									id="splitter"
									{...separatorProps}
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

			{editorStore.mode === EditorModeType.edit && (
				<div style={{ position: "relative", height: "100%" }}>
					<div style={{ height: `calc(100% - ${BOTTOM_BAR_HEIGHT}px)` }}>
						<Editor />
					</div>
					<EditorBottomBar width="100%" />
				</div>
			)}

			{editorStore.mode === EditorModeType.read && (
				<Box sx={{ p: 4, overflow: "auto" }} height="100%">
					<Preview />
				</Box>
			)}
		</>
	);
}

export default DocumentView;
