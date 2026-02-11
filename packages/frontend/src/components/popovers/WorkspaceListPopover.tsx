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
	useUpdateWorkspaceOrderMutation,
} from "../../hooks/api/workspace";
import { useState, useCallback } from "react";
import { CreateWorkspaceRequest, Workspace } from "../../hooks/api/types/workspace";
import { useNavigate, useParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";
import { useDragSort } from "../../hooks/useDragSort";
import DraggableWorkspaceItem from "../common/DraggableWorkspaceItem";
import { DropIndicator } from "@codepair/ui";

interface WorkspaceListPopoverProps extends PopoverProps {
	width?: number;
}

function WorkspaceListPopover(props: WorkspaceListPopoverProps) {
	const { width, ...popoverProps } = props;
	const navigate = useNavigate();
	const params = useParams();
	const { data: workspaceList = [], isLoading } = useGetWorkspaceListQuery();
	const { mutateAsync: createWorkspace } = useCreateWorkspaceMutation();
	const { mutateAsync: setWorkspaceOrder } = useUpdateWorkspaceOrderMutation();

	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);

	const handleReorder = useCallback(
		async (newWorkspaceList: Workspace[]) => {
			try {
				await setWorkspaceOrder({
					workspaceIds: newWorkspaceList.map((w) => w.id),
				});
			} catch (error) {
				throw error;
			}
		},
		[setWorkspaceOrder]
	);

	const { dragState, containerRef, setItemRef, dragHandlers, isRecentlyDropped } = useDragSort({
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
					{isLoading ? (
						<Box display="flex" justifyContent="center" p={2}>
							<CircularProgress size={20} />
						</Box>
					) : (
						<Box
							ref={containerRef}
							style={{
								maxHeight: 300,
								overflowY: "auto",
								overflowX: "hidden",
								position: "relative",
								paddingBottom: 8,
							}}
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
									isRecentlyDropped={isRecentlyDropped}
									onSelect={handleMoveToSelectedWorkspace}
									onPointerDown={(event) =>
										dragHandlers.onPointerDown(event, index)
									}
									onPointerMove={dragHandlers.onPointerMove}
									onPointerUp={dragHandlers.onPointerUp}
								/>
							))}
						</Box>
					)}
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
