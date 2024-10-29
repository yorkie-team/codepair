import {
	Button,
	FormControl,
	IconButton,
	Modal,
	ModalProps,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { FormContainer, SelectElement } from "react-hook-form-mui";
import { invitationExpiredStringList } from "../../utils/expire";
import { useState } from "react";
import moment, { unitOfTime } from "moment";
import { useParams } from "react-router";
import { useCreateWorkspaceSharingTokenMutation } from "../../hooks/api/workspaceDocument";
import { ShareRole } from "../../utils/share";
import clipboard from "clipboardy";
import { useSnackbar } from "notistack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { selectDocument } from "../../store/documentSlice";

type ShareModalProps = Omit<ModalProps, "children">;

function ShareModal(props: ShareModalProps) {
	const { ...modalProps } = props;
	const params = useParams();
	const [shareUrl, setShareUrl] = useState<string | null>(null);
	const documentStore = useSelector(selectDocument);
	const { mutateAsync: createWorkspaceSharingToken } = useCreateWorkspaceSharingTokenMutation(
		documentStore.data?.workspaceId || "",
		documentStore.data?.id || ""
	);
	const { enqueueSnackbar } = useSnackbar();

	const handleCreateShareUrl = async (data: { expiredString: string; role: ShareRole }) => {
		let addedTime: Date | null;

		if (data.expiredString === invitationExpiredStringList[0]) {
			addedTime = null;
		} else {
			const [num, unit] = data.expiredString.split(" ");
			addedTime = moment()
				.add(Number(num), unit as unitOfTime.DurationConstructor)
				.toDate();
		}

		const { sharingToken } = await createWorkspaceSharingToken({
			role: data.role,
			expiredAt: addedTime,
		});

		setShareUrl(
			`${window.location.origin}/${params.workspaceSlug}/${params.documentId}/share?token=${sharingToken}`
		);
	};

	const handleCopyShareUrl = async () => {
		if (!shareUrl) return;

		await clipboard.write(shareUrl);
		enqueueSnackbar("URL Copied!", { variant: "success" });
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
					onClick={(e) => props.onClose?.(e, "backdropClick")}
				>
					<CloseIcon />
				</IconButton>
				<Stack gap={1}>
					<Typography variant="subtitle1">Share Link</Typography>
					<FormControl>
						<FormContainer
							defaultValues={{
								expiredString: invitationExpiredStringList[0],
								role: Object.values(ShareRole)[0],
							}}
							onSuccess={handleCreateShareUrl}
						>
							<Stack gap={2}>
								<SelectElement
									label="Role"
									name="role"
									options={Object.values(ShareRole).map((role) => ({
										id: role,
										label: role,
									}))}
									size="small"
									sx={{
										width: 1,
									}}
									variant="filled"
								/>
								<SelectElement
									label="Expired Date"
									name="expiredString"
									options={invitationExpiredStringList.map((expiredString) => ({
										id: expiredString,
										label: expiredString,
									}))}
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
					{Boolean(shareUrl) && (
						<Stack direction="row" alignItems="center" gap={2}>
							<Typography variant="body1" width={1} noWrap>
								{shareUrl}
							</Typography>
							<Tooltip title="Copy URL">
								<IconButton onClick={handleCopyShareUrl}>
									<ContentCopyIcon />
								</IconButton>
							</Tooltip>
						</Stack>
					)}
				</Stack>
			</Paper>
		</Modal>
	);
}

export default ShareModal;
