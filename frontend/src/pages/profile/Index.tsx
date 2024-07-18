import { Container, Stack, Avatar, Typography, Button, FormControl } from "@mui/material";
import { TextFieldElement, FormContainer } from "react-hook-form-mui";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { useUpdateUserNicknmaeMutation } from "../../hooks/api/user";
import { useCheckNameConflictQuery } from "../../hooks/api/check";

const avatarSize = 117;

function ProfileIndex() {
	const userStore = useSelector(selectUser);
	const [nickname, setNickname] = useState(userStore.data?.nickname || "");
	const [debouncedNickname, setDebouncedNickname] = useState("");
	const { data: conflictResult } = useCheckNameConflictQuery(debouncedNickname);
	const { mutateAsync: updateUserNickname } = useUpdateUserNicknmaeMutation();
	const errorMessage = useMemo(() => {
		if (conflictResult?.conflict) {
			return "Already Exists";
		}
		return null;
	}, [conflictResult?.conflict]);

	const isSumbit = () => {
		return (
			Boolean(errorMessage) || nickname === userStore.data?.nickname || nickname.length === 0
		);
	};

	useDebounce(
		() => {
			setDebouncedNickname(nickname);
		},
		500,
		[nickname]
	);

	useEffect(() => {
		if (userStore.data?.nickname) {
			setNickname(userStore.data?.nickname || "");
		}
	}, [userStore.data?.nickname]);

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setNickname(e.target.value);
	};

	const handleUpdateUserNickname = async (data: { nickname: string }) => {
		await updateUserNickname(data);
	};

	return (
		<Container sx={{ height: "calc(100vh - 88px)", width: "100%" }}>
			<Stack alignItems="center" justifyContent="center" gap={6} sx={{ height: 1 }}>
				<Avatar
					sx={{
						width: avatarSize,
						height: avatarSize,
						fontSize: avatarSize / 2,
					}}
				>
					{userStore.data?.nickname?.charAt(0).toUpperCase()}
				</Avatar>
				<Stack width={310}>
					<FormControl>
						<Typography variant="body1">User name</Typography>
						{userStore.data?.nickname && (
							<FormContainer
								defaultValues={{ nickname: userStore.data?.nickname }}
								onSuccess={handleUpdateUserNickname}
							>
								<Stack gap={3}>
									<TextFieldElement
										variant="standard"
										name="nickname"
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
										disabled={isSumbit()}
									>
										Save
									</Button>
								</Stack>
							</FormContainer>
						)}
					</FormControl>
				</Stack>
			</Stack>
		</Container>
	);
}

export default ProfileIndex;
