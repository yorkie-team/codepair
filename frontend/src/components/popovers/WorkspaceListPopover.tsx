import {
	Box,
	CircularProgress,
	Divider,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import { useCreateWorkspaceMutation, useGetWorkspaceListQuery } from "../../hooks/api/workspace";
import InfiniteScroll from "react-infinite-scroller";
import { useMemo, useState } from "react";
import { CreateWorkspaceRequest, Workspace } from "../../hooks/api/types/workspace";
import { useNavigate, useParams } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";

interface WorkspaceListPopoverProps extends PopoverProps {
	width?: number;
}

function WorkspaceListPopover(props: WorkspaceListPopoverProps) {
	const { width, ...popoverProps } = props;
	const navigate = useNavigate();
	const params = useParams();
	const { data: workspacePageList, hasNextPage, fetchNextPage } = useGetWorkspaceListQuery();
	const { mutateAsync: createWorkspace } = useCreateWorkspaceMutation();
	const workspaceList = useMemo(() => {
		return (
			workspacePageList?.pages.reduce((prev: Array<Workspace>, page) => {
				return prev.concat(page.workspaces);
			}, [] as Array<Workspace>) ?? []
		);
	}, [workspacePageList?.pages]);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);

	const moveToWorkspace = (slug: string) => {
		navigate(`/${slug}`);
	};

	const handleMoveToSelectedWorkspace = (workspaceSlug: string) => {
		if (params.workspaceSlug === workspaceSlug) return;

		moveToWorkspace(workspaceSlug);
		popoverProps?.onClose?.(new Event("Close Popover"), "backdropClick");
	};

	const handleCreateWorkspaceModalOpen = () => {
		setCreateWorkspaceModalOpen((prev) => !prev);
		if (popoverProps.open) {
			popoverProps?.onClose?.(new Event("Close Popover"), "backdropClick");
		}
	};

	const handleCreateWorkspace = async (data: CreateWorkspaceRequest) => {
		const res = await createWorkspace(data);

		moveToWorkspace(res.slug);
	};

	return (
		<>
			<Popover
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
				{...popoverProps}
			>
				<MenuList sx={{ width }}>
					<Box
						style={{
							maxHeight: 300,
							overflow: "auto",
						}}
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
							{workspaceList.map((workspace) => (
								<MenuItem
									key={workspace.id}
									onClick={() => handleMoveToSelectedWorkspace(workspace.slug)}
								>
									<ListItemText
										primaryTypographyProps={{
											noWrap: true,
											variant: "body2",
										}}
									>
										{workspace.title}
									</ListItemText>
									{params.workspaceSlug === workspace.slug && (
										<ListItemSecondaryAction>
											<CheckIcon fontSize="small" />
										</ListItemSecondaryAction>
									)}
								</MenuItem>
							))}
						</InfiniteScroll>
					</Box>
				</MenuList>
				<Divider />
				<MenuList sx={{ width }}>
					<MenuItem onClick={handleCreateWorkspaceModalOpen}>
						<ListItemIcon>
							<AddIcon fontSize="small" color="primary" />
						</ListItemIcon>
						<ListItemText
							primaryTypographyProps={{
								color: "primary",
							}}
						>
							Create Workspace
						</ListItemText>
					</MenuItem>
				</MenuList>
			</Popover>
			<CreateModal
				open={createWorkspaceModalOpen}
				title="Workspace"
				onClose={handleCreateWorkspaceModalOpen}
				onSuccess={handleCreateWorkspace}
				enableConflictCheck
			/>
		</>
	);
}

export default WorkspaceListPopover;
