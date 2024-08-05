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
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useList } from "react-use";
import { ActorID } from "yorkie-js-sdk";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import { selectWorkspace } from "../../store/workspaceSlice";
import { YorkieCodeMirrorPresenceType } from "../../utils/yorkie/yorkieSync";
import DownloadMenu from "../common/DownloadMenu";
import ShareButton from "../common/ShareButton";
import ThemeButton from "../common/ThemeButton";
import UserPresence from "./UserPresence";

export type Presence = {
	clientID: ActorID;
	presence: YorkieCodeMirrorPresenceType;
};

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
	] = useList<Presence>([]);

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
						<DownloadMenu />
					</Stack>
					<Stack direction="row" alignItems="center" gap={1}>
						<UserPresence presenceList={presenceList} />
						{!editorState.shareRole && <ShareButton />}
						<ThemeButton />
					</Stack>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
