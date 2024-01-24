import { Button, FormControl, Modal, ModalProps, Paper, Stack, Typography } from "@mui/material";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import { useCheckNameConflictQuery } from "../../hooks/api/check";
import { useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { useUpdateUserNicknmaeMutation } from "../../hooks/api/user";

interface ChangeNicknameModalProps extends Omit<ModalProps, "children"> {}

function ChangeNicknameModal(props: ChangeNicknameModalProps) {
	const [nickname, setNickname] = useState("");
	const [debouncedNickname, setDebouncedNickname] = useState("");
	const { data: conflictResult } = useCheckNameConflictQuery(debouncedNickname);
	const { mutateAsync: updateUserNickname } = useUpdateUserNicknmaeMutation();
	const errorMessage = useMemo(() => {
		if (conflictResult?.conflict) {
			return "Already Exists";
		}
		return null;
	}, [conflictResult?.conflict]);

	useDebounce(
		() => {
			setDebouncedNickname(nickname);
		},
		500,
		[nickname]
	);

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setNickname(e.target.value);
	};

	const handleUpdateUserNickname = async (data: { nickname: string }) => {
		await updateUserNickname(data);
	};

	return (
		<Modal disableAutoFocus {...props}>
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
					<Typography variant="h5">Create Your Nickname</Typography>
					<FormControl>
						<FormContainer
							defaultValues={{ nickname: "" }}
							onSuccess={handleUpdateUserNickname}
						>
							<Stack gap={4} alignItems="flex-end">
								<TextFieldElement
									variant="standard"
									name="nickname"
									label="Enter your nickname"
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

export default ChangeNicknameModal;
