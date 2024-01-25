import {
	Avatar,
	Box,
	Button,
	CircularProgress,
	FormControl,
	IconButton,
	Modal,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGetWorkspaceUserListQuery } from "../../hooks/api/workspaceUser";
import { useCreateWorkspaceInvitationTokenMutation } from "../../hooks/api/workspace";
import { useMemo, useState } from "react";
import { User } from "../../hooks/api/types/user";
import InfiniteScroll from "react-infinite-scroller";
import { FormContainer, SelectElement } from "react-hook-form-mui";
import { invitationExpiredStringList } from "../../utils/expire";
import moment, { unitOfTime } from "moment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import clipboard from "clipboardy";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { selectWorkspace } from "../../store/workspaceSlice";

interface MemeberModalProps {
	open: boolean;
	onClose: () => void;
}

function MemeberModal(props: MemeberModalProps) {
	const { open, onClose } = props;
	const workspaceStore = useSelector(selectWorkspace);
	const {
		data: workspaceUserPageList,
		fetchNextPage,
		hasNextPage,
	} = useGetWorkspaceUserListQuery(workspaceStore.data?.id);
	const { mutateAsync: createWorkspaceInvitationToken } =
		useCreateWorkspaceInvitationTokenMutation(workspaceStore.data?.id || "");
	const userList = useMemo(() => {
		return (
			workspaceUserPageList?.pages.reduce((prev, page) => {
				return prev.concat(page.workspaceUsers);
			}, [] as Array<User>) ?? []
		);
	}, [workspaceUserPageList?.pages]);
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
					width: 400,
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
					<Typography variant="h5">Members</Typography>
					<Stack gap={1}>
						<Typography variant="subtitle1">Invite Link</Typography>
						<FormControl>
							<FormContainer
								defaultValues={{ expiredString: invitationExpiredStringList[0] }}
								onSuccess={handleCreateInviteUrl}
							>
								<Stack direction="row" justifyContent="space-between" gap={2}>
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
										variant="filled"
									/>
									<Button type="submit" variant="contained">
										Generate
									</Button>
								</Stack>
							</FormContainer>
						</FormControl>
						{Boolean(invitationUrl) && (
							<Stack direction="row" alignItems="center" gap={2}>
								<Typography variant="body1">{invitationUrl}</Typography>
								<Tooltip title="Copy URL">
									<IconButton onClick={handleCopyInviteUrl}>
										<ContentCopyIcon />
									</IconButton>
								</Tooltip>
							</Stack>
						)}
					</Stack>
					<Box
						style={{
							height: 300,
							maxHeight: "100%",
							overflow: "auto",
						}}
						width={1}
					>
						<InfiniteScroll
							pageStart={0}
							loadMore={() => fetchNextPage()}
							hasMore={hasNextPage}
							loader={
								<Box className="loader" key={0}>
									<CircularProgress size="sm" />
								</Box>
							}
							useWindow={false}
						>
							<Stack gap={2}>
								{userList.map((user) => (
									<Stack key={user.id} direction="row" alignItems="center">
										<Stack direction="row" alignItems="center" gap={1}>
											<Avatar>{user.nickname?.[0]}</Avatar>
											<Typography>{user.nickname}</Typography>
										</Stack>
									</Stack>
								))}
							</Stack>
						</InfiniteScroll>
					</Box>
				</Stack>
			</Paper>
		</Modal>
	);
}

export default MemeberModal;
