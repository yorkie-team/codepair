import {
	AppBar,
	Avatar,
	AvatarGroup,
	IconButton,
	Paper,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
	Popover,
	Typography,
	Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDispatch, useSelector } from "react-redux";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import ThemeButton from "../common/ThemeButton";
import ShareButton from "../common/ShareButton";
import { useEffect, useState } from "react";
import { useList } from "react-use";
import { ActorID } from "yorkie-js-sdk";
import { YorkieCodeMirrorPresenceType } from "../../utils/yorkie/yorkieSync";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import { selectWorkspace } from "../../store/workspaceSlice";

function DocumentHeader() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const editorState = useSelector(selectEditor);
	const workspaceState = useSelector(selectWorkspace);
	const [
		presenceList,
		{
			set: setPresenceList,
			push: pushToPresenceList,
			removeAt: removePresenceAt,
			clear: clearPresenceList,
			filter: filterPresenceList,
		},
	] = useList<{
		clientID: ActorID;
		presence: YorkieCodeMirrorPresenceType;
	}>([]);

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (editorState.shareRole === "READ") {
			dispatch(setMode("read"));
		}
	}, [dispatch, editorState.shareRole]);

	useEffect(() => {
		if (!editorState.doc) return;

		setPresenceList(editorState.doc.getPresences());

		const unsubscribe = editorState.doc.subscribe("others", (event) => {
			if (event.type === "watched") {
				setPresenceList(editorState.doc?.getPresences?.() ?? []);
			}

			if (event.type === "unwatched") {
				filterPresenceList((presence) => presence.clientID !== event.value.clientID);
			}
		});

		return () => {
			unsubscribe();
			clearPresenceList();
		};
	}, [
		editorState.doc,
		clearPresenceList,
		pushToPresenceList,
		removePresenceAt,
		setPresenceList,
		filterPresenceList,
	]);

	const handleChangeMode = (newMode: EditorModeType) => {
		if (!newMode) return;
		dispatch(setMode(newMode));
	};

	const handleToPrevious = () => {
		navigate(`/${workspaceState.data?.slug}`);
	};

	// Display additional users in a popover when there are more than 4 users
	const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	// Display None additional users in a popover when there are more than 4 users
	const handleClosePopover = () => {
		setAnchorEl(null);
	};

	const popoverOpen = Boolean(anchorEl);

	const hiddenAvatars = presenceList.slice(3);

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Stack width="100%" direction="row" justifyContent="space-between">
					<Stack direction="row" spacing={1} alignItems="center">
						{!editorState.shareRole && (
							<Tooltip title="Back to Previous Page">
								<IconButton color="inherit" onClick={handleToPrevious}>
									<ArrowBackIosNewIcon />
								</IconButton>
							</Tooltip>
						)}
						<Paper>
							{editorState.shareRole !== "READ" && (
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
					</Stack>
					<Stack direction="row" alignItems="center" gap={1}>
						<AvatarGroup max={4} onClick={handleOpenPopover}>
							{presenceList?.map((presence) => (
								<Tooltip key={presence.clientID} title={presence.presence.name}>
									<Avatar
										alt={presence.presence.name}
										sx={{ bgcolor: presence.presence.color }}
									>
										{presence.presence.name[0]}
									</Avatar>
								</Tooltip>
							))}
						</AvatarGroup>
						<Popover
							open={popoverOpen}
							anchorEl={anchorEl}
							onClose={handleClosePopover}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left",
							}}
						>
							<Paper sx={{ padding: 2 }}>
								<Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
									Additional Users
								</Typography>
								<Grid container spacing={2}>
									{hiddenAvatars.map((presence) => (
										<Grid item xs={4} key={presence.clientID}>
											<Stack direction="row" alignItems="center" spacing={1}>
												<Avatar
													sx={{
														bgcolor: presence.presence.color,
														width: 24,
														height: 24,
														fontSize: 12,
													}}
												>
													{presence.presence.name[0]}
												</Avatar>
												<Typography variant="body2" sx={{ fontSize: 12 }}>
													{presence.presence.name}
												</Typography>
											</Stack>
										</Grid>
									))}
								</Grid>
							</Paper>
						</Popover>
						{!editorState.shareRole && <ShareButton />}
						<ThemeButton />
					</Stack>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
