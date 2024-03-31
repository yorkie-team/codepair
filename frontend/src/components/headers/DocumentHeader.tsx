import { useDispatch, useSelector } from "react-redux";
import { EditorModeType, selectEditor, setMode } from "../../store/editorSlice";
import ShareButton from "../common/ShareButton";
import { useEffect } from "react";
import { useList } from "react-use";
import { ActorID } from "yorkie-js-sdk";
import { YorkieCodeMirrorPresenceType } from "../../utils/yorkie/yorkieSync";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, Button, Stack, Tabs, Tooltip } from "yorkie-ui";

function DocumentHeader() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
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
		navigate(-1);
	};

	return (
		<Box
			position="static"
			zIndex="100"
			style={{
				paddingTop: 8,
				paddingBottom: 8,
			}}
			borderWidth="1px"
		>
			<Stack width="100%" direction="row" justifyContent="space-between">
				<Stack direction="row" gap="1" alignItems="center">
					<Tooltip.Root closeDelay={3}>
						<Tooltip.Trigger>
							<Button variant="ghost" onClick={handleToPrevious} size="sm">
								<ArrowBackIosNewIcon />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Positioner>
							<Tooltip.Content>Back to Previous Page</Tooltip.Content>
						</Tooltip.Positioner>
					</Tooltip.Root>
					{editorState.shareRole !== "READ" && (
						<Tabs.Root
							value={editorState.mode}
							onValueChange={(e) => handleChangeMode(e.value as EditorModeType)}
						>
							<Tabs.List>
								<Tabs.Trigger value="edit">Edit</Tabs.Trigger>
								<Tabs.Trigger value="both">Both</Tabs.Trigger>
								<Tabs.Trigger value="read">Read</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
					)}
				</Stack>
				<Stack direction="row" alignItems="center" gap={1}>
					{presenceList?.map((presence) => (
						<Tooltip.Root closeDelay={3}>
							<Tooltip.Trigger>
								<Avatar name={presence.presence.name} />
							</Tooltip.Trigger>
							<Tooltip.Positioner>
								<Tooltip.Content>{presence.presence.name}</Tooltip.Content>
							</Tooltip.Positioner>
						</Tooltip.Root>
					))}
					{!editorState.shareRole && <ShareButton />}
				</Stack>
			</Stack>
		</Box>
	);
}

export default DocumentHeader;
