import {
	Avatar,
	Box,
	Divider,
	Drawer,
	IconButton,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemSecondaryAction,
	ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import { MouseEventHandler, useState } from "react";
import ProfilePopover from "../common/ProfilePopover";
import { useParams } from "react-router-dom";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const DRAWER_WIDTH = 240;

function WorkspaceDrawer() {
	const params = useParams();
	const userStore = useSelector(selectUser);
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceId);
	const [profileAnchorEl, setProfileAnchorEl] = useState<(EventTarget & Element) | null>(null);

	const handleOpenProfilePopover: MouseEventHandler = (event) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleCloseProfilePopover = () => {
		setProfileAnchorEl(null);
	};

	return (
		<Drawer
			sx={{
				width: DRAWER_WIDTH,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: DRAWER_WIDTH,
					boxSizing: "border-box",
				},
			}}
			variant="persistent"
			anchor="left"
			open
		>
			<ListItem disablePadding>
				<ListItemButton>
					<ListItemText
						primary={workspace?.title}
						primaryTypographyProps={{
							variant: "subtitle1",
							noWrap: true,
						}}
					/>
					<ListItemSecondaryAction>
						<IconButton>
							<KeyboardArrowDownIcon />
						</IconButton>
					</ListItemSecondaryAction>
				</ListItemButton>
			</ListItem>
			<Box sx={{ mt: "auto" }}>
				<Divider />
				<ListItem disablePadding>
					<ListItemButton onClick={handleOpenProfilePopover}>
						<ListItemAvatar>
							<Avatar>{userStore.data?.nickname.charAt(0)}</Avatar>
						</ListItemAvatar>
						<ListItemText primary={userStore.data?.nickname} />
						<ListItemSecondaryAction>
							<MoreVertIcon />
						</ListItemSecondaryAction>
					</ListItemButton>
					<ProfilePopover
						open={Boolean(profileAnchorEl)}
						anchorEl={profileAnchorEl}
						onClose={handleCloseProfilePopover}
					/>
				</ListItem>
			</Box>
		</Drawer>
	);
}

export default WorkspaceDrawer;
