import {
	Button,
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
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WorkspaceListPopover from "../popovers/WorkspaceListPopover";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";
import { useCreateDocumentMutation } from "../../hooks/api/workspaceDocument";
import PeopleIcon from "@mui/icons-material/People";
import MemberModal from "../modals/MemberModal";
import { selectWorkspace } from "../../store/workspaceSlice";
import { DRAWER_WIDTH, WorkspaceDrawerHeader } from "../layouts/WorkspaceLayout";

interface WorkspaceDrawerProps {
	open: boolean;
}

function WorkspaceDrawer(props: WorkspaceDrawerProps) {
	const { open } = props;
	const navigate = useNavigate();
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createDocument } = useCreateDocumentMutation(
		workspaceStore.data?.id || ""
	);
	const [workspaceListAnchorEl, setWorkspaceListAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
	const [memberModalOpen, setMemberModalOpen] = useState(false);

	const handleOpenWorkspacePopover: MouseEventHandler = (event) => {
		setWorkspaceListAnchorEl(event.currentTarget);
	};

	const handleCloseWorkspacePopover = () => {
		setWorkspaceListAnchorEl(null);
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
