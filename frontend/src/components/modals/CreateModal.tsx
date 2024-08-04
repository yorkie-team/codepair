import CloseIcon from "@mui/icons-material/Close";
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
import { useMemo, useState } from "react";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { useDebounce } from "react-use";
import { useCheckNameConflictQuery } from "../../hooks/api/check";

interface CreateRequest {
	title: string;
}

interface CreateModalProps extends Omit<ModalProps, "children"> {
	title: string;
	onSuccess: (data: CreateRequest) => Promise<void>;
	enableConflictCheck?: boolean;
}

function CreateModal(props: CreateModalProps) {
	const { title, onSuccess, enableConflictCheck, ...modalProps } = props;
	const [nickname, setNickname] = useState("");
	const [debouncedNickname, setDebouncedNickname] = useState("");
	const { data: conflictResult } = useCheckNameConflictQuery(debouncedNickname);

	const errorMessage = useMemo(() => {
		if (!enableConflictCheck) return null;

		if (nickname.length < 2) {
			return "Title must be at least 2 characters";
		}
		if (conflictResult?.conflict) {
			return "Already Exists";
		}
		return null;
	}, [enableConflictCheck, nickname.length, conflictResult?.conflict]);

	useDebounce(
		() => {
			setDebouncedNickname(nickname);
		},
		500,
		[nickname]
	);

	const handleCloseModal = () => {
		modalProps?.onClose?.(new Event("Close Modal"), "escapeKeyDown");
	};

	const handleCreate = async (data: CreateRequest) => {
		if (data.title.length >= 2) {
			await onSuccess(data);
			handleCloseModal();
		}
	};

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (!enableConflictCheck) return;
		setNickname(e.target.value);
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
									label={`Title of New ${title}`}
									required
									fullWidth
									inputProps={{
										maxLength: 255,
									}}
									onChange={handleNicknameChange}
									error={Boolean(errorMessage)}
									helperText={errorMessage}
								/>
								<Button
									type="submit"
									variant="contained"
									size="large"
									disabled={Boolean(errorMessage)}
								>
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
