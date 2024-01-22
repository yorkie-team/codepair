import { Button, FormControl, Modal, ModalProps, Paper, Stack, Typography } from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";

interface CreateModalProps extends ModalProps {
	title: string;
	onSuccess: (data: { title: string }) => Promise<void>;
}

function CreateModal(props: CreateModalProps) {
	const { title, onSuccess, ...modalProps } = props;

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
					<Typography variant="h5">Create New {title}</Typography>
					<FormControl>
						<FormContainer defaultValues={{ title: "" }} onSuccess={onSuccess}>
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
