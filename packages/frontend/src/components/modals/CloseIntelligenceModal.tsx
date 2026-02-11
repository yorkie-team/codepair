import { Button, Modal, ModalProps, Paper, Stack, Typography } from "@mui/material";

interface CloseIntelligenceModalProps extends Omit<ModalProps, "children"> {
	onCloseIntelligence: () => void;
}

function CloseIntelligenceModal(props: CloseIntelligenceModalProps) {
	const { onCloseIntelligence, ...modalProps } = props;

	const handleCloseModal = () => {
		modalProps?.onClose?.(new Event("Close Modal"), "escapeKeyDown");
	};

	const handleDiscard = () => {
		onCloseIntelligence();
		handleCloseModal();
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
				}}
			>
				<Stack gap={4}>
					<Stack alignItems="center" gap={1}>
						<img src="/yorkie.png" alt="yorkie" width={60} />
						<Typography variant="h6" align="center">
							Do you want to discard
							<br />
							the Yorkie response?
						</Typography>
					</Stack>
					<Stack direction="row" gap={1} justifyContent="center">
						<Button variant="outlined" onClick={handleDiscard}>
							Discard
						</Button>
						<Button variant="contained" onClick={handleCloseModal}>
							Cancel
						</Button>
					</Stack>
				</Stack>
			</Paper>
		</Modal>
	);
}

export default CloseIntelligenceModal;
