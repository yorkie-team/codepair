import { useState } from "react";
import {
	Box,
	Drawer,
	List,
	Typography,
	Button,
	CircularProgress,
	Divider,
	IconButton,
	Alert,
} from "@mui/material";
import {
	Close as CloseIcon,
	Add as AddIcon,
	History as HistoryIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectEditor } from "../store/editorSlice";
import { useYorkieRevisions } from "../hooks/useYorkieRevisions";
import RevisionListItem from "./RevisionListItem";
import CreateRevisionDialog from "./CreateRevisionDialog";
import RestoreRevisionDialog from "./RestoreRevisionDialog";
import PreviewRevisionDialog from "./PreviewRevisionDialog";
import type { RevisionSummary } from "@yorkie-js/sdk";

interface RevisionPanelProps {
	open: boolean;
	onClose: () => void;
}

function RevisionPanel({ open, onClose }: RevisionPanelProps) {
	const editorStore = useSelector(selectEditor);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
	const [selectedRevision, setSelectedRevision] = useState<{
		id: string;
		label: string;
	} | null>(null);
	const [previewRevision, setPreviewRevision] = useState<RevisionSummary | null>(null);

	const {
		revisions,
		isLoading,
		error,
		fetchRevisions,
		getRevision,
		createRevision,
		restoreRevision,
	} = useYorkieRevisions({
		client: editorStore.client,
		doc: editorStore.doc,
		enabled: open,
	});

	const handleCreateRevision = async (label: string, description?: string) => {
		await createRevision(label, description);
		setCreateDialogOpen(false);
	};

	const handleRestoreRevision = async () => {
		if (!selectedRevision) return;
		await restoreRevision(selectedRevision.id);
		setRestoreDialogOpen(false);
		setSelectedRevision(null);
	};

	return (
		<>
			<Drawer
				anchor="right"
				open={open}
				onClose={onClose}
				PaperProps={{
					sx: {
						width: { xs: "100%", sm: 400 },
						maxWidth: "100%",
					},
				}}
			>
				<Box
					sx={{
						p: { xs: 1.5, sm: 2 },
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
						<HistoryIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
						<Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
							History
						</Typography>
					</Box>
					<Box>
						<IconButton
							onClick={() => fetchRevisions()}
							size="small"
							disabled={isLoading}
						>
							<RefreshIcon />
						</IconButton>
						<IconButton onClick={onClose} size="small">
							<CloseIcon />
						</IconButton>
					</Box>
				</Box>

				<Divider />

				<Box sx={{ p: { xs: 1.5, sm: 2 } }}>
					<Button
						fullWidth
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setCreateDialogOpen(true)}
						disabled={isLoading || !editorStore.client || !editorStore.doc}
						sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}
					>
						Save New Revision
					</Button>
				</Box>

				<Divider />

				{error && (
					<Box sx={{ p: 2 }}>
						<Alert severity="error">{error.message}</Alert>
					</Box>
				)}

				{isLoading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<List sx={{ flex: 1, overflow: "auto" }}>
						{revisions.map((revision) => (
							<RevisionListItem
								key={revision.id}
								revision={revision}
								onRestore={(id, label) => {
									setSelectedRevision({ id, label });
									setRestoreDialogOpen(true);
								}}
								onPreview={(revision) => {
									setPreviewRevision(revision);
									setPreviewDialogOpen(true);
								}}
							/>
						))}
						{!revisions.length && !error && (
							<Box sx={{ p: 4, textAlign: "center" }}>
								<Typography color="text.secondary">No saved revisions.</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ mt: 1, display: "block" }}
								>
									Save a revision at important milestones.
								</Typography>
							</Box>
						)}
					</List>
				)}
			</Drawer>

			<CreateRevisionDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onConfirm={handleCreateRevision}
				isLoading={isLoading}
			/>

			<RestoreRevisionDialog
				open={restoreDialogOpen}
				revisionLabel={selectedRevision?.label}
				onClose={() => {
					setRestoreDialogOpen(false);
					setSelectedRevision(null);
				}}
				onConfirm={handleRestoreRevision}
				isLoading={isLoading}
			/>

			<PreviewRevisionDialog
				open={previewDialogOpen}
				revision={previewRevision}
				getRevision={getRevision}
				onClose={() => {
					setPreviewDialogOpen(false);
					setPreviewRevision(null);
				}}
			/>
		</>
	);
}

export default RevisionPanel;
