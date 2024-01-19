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

	const handleMoveToSelectedWorkspace = (workspaceId: string) => {
		if (params.workspaceId === workspaceId) return;

		navigate(`/workspace/${workspaceId}`);
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
			<Box
				style={{
					height: 300,
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
					<MenuList sx={{ width }}>
						{workspaceList?.map((workspace) => (
							<MenuItem
								key={workspace.id}
								onClick={() => handleMoveToSelectedWorkspace(workspace.id)}
							>
								<ListItemText
									primaryTypographyProps={{
										noWrap: true,
									}}
								>
									{workspace.title}
								</ListItemText>
								{params.workspaceId === workspace.id && (
									<ListItemSecondaryAction>
										<CheckIcon fontSize="small" />
									</ListItemSecondaryAction>
								)}
							</MenuItem>
						))}
					</MenuList>
				</InfiniteScroll>
			</Box>
		</Popover>
	);
}

export default WorkspaceListPopover;
