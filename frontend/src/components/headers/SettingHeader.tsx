import { MouseEventHandler, useState } from "react";
import { Avatar, IconButton, Stack, Toolbar } from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import ProfilePopover from "../popovers/ProfilePopover";
import CodePairIcon from "../icons/CodePairIcon";
import { useNavigate } from "react-router-dom";
import { CommonAppBar } from "./CommonHeader";



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
		<CommonAppBar position="fixed">
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
		</CommonAppBar>
	);
}

export default SettingHeader;
