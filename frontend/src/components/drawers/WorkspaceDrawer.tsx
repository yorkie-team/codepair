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
import PeopleIcon from "@mui/icons-material/People";
import MemberModal from "../modals/MemberModal";
import { selectWorkspace } from "../../store/workspaceSlice";
import { Avatar, Box, Button, Flex, Stack } from "yorkie-ui";

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
		<Box
			borderWidth="1px"
			borderColor="border.default"
			style={{
				width: DRAWER_WIDTH,
				height: "100vh",
				flexShrink: 0,
				paddingBottom: 10,
			}}
		>
			<Stack
				style={{
					height: "100%",
				}}
			>
				<WorkspaceListMenu width={DRAWER_WIDTH - 20} />
				<Box w="full" px="4">
					<Button w="full" onClick={handleCreateWorkspaceModalOpen}>
						<AddIcon />
						New Note
					</Button>
				</Box>
				<Button variant="ghost" w="full" onClick={handleMemberModalOpen}>
					<Flex alignItems="center" w="full" gap="4">
						<PeopleIcon />
						Members
					</Flex>
				</Button>

				<Button
					variant="ghost"
					w="full"
					onClick={handleOpenProfilePopover}
					style={{
						marginTop: "auto",
					}}
				>
					<Flex alignItems="center" w="full" justifyContent="space-between">
						<Flex alignItems="center" gap="4">
							<Avatar name={userStore.data?.nickname?.charAt(0)} />
							{userStore.data?.nickname}
						</Flex>
						<MoreVertIcon />
					</Flex>
				</Button>
				<ProfilePopover
					open={Boolean(profileAnchorEl)}
					anchorEl={profileAnchorEl}
					onClose={handleCloseProfilePopover}
				/>
				<CreateModal
					open={createWorkspaceModalOpen}
					title="Note"
					onSuccess={handleCreateWorkspace}
					onClose={handleCreateWorkspaceModalOpen}
				/>
				<MemberModal open={memberModalOpen} onClose={handleMemberModalOpen} />
			</Stack>
		</Box>
	);
}

export default WorkspaceDrawer;
