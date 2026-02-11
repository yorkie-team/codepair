import { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Box,
	Typography,
} from "@mui/material";

interface CreateRevisionDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (label: string, description?: string) => Promise<void>;
	isLoading: boolean;
}

function CreateRevisionDialog({ open, onClose, onConfirm, isLoading }: CreateRevisionDialogProps) {
	const [label, setLabel] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		if (open) {
			// Set default values when opening
			const now = new Date();
			setLabel(`v${now.toISOString().substring(0, 10)}`);
			setDescription("");
		}
	}, [open]);

	const handleConfirm = async () => {
		if (!label.trim()) return;
		await onConfirm(label.trim(), description.trim() || undefined);
	};

	const handleClose = () => {
		if (!isLoading) {
			onClose();
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Save New Revision</DialogTitle>
			<DialogContent>
				<Box sx={{ pt: 1 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Save the current state of the document as a revision. You can restore to
						this revision later.
					</Typography>

					<TextField
						autoFocus
						label="Revision Name"
						placeholder="e.g., v1.0, Draft, Final"
						fullWidth
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						sx={{ mb: 2 }}
						required
						helperText="Enter a name to identify this revision"
					/>

					<TextField
						label="Description (Optional)"
						placeholder="Describe the changes in this revision"
						fullWidth
						multiline
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						helperText="Add a description to make this revision easier to find later"
					/>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={isLoading}>
					Cancel
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					disabled={!label.trim() || isLoading}
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default CreateRevisionDialog;
