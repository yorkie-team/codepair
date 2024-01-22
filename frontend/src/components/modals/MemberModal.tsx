import {
	Avatar,
	Box,
	CircularProgress,
	IconButton,
	Modal,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGetWorkspaceUserListQuery } from "../../hooks/api/workspaceUser";
import { useParams } from "react-router-dom";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import { useMemo } from "react";
import { User } from "../../hooks/api/types/user";
import InfiniteScroll from "react-infinite-scroller";

interface MemeberModalProps {
	open: boolean;
	onClose: () => void;
}

function MemeberModal(props: MemeberModalProps) {
	const { open, onClose } = props;
	const params = useParams();
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const {
		data: workspaceUserPageList,
		fetchNextPage,
		hasNextPage,
	} = useGetWorkspaceUserListQuery(workspace?.id);
	const userList = useMemo(() => {
		return (
			workspaceUserPageList?.pages.reduce((prev, page) => {
				return prev.concat(page.workspaceUsers);
			}, [] as Array<User>) ?? []
		);
	}, [workspaceUserPageList?.pages]);

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
