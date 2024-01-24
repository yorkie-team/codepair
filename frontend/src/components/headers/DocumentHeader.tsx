import {
	AppBar,
	Avatar,
	AvatarGroup,
	Paper,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
	Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useDispatch, useSelector } from "react-redux";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import ThemeButton from "../common/ThemeButton";
import ShareButton from "../common/ShareButton";
import { useEffect } from "react";
import { useList } from "react-use";
import { ActorID } from "yorkie-js-sdk";
import { YorkieCodeMirrorPresenceType } from "../../utils/yorkie/yorkieSync";

function DocumentHeader() {
	const dispatch = useDispatch();
	const editorState = useSelector(selectEditor);
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
				pushToPresenceList(event.value);
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
		dispatch(setMode(newMode));
	};

	return (
		<AppBar position="static" sx={{ zIndex: 100 }}>
			<Toolbar>
				<Stack width="100%" direction="row" justifyContent="space-between">
					<Stack direction="row" spacing={1} alignItems="center">
						<Paper>
							{/* {editorState.shareRole !== "READ" && ( */}
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
							{/* )} */}
						</Paper>
					</Stack>
					<Stack direction="row" alignItems="center" gap={1}>
						<AvatarGroup max={4}>
							{presenceList?.map((presence) => (
								<Avatar
									key={presence.clientID}
									alt={presence.presence.name}
									sx={{ bgcolor: presence.presence.color }}
								>
									{presence.presence.name[0]}
								</Avatar>
							))}
						</AvatarGroup>
						{!editorState.shareRole && <ShareButton />}
						<ThemeButton />
					</Stack>
				</Stack>
			</Toolbar>
		</AppBar>
	);
}

export default DocumentHeader;
