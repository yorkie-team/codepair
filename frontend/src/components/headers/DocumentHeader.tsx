import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
	AppBar,
	Box,
	Button,
	IconButton,
	Menu,
	MenuItem,
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
import { useUserPresence } from "../../features/editor/hooks/useUserPresence";
import { selectDocument } from "../../features/document";
import { DRAWER_WIDTH } from "../../constants/layout";
import { EditorModeType, selectEditor, setMode } from "../../features/editor";
import { selectWorkspace } from "../../features/workspace";
import { ShareRole } from "../../features/document";
import { selectConfig, setEditorVersion, EditorVersion } from "../../features/settings";
import DownloadMenu from "../common/DownloadMenu";
import ShareButton from "../common/ShareButton";
import DocumentPopover from "../popovers/DocumentPopover";
import UserPresenceList from "./UserPresenceList";
import { RevisionPanel } from "../../features/editor";

function DocumentHeader() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const editorState = useSelector(selectEditor);
	const workspaceState = useSelector(selectWorkspace);
	const documentStore = useSelector(selectDocument);
	const configState = useSelector(selectConfig);
	const { presenceList } = useUserPresence(editorState.doc);
	const { mutateAsync: updateDocumentTitle } = useUpdateDocumentTitleMutation(
		workspaceState.data?.id || "",
		documentStore.data?.id || ""
	);
	const isEditingDisabled = Boolean(editorState.shareRole);
	const { enqueueSnackbar } = useSnackbar();
	const [moreButtonAnchorEl, setMoreButtonAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [editorMenuAnchorEl, setEditorMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [revisionPanelOpen, setRevisionPanelOpen] = useState(false);
	const isWideEnough = useMediaQuery(`(min-width:${DRAWER_WIDTH + 512}px)`);
	{
		/* TODO(yeonthusiast): When the tagging is implemented, uncomment the following code */
	}
	// const [value, setValue] = useState<TagType[]>([]);

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

	const handleEditorMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setEditorMenuAnchorEl(event.currentTarget);
	};

	const handleEditorMenuClose = () => {
		setEditorMenuAnchorEl(null);
	};

	const handleEditorVersionChange = (version: EditorVersion) => {
		dispatch(setEditorVersion(version));
		handleEditorMenuClose();
	};

	/**
	 * Editor version display labels.
	 * When adding a new editor, add its display label here.
	 */
	const editorVersionLabels: Record<EditorVersion, string> = {
		[EditorVersion.CODEMIRROR]: "CodeMirror",
		// Add more editor labels here when implementing new editors:
		// [EditorVersion.MONACO]: "Monaco",
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 } }}>
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
									<IconButton
										color="inherit"
										onClick={handleToPrevious}
										size="small"
										sx={{ p: { xs: 0.75, sm: 1 } }}
									>
										<ArrowBackIosNewIcon
											sx={{ fontSize: { xs: 20, sm: 24 } }}
										/>
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
					<Box sx={{ flexGrow: 1, overflow: "hidden", px: { xs: 0.5, sm: 2 } }}>
						<Stack alignItems="center" justifyContent="center" height="100%">
							<Typography
								contentEditable={!isEditingDisabled}
								sx={{
									maxWidth: "100%",
									overflow: "hidden",
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
						<Stack
							direction="row"
							justifyContent="end"
							gap={{ xs: 0.5, sm: 1 }}
							alignItems="center"
						>
							{/* TODO(yeonthusiast): When the tagging is implemented, uncomment the following code */}
							{/* <DropdownTags value={value} onChange={setValue} /> */}

							{/* Editor Version Selector */}
							<Box sx={{ display: { xs: "none", md: "block" } }}>
								<Tooltip title="Select Editor">
									<Button
										color="inherit"
										onClick={handleEditorMenuOpen}
										endIcon={<KeyboardArrowDownIcon />}
										sx={{
											textTransform: "none",
											bgcolor: "background.paper",
											"&:hover": { bgcolor: "action.hover" },
										}}
									>
										{editorVersionLabels[configState.editorVersion]}
									</Button>
								</Tooltip>
								<Menu
									anchorEl={editorMenuAnchorEl}
									open={Boolean(editorMenuAnchorEl)}
									onClose={handleEditorMenuClose}
								>
									{Object.values(EditorVersion).map((version) => (
										<MenuItem
											key={version}
											selected={version === configState.editorVersion}
											onClick={() => handleEditorVersionChange(version)}
										>
											{editorVersionLabels[version]}
										</MenuItem>
									))}
								</Menu>
							</Box>

							<Box sx={{ display: { xs: "none", sm: "block" } }}>
								<UserPresenceList presenceList={presenceList} />
							</Box>
							{!editorState.shareRole && <ShareButton />}
							{!editorState.shareRole && (
								<Tooltip title="History">
									<IconButton
										color="inherit"
										onClick={() => setRevisionPanelOpen(true)}
									>
										<HistoryIcon />
									</IconButton>
								</Tooltip>
							)}
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
			<RevisionPanel open={revisionPanelOpen} onClose={() => setRevisionPanelOpen(false)} />
		</AppBar>
	);
}

export default DocumentHeader;
