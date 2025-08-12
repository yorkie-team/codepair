import {
	Box,
	CircularProgress,
	Divider,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import {
	useCreateWorkspaceMutation,
	useGetWorkspaceListQuery,
	useSetWorkspaceOrderMutation,
} from "../../hooks/api/workspace";
import InfiniteScroll from "react-infinite-scroller";
import { useState, useCallback, useEffect } from "react";
import { CreateWorkspaceRequest, Workspace } from "../../hooks/api/types/workspace";
import { useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";
import { useDragSort } from "../../hooks/useDragSort";
import DraggableWorkspaceItem from "../common/DraggableWorkspaceItem";
import DropIndicator from "../common/DropIndicator";

interface WorkspaceListPopoverProps extends PopoverProps {
	width?: number;
}

function WorkspaceListPopover(props: WorkspaceListPopoverProps) {
	const { width, ...popoverProps } = props;
	const navigate = useNavigate();
	const params = useParams();
	const { data: workspacePageList, hasNextPage, fetchNextPage } = useGetWorkspaceListQuery();
	const { mutateAsync: createWorkspace } = useCreateWorkspaceMutation();
	const { mutateAsync: setWorkspaceOrder } = useSetWorkspaceOrderMutation();

	const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);

	useEffect(() => {
		const newWorkspaceList =
			workspacePageList?.pages.reduce((prev: Array<Workspace>, page) => {
				return prev.concat(page.workspaces);
			}, [] as Array<Workspace>) ?? [];
		setWorkspaceList(newWorkspaceList);
	}, [workspacePageList?.pages]);

	const handleReorder = useCallback(
		async (newWorkspaceList: Workspace[]) => {
			const previousList = workspaceList;
			setWorkspaceList(newWorkspaceList);

			try {
				await setWorkspaceOrder({
					workspaceIds: newWorkspaceList.map((w) => w.id),
				});
			} catch (error) {
				setWorkspaceList(previousList);
				throw error;
			}
		},
		[setWorkspaceOrder, workspaceList]
	);

	const { dragState, containerRef, setItemRef, dragHandlers } = useDragSort({
		items: workspaceList,
		onReorder: handleReorder,
		getItemKey: (workspace) => workspace.id,
	});

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
						ref={containerRef}
						style={{
							maxHeight: 300,
							overflow: "auto",
							position: "relative",
							paddingBottom: 8,
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
							<DropIndicator
								show={
									dragState.isDragging &&
									dragState.dropIndex !== null &&
									Math.abs(dragState.currentY - dragState.startY) > 10
								}
								yPosition={dragState.dropIndicatorY}
							/>

							{workspaceList.map((workspace, index) => (
								<DraggableWorkspaceItem
									key={workspace.id}
									ref={(el) => setItemRef(workspace.id, el)}
									workspace={workspace}
									isSelected={params.workspaceSlug === workspace.slug}
									isDragging={dragState.isDragging}
									isDraggedItem={dragState.draggedIndex === index}
									onSelect={handleMoveToSelectedWorkspace}
									onPointerDown={(event) =>
										dragHandlers.onPointerDown(event, index)
									}
									onPointerMove={dragHandlers.onPointerMove}
									onPointerUp={dragHandlers.onPointerUp}
								/>
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
