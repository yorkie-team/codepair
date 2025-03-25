import {
	ArrowLeft as ArrowLeftIcon,
	ArrowRight as ArrowRightIcon,
	Subject as SubjectIcon,
	VerticalSplit as VerticalSplitIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { ShareRole } from "../../utils/share";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";

const ModeSwitcher = () => {
	const dispatch = useDispatch();
	const editorStore = useSelector(selectEditor);
	const [open, setOpen] = useState(false);
	const themeMode = useCurrentTheme();

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};
	if (editorStore.shareRole === ShareRole.READ) return null;
	return (
		<Stack
			direction="row"
			alignItems="center"
			sx={{
				position: "fixed",
				top: "50%",
				right: open ? 1 : 0,
				transform: "translateY(-50%)",
			}}
		>
			<Paper elevation={4}>
				<IconButton
					onClick={() => setOpen(!open)}
					aria-label={open ? "Close mode switcher" : "Open mode switcher"}
					aria-expanded={open}
					sx={{
						width: 32.3,
						height: 87.35,
						borderRadius: "8px 0 0 8px",
						boxShadow: open ? "-3px 0px 5px -2px rgba(0, 0, 0, 0.2)" : 3,
					}}
				>
					{open ? <ArrowRightIcon /> : <ArrowLeftIcon />}
				</IconButton>
			</Paper>

			{open && (
				<Paper
					elevation={4}
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						padding: 1.5,
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
					].map(({ mode, icon: Icon, label }) => {
						const isSelected = editorStore.mode === mode;
						const highlightColor = isSelected
							? "#1976d2"
							: themeMode === "dark"
								? "#fff"
								: "#000";
						return (
							<Button
								key={mode}
								onClick={() => handleChangeMode(mode)}
								aria-pressed={editorStore.mode === mode}
								aria-label={`Switch to ${label} mode`}
							>
								<Stack direction="column" alignItems="center" spacing={0.5}>
									<Icon
										sx={{
											color: highlightColor,
											width: "28px",
											height: "28px",
										}}
									/>
									<Typography
										style={{
											color: highlightColor,
											fontSize: "10px",
											fontWeight: "600",
										}}
									>
										{label}
									</Typography>
								</Stack>
							</Button>
						);
					})}
				</Paper>
			)}
		</Stack>
	);
};

export default ModeSwitcher;
