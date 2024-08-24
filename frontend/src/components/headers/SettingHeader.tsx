import { MouseEventHandler, useState } from "react";
import { AppBar, Avatar, IconButton, Stack, Toolbar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import ProfilePopover from "../popovers/ProfilePopover";
import CodePairIcon from "../icons/CodePairIcon";
import { useNavigate } from "react-router-dom";

function SettingHeader() {
	const navigate = useNavigate();
	const userStore = useSelector(selectUser);
	const [profileAnchorEl, setProfileAnchorEl] = useState<(EventTarget & Element) | null>(null);

	const handleOpenProfilePopover: MouseEventHandler = (event) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleCloseProfilePopover = () => {
		setProfileAnchorEl(null);
	};

	const handleToWorkspace = () => {
		navigate(`/${userStore.data?.lastWorkspaceSlug}`);
	};

	return (
		<AppBar position="fixed">
			<Toolbar>
				<Stack
					width="100%"
					direction="row-reverse"
					justifyContent="space-between"
					alignItems="center"
				>
					<IconButton onClick={handleOpenProfilePopover}>
						<Avatar>{userStore.data?.nickname?.charAt(0)}</Avatar>
					</IconButton>
					<IconButton onClick={handleToWorkspace}>
						<CodePairIcon />
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

export default SettingHeader;
