import {
	Button,
	FormControl,
	IconButton,
	Modal,
	ModalProps,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import CloseIcon from "@mui/icons-material/Close";

interface CreateRequest {
	title: string;
}

interface CreateModalProps extends Omit<ModalProps, "children"> {
	title: string;
	onSuccess: (data: CreateRequest) => Promise<void>;
}

function CreateModal(props: CreateModalProps) {
	const { title, onSuccess, ...modalProps } = props;

	const handleCloseModal = () => {
		modalProps?.onClose?.(new Event("Close Modal"), "escapeKeyDown");
	};

	const handleCreate = async (data: CreateRequest) => {
		await onSuccess(data);
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
					width: 400,
				}}
			>
				<IconButton
					sx={{
						position: "absolute",
						top: 28,
						right: 28,
					}}
					onClick={handleCloseModal}
				>
					<CloseIcon />
				</IconButton>
				<Stack gap={4}>
					<Typography variant="h5">Create New {title}</Typography>
					<FormControl>
						<FormContainer defaultValues={{ title: "" }} onSuccess={handleCreate}>
							<Stack gap={4} alignItems="flex-end">
								<TextFieldElement
									variant="standard"
									name="title"
									label="Title of new note"
									required
									fullWidth
									inputProps={{
										maxLength: 255,
									}}
								/>
								<Button type="submit" variant="contained" size="large">
									OK
								</Button>
							</Stack>
						</FormContainer>
					</FormControl>
				</Stack>
			</Paper>
		</Modal>
	);
}

export default CreateModal;
