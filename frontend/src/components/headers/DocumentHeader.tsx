import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EditIcon from "@mui/icons-material/Edit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
	AppBar,
	IconButton,
	Paper,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
	Grid2 as Grid,
	Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserPresence } from "../../hooks/useUserPresence";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { ShareRole } from "../../utils/share";
import DownloadMenu from "../common/DownloadMenu";
import ShareButton from "../common/ShareButton";
import ThemeButton from "../common/ThemeButton";
import UserPresenceList from "./UserPresenceList";
import { selectDocument } from "../../store/documentSlice";
import { useUpdateDocumentTitleMutation } from "../../hooks/api/workspaceDocument";
import { useSnackbar } from "notistack";

function DocumentHeader() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const editorState = useSelector(selectEditor);
	const workspaceState = useSelector(selectWorkspace);
	const documentStore = useSelector(selectDocument);
	const { presenceList } = useUserPresence(editorState.doc);
	const { mutateAsync: updateDocumentTitle } = useUpdateDocumentTitleMutation(
		workspaceState.data?.id || "",
		documentStore.data?.id || ""
	);
	const isEditingDisabled = Boolean(editorState.shareRole);
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		if (editorState.shareRole === ShareRole.READ) {
			dispatch(setMode(EditorModeType.READ));
		}
	}, [dispatch, editorState.shareRole]);

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};

	const handleToPrevious = () => {
		navigate(`/${workspaceState.data?.slug}`);
	};

	const handleUpdateDocumentTitle = async (e: React.FocusEvent<HTMLSpanElement, Element>) => {
		const title = e.target.textContent as string;

		if (title === documentStore.data?.title) return;

		let errorString = "";

		if (!title.trim()) {
			errorString = "Title cannot be empty";
		}

		if (title.length > 255) {
			errorString = "Title must be less than 255 characters";
		}

		if (errorString) {
			enqueueSnackbar(errorString, { variant: "error" });
			e.target.textContent = documentStore.data?.title as string;
			return;
		}

		await updateDocumentTitle({ title });
		enqueueSnackbar("The title is changed successfully", { variant: "success" });
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Grid container spacing={2} width="100%">
					<Grid size={4}>
						<Stack direction="row" spacing={1} alignItems="center">
							{!editorState.shareRole && (
								<Tooltip title="Back to Previous Page">
									<IconButton color="inherit" onClick={handleToPrevious}>
										<ArrowBackIosNewIcon />
									</IconButton>
								</Tooltip>
							)}
							<Paper>
								{editorState.shareRole !== ShareRole.READ && (
									<ToggleButtonGroup
										value={editorState.mode}
										exclusive
										onChange={(_, newMode) => handleChangeMode(newMode)}
										size="small"
									>
										<ToggleButton value="edit" aria-label="edit">
											<Tooltip title="Edit Mode">
												<EditIcon />
											</Tooltip>
										</ToggleButton>
										<ToggleButton value="both" aria-label="both">
											<Tooltip title="Both Mode">
												<VerticalSplitIcon />
											</Tooltip>
										</ToggleButton>
										<ToggleButton value="read" aria-label="read">
											<Tooltip title="Read Mode">
												<VisibilityIcon />
											</Tooltip>
										</ToggleButton>
									</ToggleButtonGroup>
								)}
							</Paper>
							<DownloadMenu />
						</Stack>
					</Grid>
					<Grid size={4}>
						<Stack alignItems="center" justifyContent="center" height="100%">
							<Typography
								contentEditable={!isEditingDisabled}
								suppressContentEditableWarning={true}
								sx={{
									":focus": {
										outline: "none",
										border: "none",
									},
								}}
								onBlur={(e) => handleUpdateDocumentTitle(e)}
								maxWidth={300}
								noWrap
							>
								{documentStore.data?.title}
							</Typography>
						</Stack>
					</Grid>
					<Grid size={4}>
						<Stack direction="row" justifyContent="end" gap={1}>
							<UserPresenceList presenceList={presenceList} />
							{!editorState.shareRole && <ShareButton />}
							<ThemeButton />
						</Stack>
					</Grid>
				</Grid>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
