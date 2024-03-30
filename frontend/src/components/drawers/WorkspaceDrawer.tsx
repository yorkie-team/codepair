import {
	Avatar,
	Button,
	Divider,
	Drawer,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import { MouseEventHandler, useState } from "react";
import ProfilePopover from "../popovers/ProfilePopover";
import { useNavigate } from "react-router-dom";

import WorkspaceListMenu from "../popovers/WorkspaceListMenu";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";
import { useCreateDocumentMutation } from "../../hooks/api/workspaceDocument";
import ThemeButton from "../common/ThemeButton";
import PeopleIcon from "@mui/icons-material/People";
import MemberModal from "../modals/MemberModal";
import { selectWorkspace } from "../../store/workspaceSlice";

const DRAWER_WIDTH = 240;

function WorkspaceDrawer() {
	const navigate = useNavigate();
	const userStore = useSelector(selectUser);
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createDocument } = useCreateDocumentMutation(
		workspaceStore.data?.id || ""
	);
	const [profileAnchorEl, setProfileAnchorEl] = useState<(EventTarget & Element) | null>(null);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
	const [memberModalOpen, setMemberModalOpen] = useState(false);

	const handleOpenProfilePopover: MouseEventHandler = (event) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleCloseProfilePopover = () => {
		setProfileAnchorEl(null);
	};

	const handleCreateWorkspace = async (data: { title: string }) => {
		const document = await createDocument(data);

		navigate(document.id);
	};

	const handleCreateWorkspaceModalOpen = () => {
		setCreateWorkspaceModalOpen((prev) => !prev);
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
			variant="permanent"
			anchor="left"
			open
		>
			<ListItem disablePadding>
				<WorkspaceListMenu width={DRAWER_WIDTH - 20} />
			</ListItem>
			<Divider />
			<ListItem>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					sx={{
						width: 1,
					}}
					onClick={handleCreateWorkspaceModalOpen}
				>
					New Note
				</Button>
			</ListItem>
			<Divider />
			<ListItem disablePadding>
				<ListItemButton onClick={handleMemberModalOpen}>
					<ListItemIcon>
						<PeopleIcon />
					</ListItemIcon>
					<ListItemText primary="Members" />
				</ListItemButton>
			</ListItem>
			<Divider />
			<ListItem sx={{ mt: "auto" }}>
				<Stack width={1} alignItems="center" justifyContent="flex-end" direction="row">
					<ThemeButton />
				</Stack>
			</ListItem>
			<Divider />
			<ListItem disablePadding>
				<ListItemButton onClick={handleOpenProfilePopover}>
					<ListItemAvatar>
						<Avatar>{userStore.data?.nickname?.charAt(0)}</Avatar>
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
			<CreateModal
				open={createWorkspaceModalOpen}
				title="Note"
				onSuccess={handleCreateWorkspace}
				onClose={handleCreateWorkspaceModalOpen}
			/>
			<MemberModal open={memberModalOpen} onClose={handleMemberModalOpen} />
		</Drawer>
	);
}

export default WorkspaceDrawer;
