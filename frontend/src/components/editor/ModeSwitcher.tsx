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
				right: open ? 1 : 0,
				transform: "translateY(-50%)",
				display: "flex",
				alignItems: "center",
			}}
		>
			<IconButton
				onClick={() => setOpen(!open)}
				aria-label={open ? "Close mode switcher" : "Open mode switcher"}
				aria-expanded={open}
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
					{[
						{ mode: EditorModeType.READ, icon: VisibilityIcon, label: "view" },
						{
							mode: EditorModeType.BOTH,
							icon: VerticalSplitIcon,
							label: "edit / view",
						},
						{ mode: EditorModeType.EDIT, icon: SubjectIcon, label: "edit" },
					].map(({ mode, icon: Icon, label }) => (
						<Button
							key={mode}
							onClick={() => handleChangeMode(mode)}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<Icon
								sx={{
									color: editorStore.mode === mode ? "#1976d2" : "#000",
									width: "28px",
									height: "28px",
								}}
							/>
							<span
								style={{
									color: editorStore.mode === mode ? "#1976d2" : "#000",
									fontSize: "10px",
									fontWeight: "600",
								}}
							>
								{label}
							</span>
						</Button>
					))}
				</Paper>
			)}
		</Box>
	);
};

export default ModeSwitcher;
