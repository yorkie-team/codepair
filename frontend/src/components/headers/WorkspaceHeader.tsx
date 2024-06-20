import { Avatar, IconButton, Stack, Toolbar, styled } from "@mui/material";
import AppBar, { AppBarProps } from "@mui/material/AppBar";
import { DRAWER_WIDTH } from "../layouts/WorkspaceLayout";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import ProfilePopover from "../popovers/ProfilePopover";
import { MouseEventHandler, useState } from "react";

interface WorkspaceAppBarProps extends AppBarProps {
	open?: boolean;
}

const WorkspaceAppBar = styled(AppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})<WorkspaceAppBarProps>(({ theme, open }) => ({
	transition: theme.transitions.create(["margin", "width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${DRAWER_WIDTH}px)`,
		marginLeft: `${DRAWER_WIDTH}px`,
		transition: theme.transitions.create(["margin", "width"], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

interface WorkspaceHeaderProps {
	open: boolean;
	onDrawerOpen: () => void;
}

function WorkspaceHeader(props: WorkspaceHeaderProps) {
	const { open, onDrawerOpen } = props;
	const userStore = useSelector(selectUser);
	const [profileAnchorEl, setProfileAnchorEl] = useState<(EventTarget & Element) | null>(null);

	const handleOpenProfilePopover: MouseEventHandler = (event) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleCloseProfilePopover = () => {
		setProfileAnchorEl(null);
	};

	return (
		<WorkspaceAppBar position="fixed" open={open}>
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
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={onDrawerOpen}
						edge="start"
						sx={{ mr: 2, ...(open && { display: "none" }) }}
					>
						<MenuIcon />
					</IconButton>
				</Stack>
			</Toolbar>
			<ProfilePopover
				open={Boolean(profileAnchorEl)}
				anchorEl={profileAnchorEl}
				onClose={handleCloseProfilePopover}
			/>
		</WorkspaceAppBar>
	);
}

export default WorkspaceHeader;
