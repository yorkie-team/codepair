import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
	AppBar,
	Grid2 as Grid,
	IconButton,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUpdateDocumentTitleMutation } from "../../hooks/api/workspaceDocument";
import { useUserPresence } from "../../hooks/useUserPresence";
import { selectDocument } from "../../store/documentSlice";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { ShareRole } from "../../utils/share";
import DownloadMenu from "../common/DownloadMenu";
import ShareButton from "../common/ShareButton";
import DocumentPopover from "../popovers/DocumentPopover";
import UserPresenceList from "./UserPresenceList";

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
	const [moreButtonAnchorEl, setMoreButtonAnchorEl] = useState<HTMLButtonElement | null>(null);

	useEffect(() => {
		if (editorState.shareRole === ShareRole.READ) {
			dispatch(setMode(EditorModeType.READ));
		}
	}, [dispatch, editorState.shareRole]);

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

	const handleMoreButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		setMoreButtonAnchorEl(e.currentTarget);
	};

	const handleDocumentMenuClose = () => {
		setMoreButtonAnchorEl(null);
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Grid container spacing={2} width="100%">
					<Grid size={4}>
						<Stack direction="row" spacing={1} alignItems="center" gap={1}>
							{!editorState.shareRole && (
								<Tooltip title="Back to Previous Page">
									<IconButton color="inherit" onClick={handleToPrevious}>
										<ArrowBackIosNewIcon />
									</IconButton>
								</Tooltip>
							)}
							<span
								style={{
									fontFamily: "Roboto",
									fontWeight: "500",
									fontSize: "20px",
									letterSpacing: "0.15px",
									lineHeight: "160%",
								}}
							>
								{workspaceState.data?.title}
							</span>
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
							<IconButton color="inherit" onClick={handleMoreButtonClick}>
								<MoreVertIcon />
							</IconButton>
							<DocumentPopover
								open={Boolean(moreButtonAnchorEl)}
								anchorEl={moreButtonAnchorEl}
								onClose={handleDocumentMenuClose}
							/>
						</Stack>
					</Grid>
				</Grid>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
