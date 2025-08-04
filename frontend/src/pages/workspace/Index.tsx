import { useNavigate, useParams } from "react-router-dom";
import {
	useCreateDocumentMutation,
	useGetWorkspaceDocumentListQuery,
} from "../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import {
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Paper,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { Document } from "../../hooks/api/types/document.d";
import InfiniteScroll from "react-infinite-scroller";
import CreateModal from "../../components/modals/CreateModal";
import AddIcon from "@mui/icons-material/Add";
import BoardTab from "../../components/workspace/BoardTab";
import TableTab from "../../components/workspace/TableTab";

const TABS = ["BOARD", "TABLE"] as const;
type TabType = (typeof TABS)[keyof typeof TABS];

function WorkspaceIndex() {
	const params = useParams();
	const navigate = useNavigate();
	const { data: workspace, isLoading } = useGetWorkspaceQuery(params.workspaceSlug);

	const [search, setSearch] = useState("");
	const [currentTab, setCurrentTab] = useState<TabType>("BOARD");

	const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
		setCurrentTab(newValue);
	};

	const {
		data: documentPageList,
		fetchNextPage,
		hasNextPage,
	} = useGetWorkspaceDocumentListQuery(workspace?.id, search);
	const { mutateAsync: createDocument } = useCreateDocumentMutation(workspace?.id || "");
	const [createDocumentModalOpen, setCreateDocumentModalOpen] = useState(false);
	const documentList = useMemo(() => {
		return (
			documentPageList?.pages.reduce((prev, page) => {
				return prev.concat(page.documents);
			}, [] as Array<Document>) ?? []
		);
	}, [documentPageList?.pages]);

	if (isLoading) {
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);
	}

	const handleCreateDocumentModalOpen = () => {
		setCreateDocumentModalOpen((prev) => !prev);
	};

	const handleCreateWorkspace = async (data: { title: string }) => {
		const document = await createDocument(data);

		navigate(document.id);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value);
	};

	return (
		<Stack position="relative" pb={6}>
			<Paper
				elevation={0}
				sx={{
					position: "sticky",
					top: 64,
					left: 0,
					width: "100%",
					pb: 4,
					zIndex: 3,
				}}
			>
				<Stack direction="row" justifyContent="space-between" alignItems="center" pt={6}>
					<Typography variant="h5" fontWeight="bold">
						{workspace?.title}{" "}
						<Typography component="span" variant="inherit" color="primary">
							{documentPageList?.pages[0].totalLength}
						</Typography>
					</Typography>
					<Stack direction="row" alignItems="center" gap={2}>
						<TextField
							placeholder="Search notes..."
							variant="outlined"
							value={search}
							onChange={handleSearchChange}
							size="small"
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								},
							}}
						/>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleCreateDocumentModalOpen}
						>
							New Note
						</Button>
					</Stack>
				</Stack>
			</Paper>
			<Box sx={{ borderBottom: 1, borderColor: "divider" }} mb={4}>
				<Tabs value={currentTab} onChange={handleTabChange}>
					{TABS.map((tab) => (
						<Tab key={tab} label={tab} value={tab} />
					))}
				</Tabs>
			</Box>
			<InfiniteScroll
				pageStart={0}
				loadMore={() => fetchNextPage()}
				hasMore={hasNextPage}
				loader={
					<Stack className="loader" key={0} alignItems="center">
						<CircularProgress size={20} />
					</Stack>
				}
			>
				<Box width={1}>
					{currentTab === "BOARD" && <BoardTab documents={documentList} />}
					{currentTab === "TABLE" && <TableTab documents={documentList} />}
				</Box>
			</InfiniteScroll>
			<CreateModal
				open={createDocumentModalOpen}
				title="Note"
				onSuccess={handleCreateWorkspace}
				onClose={handleCreateDocumentModalOpen}
			/>
		</Stack>
	);
}

export default WorkspaceIndex;
