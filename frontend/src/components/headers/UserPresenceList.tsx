import {
	Avatar,
	AvatarGroup,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
	Popover,
	Tooltip,
	Typography,
} from "@mui/material";
import { EditorView } from "codemirror";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Presence } from "../../hooks/useUserPresence";
import { selectEditor } from "../../store/editorSlice";

interface UserPresenceListProps {
	presenceList: Presence[];
}

function UserPresenceList(props: UserPresenceListProps) {
	const { presenceList } = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const popoverOpen = Boolean(anchorEl);
	const editorStore = useSelector(selectEditor);

	const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClosePopover = () => {
		setAnchorEl(null);
	};

	const handleScrollToUserLocation = (presence: Presence) => {
		const cursor = presence.presence.cursor;
		if (cursor === null) return;

		editorStore.cmView?.dispatch({
			effects: EditorView.scrollIntoView(cursor[0], {
				y: "center",
			}),
		});
	};

	const MAX_VISIBLE_AVATARS = 4;
	const hiddenAvatars = presenceList.slice(MAX_VISIBLE_AVATARS);

	const renderAvatar = (presence: Presence) => (
		<Tooltip key={presence.clientID} title={presence.presence.name}>
			<Avatar
				onClick={() => handleScrollToUserLocation(presence)}
				alt={presence.presence.name}
				sx={{ bgcolor: presence.presence.color }}
			>
				{presence.presence.name[0]}
			</Avatar>
		</Tooltip>
	);

	return (
		<>
			<AvatarGroup>
				{presenceList.slice(0, MAX_VISIBLE_AVATARS).map(renderAvatar)}
				{presenceList.length > MAX_VISIBLE_AVATARS && (
					<Avatar onClick={handleOpenPopover}>
						+{presenceList.length - MAX_VISIBLE_AVATARS}
					</Avatar>
				)}
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
					<Typography variant="subtitle2">Additional Users</Typography>
					{hiddenAvatars.map((presence) => (
						<ListItem
							key={presence.clientID}
							sx={{ paddingY: 1 }}
							onClick={() => handleScrollToUserLocation(presence)}
						>
							<ListItemAvatar>
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
							</ListItemAvatar>
							<ListItemText
								primary={presence.presence.name}
								primaryTypographyProps={{
									variant: "body2",
								}}
							/>
						</ListItem>
					))}
				</Paper>
			</Popover>
		</>
	);
}

export default UserPresenceList;
