import { useState } from "react";
import { Backdrop, Box, CircularProgress, Paper, IconButton, Button } from "@mui/material";
import { useWindowWidth } from "@react-hook/window-size";
import { useDispatch, useSelector } from "react-redux";
import Resizable from "react-resizable-layout";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { selectConfig } from "../../store/configSlice";
import Editor from "./Editor";
import Preview from "./Preview";
import {
	Visibility as VisibilityIcon,
	VerticalSplit as VerticalSplitIcon,
	Subject as SubjectIcon,
	ChevronRight as ChevronRightIcon,
	ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { ShareRole } from "../../utils/share";

function DocumentView() {
	const dispatch = useDispatch();
	const editorStore = useSelector(selectEditor);
	const windowWidth = useWindowWidth();
	const configStore = useSelector(selectConfig);
	const [open, setOpen] = useState(false);

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};

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

			<Box
				sx={{
					position: "fixed",
					top: "50%",
					right: open ? 16 : 0,
					transform: "translateY(-50%)",
					display: "flex",
					alignItems: "center",
				}}
			>
				<IconButton
					onClick={() => setOpen(!open)}
					sx={{
						width: 40,
						height: 40,
						borderRadius: "8px 0 0 8px",
						backgroundColor: "#fff",
						color: "#000",
						boxShadow: 3,
						"&:hover": { backgroundColor: "#f5f5f5" },
					}}
				>
					{open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
				</IconButton>

				{open && editorStore.shareRole !== ShareRole.READ && (
					<Paper
						elevation={4}
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
							padding: 1.5,
							backgroundColor: "#fff",
						}}
					>
						<Button
							onClick={() => handleChangeMode(EditorModeType.READ)}
							sx={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}
						>
							<VisibilityIcon sx={{ color: "#000", width: "28px", height: "28px" }} />
							<span style={{ color: "#000" }}>view</span>
						</Button>
						<Button
							onClick={() => handleChangeMode(EditorModeType.BOTH)}
							sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
						>
							<VerticalSplitIcon
								sx={{ color: "#000 ", width: "28px", height: "28px" }}
							/>
							<span style={{ color: "#000" }}>edit / view</span>
						</Button>
						<Button
							onClick={() => handleChangeMode(EditorModeType.EDIT)}
							sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
						>
							<SubjectIcon sx={{ color: "#000 ", width: "28px", height: "28px" }} />
							<span style={{ color: "#000" }}>edit</span>
						</Button>
					</Paper>
				)}
			</Box>
		</>
	);
}

export default DocumentView;
