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
import { useState } from "react";
import { Presence } from "../../hooks/useUserPresence";

interface UserPresenceListProps {
	presenceList: Presence[];
}

function UserPresenceList(props: UserPresenceListProps) {
	const { presenceList } = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const popoverOpen = Boolean(anchorEl);

	const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClosePopover = () => {
		setAnchorEl(null);
	};

	const MAX_VISIBLE_AVATARS = 4;
	const hiddenAvatars = presenceList.slice(MAX_VISIBLE_AVATARS);

	const renderAvatar = (presence: Presence) => (
		<Tooltip key={presence.clientID} title={presence.presence.name}>
			<Avatar
				onClick={() => console.log("presence: ", presence)}
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
						<ListItem key={presence.clientID} sx={{ paddingY: 1 }}>
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
