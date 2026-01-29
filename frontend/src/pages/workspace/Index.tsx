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
	Card,
	CardContent,
	CircularProgress,
	Divider,
	Paper,
	Stack,
	Tab,
	Tabs,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SourceIcon from "@mui/icons-material/Source";
import { Document } from "../../hooks/api/types/document.d";
import InfiniteScroll from "react-infinite-scroller";
import CreateModal from "../../components/modals/CreateModal";
import AddIcon from "@mui/icons-material/Add";
import BoardTab from "../../components/workspace/BoardTab";
import TableTab from "../../components/workspace/TableTab";
import { streamRagAnswer, RagStreamChunk } from "../../hooks/api/rag";

const TABS = ["BOARD", "TABLE"] as const;
type TabType = (typeof TABS)[number];

type SearchMode = "title" | "ai";

interface Source {
	documentId: string;
	documentTitle: string;
	content: string;
	score: number;
	chunkType: string;
	section?: string;
}

interface Timings {
	embeddingLatencyMs: number;
	vectorSearchLatencyMs: number;
	llmLatencyMs: number;
	totalLatencyMs: number;
}

function WorkspaceIndex() {
	const params = useParams();
	const navigate = useNavigate();
	const { data: workspace, isLoading } = useGetWorkspaceQuery(params.workspaceSlug);

	const [search, setSearch] = useState("");
	const [searchMode, setSearchMode] = useState<SearchMode>("title");
	const [currentTab, setCurrentTab] = useState<TabType>("BOARD");

	// AI Search states
	const [aiAnswer, setAiAnswer] = useState("");
	const [aiSources, setAiSources] = useState<Source[]>([]);
	const [aiTimings, setAiTimings] = useState<Timings | null>(null);
	const [isAiSearching, setIsAiSearching] = useState(false);
	const [aiError, setAiError] = useState<string | null>(null);

	const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
		setCurrentTab(newValue);
	};

	const handleSearchModeChange = (
		_: React.MouseEvent<HTMLElement>,
		newMode: SearchMode | null
	) => {
		if (newMode !== null) {
			setSearchMode(newMode);
			setSearch("");
			// Reset AI search results when switching modes
			if (newMode === "title") {
				setAiAnswer("");
				setAiSources([]);
				setAiTimings(null);
				setAiError(null);
			}
		}
	};

	const {
		data: documentPageList,
		fetchNextPage,
		hasNextPage,
	} = useGetWorkspaceDocumentListQuery(workspace?.id, searchMode === "title" ? search : "");

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

	const handleAiSearch = async () => {
		if (!search.trim() || !workspace?.id) return;

		setIsAiSearching(true);
		setAiAnswer("");
		setAiSources([]);
		setAiTimings(null);
		setAiError(null);

		try {
			await streamRagAnswer(
				workspace.id,
				search,
				(chunk: RagStreamChunk) => {
					switch (chunk.type) {
						case "sources":
							setAiSources(chunk.data);
							break;
						case "chunk":
							setAiAnswer((prev) => prev + chunk.data);
							break;
						case "answer":
							setAiAnswer(chunk.data);
							break;
						case "done":
							setAiTimings(chunk.data.timings);
							setIsAiSearching(false);
							break;
						case "error":
							setAiError(chunk.data);
							setIsAiSearching(false);
							break;
					}
				},
				5
			);
		} catch (err) {
			setAiError(err instanceof Error ? err.message : "An error occurred");
			setIsAiSearching(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (searchMode === "ai") {
				handleAiSearch();
			}
		}
	};

	const handleSourceClick = (documentId: string) => {
		navigate(`/${workspace?.slug}/${documentId}`);
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
					pb: { xs: 2, sm: 4 },
					zIndex: 3,
				}}
			>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					justifyContent="space-between"
					alignItems={{ xs: "flex-start", sm: "center" }}
					gap={2}
					pt={{ xs: 2, sm: 6 }}
				>
					<Typography
						variant="h6"
						fontWeight="bold"
						sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
					>
						Documents{" "}
						<Typography component="span" variant="inherit" color="primary">
							{documentPageList?.pages[0].totalLength}
						</Typography>
					</Typography>
					<Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleCreateDocumentModalOpen}
							sx={{ minWidth: { xs: "100%", sm: "auto" } }}
						>
							New Document
						</Button>
					</Stack>
				</Stack>

				{/* Search Section */}
				<Box mt={3}>
					<Stack direction="row" alignItems="center" gap={1.5}>
						<ToggleButtonGroup
							value={searchMode}
							exclusive
							onChange={handleSearchModeChange}
							sx={{ flexShrink: 0 }}
						>
							<ToggleButton value="title" sx={{ px: 1.5 }}>
								<SearchIcon sx={{ fontSize: "1.1rem" }} />
							</ToggleButton>
							<ToggleButton value="ai" sx={{ px: 1.5 }}>
								<AutoAwesomeIcon sx={{ fontSize: "1.1rem" }} />
							</ToggleButton>
						</ToggleButtonGroup>

						<TextField
							placeholder={
								searchMode === "title"
									? "Search by title..."
									: "Search by contents..."
							}
							variant="outlined"
							value={search}
							onChange={handleSearchChange}
							onKeyPress={handleKeyPress}
							size="small"
							fullWidth
							multiline={searchMode === "ai"}
							maxRows={searchMode === "ai" ? 3 : 1}
							disabled={isAiSearching}
						/>

						{searchMode === "ai" && (
							<Button
								variant="contained"
								onClick={handleAiSearch}
								disabled={!search.trim() || isAiSearching}
								sx={{ minWidth: 90, flexShrink: 0 }}
							>
								{isAiSearching ? <CircularProgress size={24} /> : "Search"}
							</Button>
						)}
					</Stack>
				</Box>
			</Paper>

			{/* AI Search Results */}
			{searchMode === "ai" && aiError && (
				<Paper sx={{ p: 3, mb: 3, bgcolor: "error.light" }}>
					<Typography color="error.contrastText">
						<strong>Error:</strong> {aiError}
					</Typography>
				</Paper>
			)}

			{searchMode === "ai" && aiAnswer && (
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography variant="h6" gutterBottom>
						Answer
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<Typography
						variant="body1"
						sx={{
							whiteSpace: "pre-wrap",
							fontFamily: "inherit",
							lineHeight: 1.7,
						}}
					>
						{aiAnswer}
					</Typography>

					{aiTimings && (
						<Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
							<AccessTimeIcon fontSize="small" color="action" />
							<Typography variant="caption" color="text.secondary">
								Search: {aiTimings.vectorSearchLatencyMs}ms • LLM:{" "}
								{aiTimings.llmLatencyMs}ms • Total: {aiTimings.totalLatencyMs}ms
							</Typography>
						</Box>
					)}
				</Paper>
			)}

			{searchMode === "ai" && aiSources.length > 0 && (
				<Box sx={{ mb: 3 }}>
					<Typography variant="h6" gutterBottom>
						Sources
					</Typography>
					<Stack spacing={2}>
						{aiSources.map((source, index) => (
							<Card
								key={index}
								variant="outlined"
								sx={{
									cursor: "pointer",
									transition: "all 0.2s",
									"&:hover": {
										boxShadow: 2,
										borderColor: "primary.main",
									},
								}}
								onClick={() => handleSourceClick(source.documentId)}
							>
								<CardContent>
									<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
										<SourceIcon
											fontSize="small"
											sx={{ mr: 1 }}
											color="primary"
										/>
										<Typography variant="subtitle2" color="primary">
											#{index + 1} - {source.documentTitle}
										</Typography>
										<Typography
											variant="caption"
											sx={{
												ml: "auto",
												bgcolor: "action.hover",
												px: 1,
												py: 0.5,
												borderRadius: 1,
											}}
										>
											Score: {(source.score * 100).toFixed(1)}%
										</Typography>
									</Box>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 1 }}
									>
										{source.content}
									</Typography>
									{source.section && (
										<Typography
											variant="caption"
											color="text.disabled"
											sx={{ mt: 1, display: "block" }}
										>
											Section: {source.section}
										</Typography>
									)}
								</CardContent>
							</Card>
						))}
					</Stack>
				</Box>
			)}

			{/* Document List Tabs - Only show in title search mode */}
			{searchMode === "title" && (
				<>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }} mb={{ xs: 2, sm: 4 }}>
						<Tabs
							value={currentTab}
							onChange={handleTabChange}
							sx={{
								minHeight: { xs: 40, sm: 48 },
								"& .MuiTab-root": {
									minHeight: { xs: 40, sm: 48 },
									py: { xs: 1, sm: 1.5 },
								},
							}}
						>
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
				</>
			)}

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
