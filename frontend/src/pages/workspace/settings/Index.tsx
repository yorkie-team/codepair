import DeleteIcon from "@mui/icons-material/Delete";
import {
	Box,
	Button,
	Container,
	Divider,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeleteModal from "../../../components/modals/DeleteModal";
import { useDeleteWorkSpaceMutation, useGetWorkspaceQuery } from "../../../hooks/api/workspace";

function SettingsIndex() {
	const params = useParams();
	const navigate = useNavigate();
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const { mutateAsync: deleteWorkspace } = useDeleteWorkSpaceMutation(workspace?.id);
	const [deleteWorkspaceModalOpen, setDeleteWorkspaceModalOpen] = useState(false);

	const handleDeleteWorkspaceModalOpen = () => {
		setDeleteWorkspaceModalOpen((prev) => !prev);
	};

	const handleDeleteWorkspace = async () => {
		await deleteWorkspace();
		setDeleteWorkspaceModalOpen(false);
		navigate("/", { replace: true });
	};

	return (
		<Container maxWidth="lg">
			<Stack gap={{ xs: 3, sm: 6 }} py={{ xs: 2, sm: 6 }}>
				<Typography
					variant="h6"
					fontWeight="bold"
					sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
				>
					Settings
				</Typography>

				{/* Workspace Information Section */}
				<Paper sx={{ p: 3 }}>
					<Stack gap={3}>
						<Typography variant="h6" fontWeight="medium">
							General
						</Typography>
						<Stack gap={2}>
							<Box>
								<Typography variant="subtitle2" color="text.secondary" mb={1}>
									Workspace Name
								</Typography>
								<TextField
									fullWidth
									value={workspace?.title || ""}
									disabled
									size="small"
								/>
							</Box>
							<Box>
								<Typography variant="subtitle2" color="text.secondary" mb={1}>
									Workspace Slug
								</Typography>
								<TextField
									fullWidth
									value={workspace?.slug || ""}
									disabled
									size="small"
								/>
							</Box>
						</Stack>
					</Stack>
				</Paper>

				{/* Danger Zone Section */}
				<Paper sx={{ p: 3, borderColor: "error.main" }}>
					<Stack gap={3}>
						<Typography variant="h6" fontWeight="medium" color="error">
							Danger Zone
						</Typography>
						<Divider />
						<Stack
							direction={{ xs: "column", sm: "row" }}
							justifyContent="space-between"
							alignItems={{ xs: "flex-start", sm: "center" }}
							gap={2}
						>
							<Box>
								<Typography variant="subtitle1" fontWeight="medium">
									Delete this workspace
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Once you delete a workspace, there is no going back. Please be
									certain.
								</Typography>
							</Box>
							{/* NOTE(kokodak): Delete workspace button should be visible after
								the following requirements are met:
								- Members should NOT see the delete button.
								- Even Owners should go through an extra confirmation step before delete.
								Once these requirements are met, we can safely remove the MODE condition below.
								For more details, see PR #556: https://github.com/yorkie-team/codepair/pull/556
							*/}
							{import.meta.env.MODE !== "production" && (
								<Button
									variant="contained"
									color="error"
									startIcon={<DeleteIcon />}
									onClick={handleDeleteWorkspaceModalOpen}
								>
									Delete Workspace
								</Button>
							)}
						</Stack>
					</Stack>
				</Paper>
			</Stack>
			<DeleteModal
				open={deleteWorkspaceModalOpen}
				title={workspace?.title}
				onSuccess={handleDeleteWorkspace}
				onClose={handleDeleteWorkspaceModalOpen}
			/>
		</Container>
	);
}

export default SettingsIndex;
