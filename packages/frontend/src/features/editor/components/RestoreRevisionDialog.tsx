import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Alert,
} from "@mui/material";

interface RestoreRevisionDialogProps {
	open: boolean;
	revisionLabel?: string;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	isLoading: boolean;
}

function RestoreRevisionDialog({
	open,
	revisionLabel,
	onClose,
	onConfirm,
	isLoading,
}: RestoreRevisionDialogProps) {
	const handleClose = () => {
		if (!isLoading) {
			onClose();
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Restore Revision</DialogTitle>
			<DialogContent>
				<Alert severity="warning" sx={{ mb: 2 }}>
					The current document will be reverted to the selected revision.
				</Alert>

				<Typography variant="body1" gutterBottom>
					Restore to revision <strong>"{revisionLabel}"</strong>?
				</Typography>

				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					After restoration, the current state will be saved as a new revision. The
					restored content will be reflected in real-time to other collaborators.
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={isLoading}>
					Cancel
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="warning"
					disabled={isLoading}
				>
					Restore
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default RestoreRevisionDialog;
