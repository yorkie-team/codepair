import { Button, Modal, ModalProps, Paper, Stack, Typography } from "@mui/material";

interface DeleteModalProps extends Omit<ModalProps, "children"> {
	title?: string;
	onSuccess: () => void;
}

function DeleteModal(props: DeleteModalProps) {
	const { title, onSuccess, ...modalProps } = props;

	const handleCloseModal = () => {
		modalProps?.onClose?.(new Event("Close Modal"), "escapeKeyDown");
	};

	return (
		<Modal disableAutoFocus {...modalProps}>
			<Paper
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					p: 4,
					width: 400,
				}}
			>
				<Stack gap={4}>
					<Typography variant="h5">Delete {title}</Typography>
					<Typography variant="body2" color="text.secondary">
						This action cannot be undone.
					</Typography>
					<Stack direction="row" alignItems="center" justifyContent="flex-end" gap={2}>
						<Button variant="contained" size="large" onClick={handleCloseModal}>
							Cancel
						</Button>
						<Button variant="contained" size="large" color="error" onClick={onSuccess}>
							Confirm
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Modal>
	);
}

export default DeleteModal;
