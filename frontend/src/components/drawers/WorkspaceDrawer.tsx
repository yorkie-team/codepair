import { useSelector } from "react-redux";
import { useState } from "react";
import ProfileMenu from "../popovers/ProfileMenu";
import { useNavigate } from "react-router-dom";
import WorkspaceListMenu from "../popovers/WorkspaceListMenu";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";
import { useCreateDocumentMutation } from "../../hooks/api/workspaceDocument";
import PeopleIcon from "@mui/icons-material/People";
import MemberModal from "../modals/MemberModal";
import { selectWorkspace } from "../../store/workspaceSlice";
import { Box, Button, Flex, Stack } from "yorkie-ui";

const DRAWER_WIDTH = 240;

function WorkspaceDrawer() {
	const navigate = useNavigate();
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createDocument } = useCreateDocumentMutation(
		workspaceStore.data?.id || ""
	);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
	const [memberModalOpen, setMemberModalOpen] = useState(false);

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

				<Box
					style={{
						marginTop: "auto",
					}}
				>
					<ProfileMenu />
				</Box>
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
