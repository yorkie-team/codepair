import {
	Box,
	Button,
	FormControl,
	IconButton,
	Modal,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateWorkspaceInvitationTokenMutation } from "../../hooks/api/workspace";
import { useState } from "react";
import { FormContainer, SelectElement } from "react-hook-form-mui";
import { invitationExpiredStringList } from "../../utils/expire";
import moment, { unitOfTime } from "moment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import clipboard from "clipboardy";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { selectWorkspace } from "../../store/workspaceSlice";

interface MemberModalProps {
	open: boolean;
	onClose: () => void;
}

function MemberModal(props: MemberModalProps) {
	const { open, onClose } = props;
	const workspaceStore = useSelector(selectWorkspace);
	const { mutateAsync: createWorkspaceInvitationToken } =
		useCreateWorkspaceInvitationTokenMutation(workspaceStore.data?.id || "");
	const { enqueueSnackbar } = useSnackbar();
	const [invitationUrl, setInvitationUrl] = useState<string | null>(null);

	const handleCreateInviteUrl = async (data: { expiredString: string }) => {
		let addedTime: Date | null;

		if (data.expiredString === invitationExpiredStringList[0]) {
			addedTime = null;
		} else {
			const [num, unit] = data.expiredString.split(" ");
			addedTime = moment()
				.add(Number(num), unit as unitOfTime.DurationConstructor)
				.toDate();
		}

		const { invitationToken } = await createWorkspaceInvitationToken({
			expiredAt: addedTime,
		});

		setInvitationUrl(`${window.location.origin}/join/${invitationToken}`);
	};

	const handleCopyInviteUrl = async () => {
		if (!invitationUrl) return;

		await clipboard.write(invitationUrl);
		enqueueSnackbar("URL Copied!", { variant: "success" });
	};

	return (
		<Modal open={open} disableAutoFocus onClose={onClose}>
			<Paper
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					p: 4,
					width: 538,
				}}
			>
				<IconButton
					sx={{
						position: "absolute",
						top: 28,
						right: 28,
					}}
					onClick={onClose}
				>
					<CloseIcon />
				</IconButton>
				<Stack gap={4}>
					<Stack>
						<Typography variant="h5" fontWeight="bold">
							Add Members
						</Typography>
						<Typography>Generate and share the link.</Typography>
					</Stack>
					<Stack gap={1}>
						<FormControl>
							<FormContainer
								defaultValues={{ expiredString: invitationExpiredStringList[0] }}
								onSuccess={handleCreateInviteUrl}
							>
								<Stack gap={2}>
									<SelectElement
										label="Expired Date"
										name="expiredString"
										options={invitationExpiredStringList.map(
											(expiredString) => ({
												id: expiredString,
												label: expiredString,
											})
										)}
										size="small"
										sx={{
											width: 1,
										}}
									/>
									<Button type="submit" variant="contained">
										Generate
									</Button>
								</Stack>
							</FormContainer>
						</FormControl>
					</Stack>
					<Stack gap={1}>
						<Typography variant="h6" fontWeight="bold">
							Invite Link
						</Typography>
						<Box height={40}>
							{invitationUrl ? (
								<Stack direction="row" alignItems="center" gap={2}>
									<Typography variant="body1">{invitationUrl}</Typography>
									<Tooltip title="Copy URL">
										<IconButton onClick={handleCopyInviteUrl}>
											<ContentCopyIcon />
										</IconButton>
									</Tooltip>
								</Stack>
							) : (
								<Typography mx="auto">No link has been generated.</Typography>
							)}
						</Box>
					</Stack>
				</Stack>
			</Paper>
		</Modal>
	);
}

export default MemberModal;
