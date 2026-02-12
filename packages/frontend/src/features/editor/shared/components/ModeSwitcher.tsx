import {
	ArrowLeft as ArrowLeftIcon,
	ArrowRight as ArrowRightIcon,
	Subject as SubjectIcon,
	VerticalSplit as VerticalSplitIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditorModeType } from "@codepair/ui";
import { selectEditor, setMode } from "../../store/editorSlice";
import { ShareRole } from "../../../document";
import { useCurrentTheme } from "../../../../hooks/useCurrentTheme";

const ModeSwitcher = () => {
	const dispatch = useDispatch();
	const editorStore = useSelector(selectEditor);
	const [open, setOpen] = useState(false);
	const themeMode = useCurrentTheme();

	if (editorStore.shareRole === ShareRole.READ) return null;

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};

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
			<Box>
				<IconButton
					onClick={() => setOpen(!open)}
					aria-label={open ? "Close mode switcher" : "Open mode switcher"}
					aria-expanded={open}
					sx={{
						width: 32.3,
						height: 87.35,
						borderRadius: "8px 0 0 8px",
						boxShadow: "-3px 0px 5px -2px rgba(0, 0, 0, 0.2)",
						backgroundColor: `${themeMode === "dark" ? "#292A30" : "#fff"}`,
					}}
				>
					{open ? <ArrowRightIcon /> : <ArrowLeftIcon />}
				</IconButton>
			</Box>

			{open && (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						padding: 1.5,
						backgroundColor: themeMode === "dark" ? "#292A30" : "#fff",
						boxShadow: "-3px 0px 5px -2px rgba(0, 0, 0, 0.2)",
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
				</Box>
			)}
		</Stack>
	);
};

export default ModeSwitcher;
