import {
	ArrowLeft as ArrowLeftIcon,
	ArrowRight as ArrowRightIcon,
	Subject as SubjectIcon,
	VerticalSplit as VerticalSplitIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Button, IconButton, Paper } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { ShareRole } from "../../utils/share";

const ModeSwitcher = () => {
	const dispatch = useDispatch();
	const editorStore = useSelector(selectEditor);
	const [open, setOpen] = useState(false);

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};
	return (
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
					width: 32.3,
					height: 87.35,
					borderRadius: "8px 0 0 8px",
					backgroundColor: "#fff",
					color: "#000",
					boxShadow: open ? "-3px 0px 5px -2px rgba(0, 0, 0, 0.2)" : 3,
					"&:hover": { backgroundColor: "#f5f5f5" },
				}}
			>
				{open ? <ArrowRightIcon /> : <ArrowLeftIcon />}
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
						<VisibilityIcon
							sx={{
								color:
									editorStore.mode === EditorModeType.READ ? "#1976d2" : "#000",
								width: "28px",
								height: "28px",
							}}
						/>
						<span
							style={{
								color:
									editorStore.mode === EditorModeType.READ ? "#1976d2" : "#000",
								fontSize: "10px",
								fontWeight: "600",
							}}
						>
							view
						</span>
					</Button>
					<Button
						onClick={() => handleChangeMode(EditorModeType.BOTH)}
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<VerticalSplitIcon
							sx={{
								color:
									editorStore.mode === EditorModeType.BOTH ? "#1976d2" : "#000",
								width: "28px",
								height: "28px",
							}}
						/>
						<span
							style={{
								color:
									editorStore.mode === EditorModeType.BOTH ? "#1976d2" : "#000",
								fontSize: "10px",
								fontWeight: "600",
							}}
						>
							edit / view
						</span>
					</Button>
					<Button
						onClick={() => handleChangeMode(EditorModeType.EDIT)}
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<SubjectIcon
							sx={{
								color:
									editorStore.mode === EditorModeType.EDIT ? "#1976d2" : "#000",
								width: "28px",
								height: "28px",
							}}
						/>
						<span
							style={{
								color:
									editorStore.mode === EditorModeType.EDIT ? "#1976d2" : "#000",
								fontSize: "10px",
								fontWeight: "600",
							}}
						>
							edit
						</span>
					</Button>
				</Paper>
			)}
		</Box>
	);
};

export default ModeSwitcher;
