import {
	Box,
	CircularProgress,
	ListItemSecondaryAction,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import { useGetWorkspaceListQuery } from "../../hooks/api/workspace";
import InfiniteScroll from "react-infinite-scroller";
import { useMemo } from "react";
import { Workspace } from "../../hooks/api/types/workspace";
import { useNavigate, useParams } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";

interface WorkspaceListPopoverProps extends PopoverProps {
	width?: number;
}

function WorkspaceListPopover(props: WorkspaceListPopoverProps) {
	const { width, ...popoverProps } = props;
	const navigate = useNavigate();
	const params = useParams();
	const { data: workspacePageList, hasNextPage, fetchNextPage } = useGetWorkspaceListQuery();
	const workspaceList = useMemo(() => {
		return workspacePageList?.pages.reduce((prev: Array<Workspace>, page) => {
			return prev.concat(page.workspaces);
		}, [] as Array<Workspace>);
	}, [workspacePageList?.pages]);

	const handleMoveToSelectedWorkspace = (workspaceSlug: string) => {
		if (params.workspaceSlug === workspaceSlug) return;

		navigate(`/workspace/${workspaceSlug}`);
		popoverProps?.onClose?.(new Event("Close Popover"), "backdropClick");
	};

	return (
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
						{workspaceList?.map((workspace) => (
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
		</Popover>
	);
}

export default WorkspaceListPopover;
