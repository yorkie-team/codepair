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
import { MouseEventHandler, useMemo, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WorkspaceListPopover from "../popovers/WorkspaceListPopover";
import PeopleIcon from "@mui/icons-material/People";
import { selectWorkspace } from "../../store/workspaceSlice";
import { DRAWER_WIDTH, WorkspaceDrawerHeader } from "../layouts/WorkspaceLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface WorkspaceDrawerProps {
	open: boolean;
}

function WorkspaceDrawer(props: WorkspaceDrawerProps) {
	const { open } = props;
	const location = useLocation();
	const params = useParams();
	const navigate = useNavigate();
	const workspaceStore = useSelector(selectWorkspace);
	const [workspaceListAnchorEl, setWorkspaceListAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);
	const currentPage = useMemo(() => {
		return location.pathname.split("/")[2] ?? "main";
	}, [location.pathname]);

	const handleOpenWorkspacePopover: MouseEventHandler = (event) => {
		setWorkspaceListAnchorEl(event.currentTarget);
	};

	const handleCloseWorkspacePopover = () => {
		setWorkspaceListAnchorEl(null);
	};

	const handleNavigateToMember = () => {
		navigate(`/${params.workspaceSlug}/member`);
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
				<ListItemButton
					onClick={handleNavigateToMember}
					selected={currentPage === "member"}
				>
					<ListItemIcon>
						<PeopleIcon />
					</ListItemIcon>
					<ListItemText primary="Members" />
				</ListItemButton>
			</ListItem>
		</Drawer>
	);
}

export default WorkspaceDrawer;
