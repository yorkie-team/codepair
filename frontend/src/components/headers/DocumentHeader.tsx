import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
	AppBar,
	Box,
	IconButton,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUpdateDocumentTitleMutation } from "../../hooks/api/workspaceDocument";
import { useUserPresence } from "../../hooks/useUserPresence";
import { selectDocument } from "../../store/documentSlice";
import { DRAWER_WIDTH } from "../../constants/layout";
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
	const isWideEnough = useMediaQuery(`(min-width:${DRAWER_WIDTH + 512}px)`);

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
				<Stack
					width="100%"
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box>
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							gap={1}
							sx={{
								width: isWideEnough ? DRAWER_WIDTH : undefined,
								textAlign: "left",
							}}
						>
							{!editorState.shareRole && (
								<Tooltip title="Back to Previous Page">
									<IconButton color="inherit" onClick={handleToPrevious}>
										<ArrowBackIosNewIcon />
									</IconButton>
								</Tooltip>
							)}
							{isWideEnough && (
								<>
									<Typography variant="h6" component="span" noWrap>
										{workspaceState.data?.title}
									</Typography>
									<DownloadMenu />
								</>
							)}
						</Stack>
					</Box>
					<Box sx={{ flexGrow: 1, overflow: "hidden", px: 2 }}>
						<Stack alignItems="center" justifyContent="center" height="100%">
							<Typography
								contentEditable={!isEditingDisabled}
								sx={{
									maxWidth: "100%",
									overflowX: "auto",
									textOverflow: "ellipsis",
									":focus": {
										outline: "none",
										border: "none",
									},
								}}
								noWrap
								suppressContentEditableWarning
								onBlur={handleUpdateDocumentTitle}
							>
								{documentStore.data?.title}
							</Typography>
						</Stack>
					</Box>

					<Box>
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
					</Box>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
