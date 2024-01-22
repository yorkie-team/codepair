import {
	Avatar,
	Box,
	Button,
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
import ProfilePopover from "../popovers/ProfilePopover";
import { useParams } from "react-router-dom";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WorkspaceListPopover from "../popovers/WorkspaceListPopover";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";

const DRAWER_WIDTH = 240;

function WorkspaceDrawer() {
	const params = useParams();
	const userStore = useSelector(selectUser);
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const [profileAnchorEl, setProfileAnchorEl] = useState<(EventTarget & Element) | null>(null);
	const [workspaceListAnchorEl, setWorkspaceListAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);

	const handleOpenProfilePopover: MouseEventHandler = (event) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleCloseProfilePopover = () => {
		setProfileAnchorEl(null);
	};

	const handleOpenWorkspacePopover: MouseEventHandler = (event) => {
		setWorkspaceListAnchorEl(event.currentTarget);
	};

	const handleCloseWorkspacePopover = () => {
		setWorkspaceListAnchorEl(null);
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
			variant="permanent"
			anchor="left"
			open
		>
			<ListItem disablePadding>
				<ListItemButton onClick={handleOpenWorkspacePopover}>
					<ListItemText
						primary={workspace?.title}
						primaryTypographyProps={{
							variant: "subtitle1",
							noWrap: true,
						}}
					/>
					<ListItemSecondaryAction>
						<IconButton>
							{workspaceListAnchorEl ? (
								<KeyboardArrowUpIcon />
							) : (
								<KeyboardArrowDownIcon />
							)}
						</IconButton>
					</ListItemSecondaryAction>
				</ListItemButton>
				<WorkspaceListPopover
					open={Boolean(workspaceListAnchorEl)}
					anchorEl={workspaceListAnchorEl}
					onClose={handleCloseWorkspacePopover}
					width={DRAWER_WIDTH - 32}
				/>
			</ListItem>
			<Divider />
			<ListItem>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						width: 1,
					}}
				>
					New Note
				</Button>
			</ListItem>
			<Divider />
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
			<CreateModal open title="Note" />
		</Drawer>
	);
}

export default WorkspaceDrawer;
