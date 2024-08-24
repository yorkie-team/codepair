import { MouseEventHandler, useState } from "react";
import { AppBar, Avatar, Button, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import ProfilePopover from "../popovers/ProfilePopover";
import { selectWorkspace } from "../../store/workspaceSlice";
import WorkspaceListPopover from "../popovers/WorkspaceListPopover";
import { DRAWER_WIDTH } from "../../constants/layout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function WorkspaceHeader() {
	const userStore = useSelector(selectUser);
	const workspaceStore = useSelector(selectWorkspace);
	const [workspaceListAnchorEl, setWorkspaceListAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);
	const [profileAnchorEl, setProfileAnchorEl] = useState<(EventTarget & Element) | null>(null);

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
		<AppBar position="fixed">
			<Toolbar>
				<Stack
					width="100%"
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Button
						variant="text"
						color="inherit"
						sx={{ width: DRAWER_WIDTH, textAlign: "left" }}
						onClick={handleOpenWorkspacePopover}
					>
						<Stack
							width={1}
							direction="row"
							justifyContent="space-between"
							alignItems="center"
						>
							<Typography variant="h6" component="span" noWrap>
								{workspaceStore.data?.title}
							</Typography>
							{workspaceListAnchorEl ? (
								<KeyboardArrowUpIcon />
							) : (
								<KeyboardArrowDownIcon />
							)}
						</Stack>
					</Button>
					<WorkspaceListPopover
						open={Boolean(workspaceListAnchorEl)}
						anchorEl={workspaceListAnchorEl}
						onClose={handleCloseWorkspacePopover}
						width={DRAWER_WIDTH}
					/>
					<IconButton onClick={handleOpenProfilePopover}>
						<Avatar>{userStore.data?.nickname?.charAt(0)}</Avatar>
					</IconButton>
				</Stack>
			</Toolbar>
			<ProfilePopover
				open={Boolean(profileAnchorEl)}
				anchorEl={profileAnchorEl}
				onClose={handleCloseProfilePopover}
			/>
		</AppBar>
	);
}

export default WorkspaceHeader;
