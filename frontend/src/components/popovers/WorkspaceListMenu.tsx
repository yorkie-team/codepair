import { CircularProgress, IconButton } from "@mui/material";
import { useCreateWorkspaceMutation, useGetWorkspaceListQuery } from "../../hooks/api/workspace";
import InfiniteScroll from "react-infinite-scroller";
import { useMemo, useState } from "react";
import { CreateWorkspaceRequest, Workspace } from "../../hooks/api/types/workspace";
import { useNavigate, useParams } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import CreateModal from "../modals/CreateModal";
import { Flex, Menu, Text, Box } from "yorkie-ui";
import { useSelector } from "react-redux";
import { selectWorkspace } from "../../store/workspaceSlice";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface WorkspaceListMenuProps {
	width: number;
}

function WorkspaceListMenu(props: WorkspaceListMenuProps) {
	const { width } = props;
	const navigate = useNavigate();
	const params = useParams();
	const workspaceStore = useSelector(selectWorkspace);
	const { data: workspacePageList, hasNextPage, fetchNextPage } = useGetWorkspaceListQuery();
	const { mutateAsync: createWorkspace } = useCreateWorkspaceMutation();
	const workspaceList = useMemo(() => {
		return (
			workspacePageList?.pages.reduce((prev: Array<Workspace>, page) => {
				return prev.concat(page.workspaces);
			}, [] as Array<Workspace>) ?? []
		);
	}, [workspacePageList?.pages]);
	const [menuOpen, setMenuOpen] = useState(false);
	const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);

	const moveToWorkspace = (slug: string) => {
		navigate(`/${slug}`);
	};

	const handleMoveToSelectedWorkspace = (workspaceSlug: string) => {
		if (params.workspaceSlug === workspaceSlug) return;

		moveToWorkspace(workspaceSlug);
		setMenuOpen(false);
	};

	const handleCreateWorkspaceModalOpen = () => {
		setCreateWorkspaceModalOpen((prev) => !prev);
		if (menuOpen) {
			setMenuOpen(false);
		}
	};

	const handleCreateWorkspace = async (data: CreateWorkspaceRequest) => {
		const res = await createWorkspace(data);

		moveToWorkspace(res.slug);
	};

	const handleMenuOpen = () => {
		setMenuOpen((prev) => !prev);
	};

	return (
		<>
			<Menu.Root open={menuOpen} onPointerDownOutside={handleMenuOpen}>
				<Menu.Trigger w="full">
					<Menu.Item id="title" w="100%" onClick={handleMenuOpen}>
						<Flex w="100%" alignItems="center" justifyContent="space-between">
							<Text>{workspaceStore.data?.title}</Text>
							<IconButton>
								{menuOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
							</IconButton>
						</Flex>
					</Menu.Item>
				</Menu.Trigger>
				<Menu.Positioner>
					<Menu.Content
						style={{
							width,
						}}
					>
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
									<Menu.Item
										key={workspace.id}
										id={workspace.id}
										onClick={() =>
											handleMoveToSelectedWorkspace(workspace.slug)
										}
									>
										<Flex
											w="full"
											alignItems="center"
											justifyContent="space-between"
										>
											{workspace.title}
											{params.workspaceSlug === workspace.slug && (
												<CheckIcon fontSize="small" />
											)}
										</Flex>
									</Menu.Item>
								))}
							</InfiniteScroll>
						</Box>
						<Menu.Separator />
						<Menu.Item id="item" onClick={handleCreateWorkspaceModalOpen}>
							<Flex alignItems="center" gap="2">
								<AddIcon fontSize="small" />
								Create Workspace
							</Flex>
						</Menu.Item>
					</Menu.Content>
				</Menu.Positioner>
			</Menu.Root>
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

export default WorkspaceListMenu;
