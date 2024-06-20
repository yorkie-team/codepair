import {
	Divider,
	Drawer,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
} from "@mui/material";
import { useSelector } from "react-redux";
import { MouseEventHandler, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WorkspaceListPopover from "../popovers/WorkspaceListPopover";
import PeopleIcon from "@mui/icons-material/People";
import MemberModal from "../modals/MemberModal";
import { selectWorkspace } from "../../store/workspaceSlice";
import { DRAWER_WIDTH, WorkspaceDrawerHeader } from "../layouts/WorkspaceLayout";

interface WorkspaceDrawerProps {
	open: boolean;
}

function WorkspaceDrawer(props: WorkspaceDrawerProps) {
	const { open } = props;
	const workspaceStore = useSelector(selectWorkspace);
	const [workspaceListAnchorEl, setWorkspaceListAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);
	const [memberModalOpen, setMemberModalOpen] = useState(false);

	const handleOpenWorkspacePopover: MouseEventHandler = (event) => {
		setWorkspaceListAnchorEl(event.currentTarget);
	};

	const handleCloseWorkspacePopover = () => {
		setWorkspaceListAnchorEl(null);
	};

	const handleMemberModalOpen = () => {
		setMemberModalOpen((prev) => !prev);
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
			open={open}
		>
			<WorkspaceDrawerHeader>
				<ListItem disablePadding>
					<ListItemButton onClick={handleOpenWorkspacePopover}>
						<ListItemText
							primary={workspaceStore.data?.title}
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
			</WorkspaceDrawerHeader>
			<Divider />
			<ListItem disablePadding>
				<ListItemButton onClick={handleMemberModalOpen}>
					<ListItemIcon>
						<PeopleIcon />
					</ListItemIcon>
					<ListItemText primary="Members" />
				</ListItemButton>
			</ListItem>
			<MemberModal open={memberModalOpen} onClose={handleMemberModalOpen} />
		</Drawer>
	);
}

export default WorkspaceDrawer;
