import { useSelector } from "react-redux";
import { selectEditor } from "../../store/editorSlice";
import Resizable from "react-resizable-layout";
import { useWindowWidth } from "@react-hook/window-size";
import Editor from "./Editor";
import { Backdrop, Box, CircularProgress, Paper } from "@mui/material";
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
			{/* For Markdown Preview Theme */}
			<div className="wmde-markdown-var" />
			{editorStore.mode === "both" && (
				<Resizable axis={"x"} initial={windowWidth / 2} min={400}>
					{({ position: width, separatorProps }) => (
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
							<Paper
								id="splitter"
								{...separatorProps}
								sx={{
									height: "100%",
									width: 8,
									borderRadius: 0,
									cursor: "col-resize",
									zIndex: 100,
								}}
							/>
							<div
								className="right-block"
								style={{ width: `calc(100% - ${width}px)`, overflow: "auto" }}
							>
								<Box sx={{ p: 4 }} height="100%">
									<Preview />
								</Box>
							</div>
						</div>
					)}
				</Resizable>
			)}
			{editorStore.mode === "read" && (
				<Box sx={{ p: 4, overflow: "auto" }} height="100%">
					<Preview />
				</Box>
			)}
			{editorStore.mode === "edit" && <Editor />}
		</>
	);
}

export default DocumentView;
