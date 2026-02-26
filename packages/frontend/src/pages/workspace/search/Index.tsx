import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Divider,
	Link,
	Paper,
	TextField,
	Typography,
	Backdrop,
} from "@mui/material";
import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import SourceIcon from "@mui/icons-material/Source";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { streamRagAnswer, RagStreamChunk } from "../../../hooks/api/rag";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkspaceQuery } from "../../../hooks/api/workspace";

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

export function RagSearchPage() {
	const navigate = useNavigate();
	const params = useParams();
	const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspaceQuery(
		params.workspaceSlug
	);
	const [query, setQuery] = useState("");
	const [answer, setAnswer] = useState("");
	const [sources, setSources] = useState<Source[]>([]);
	const [timings, setTimings] = useState<Timings | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Reset state when workspace changes
	useEffect(() => {
		setQuery("");
		setAnswer("");
		setSources([]);
		setTimings(null);
		setError(null);
	}, [workspace?.id]);

	const handleSearch = async () => {
		if (!query.trim() || !workspace?.id) return;

		setIsLoading(true);
		setAnswer("");
		setSources([]);
		setTimings(null);
		setError(null);

		try {
			await streamRagAnswer(
				workspace.id,
				query,
				(chunk: RagStreamChunk) => {
					switch (chunk.type) {
						case "sources":
							setSources(chunk.data);
							break;
						case "chunk":
							setAnswer((prev) => prev + chunk.data);
							break;
						case "answer":
							setAnswer(chunk.data);
							break;
						case "done":
							setTimings(chunk.data.timings);
							setIsLoading(false);
							break;
						case "error":
							setError(chunk.data);
							setIsLoading(false);
							break;
					}
				},
				5
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSearch();
		}
	};

	const handleSourceClick = (documentId: string) => {
		navigate(`/${workspace?.slug}/${documentId}`);
	};

	if (isLoadingWorkspace) {
		return (
			<Backdrop open>
				<CircularProgress color="inherit" />
			</Backdrop>
		);
	}

	if (!workspace) {
		return (
			<Container maxWidth="lg" sx={{ mt: 4 }}>
				<Typography variant="h6" color="text.secondary">
					Please select a workspace
				</Typography>
			</Container>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" gutterBottom>
					RAG Search
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Ask questions about your workspace documents using AI-powered semantic search
				</Typography>
			</Box>

			<Paper sx={{ p: 3, mb: 3 }}>
				<Box sx={{ display: "flex", gap: 2 }}>
					<TextField
						fullWidth
						multiline
						maxRows={4}
						placeholder="Ask a question about your workspace documents..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isLoading}
						variant="outlined"
					/>
					<Button
						variant="contained"
						onClick={handleSearch}
						disabled={!query.trim() || isLoading}
						sx={{ minWidth: 120, height: "fit-content" }}
					>
						{isLoading ? <CircularProgress size={24} /> : "Search"}
					</Button>
				</Box>
			</Paper>

			{error && (
				<Paper sx={{ p: 3, mb: 3, bgcolor: "error.light" }}>
					<Typography color="error.contrastText">
						<strong>Error:</strong> {error}
					</Typography>
				</Paper>
			)}

			{answer && (
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
						{answer}
					</Typography>

					{timings && (
						<Box sx={{ mt: 3, display: "flex", gap: 2, alignItems: "center" }}>
							<AccessTimeIcon fontSize="small" color="action" />
							<Typography variant="caption" color="text.secondary">
								Search: {timings.vectorSearchLatencyMs}ms • LLM:{" "}
								{timings.llmLatencyMs}ms • Total: {timings.totalLatencyMs}ms
							</Typography>
						</Box>
					)}
				</Paper>
			)}

			{sources.length > 0 && (
				<Box>
					<Typography
						variant="h6"
						gutterBottom
						sx={{ display: "flex", alignItems: "center" }}
					>
						<SourceIcon sx={{ mr: 1 }} />
						Sources ({sources.length})
					</Typography>
					{sources.map((source, index) => (
						<Card key={index} sx={{ mb: 2, cursor: "pointer" }} variant="outlined">
							<CardContent
								onClick={() => handleSourceClick(source.documentId)}
								sx={{
									"&:hover": {
										bgcolor: "action.hover",
									},
								}}
							>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										mb: 1,
									}}
								>
									<Box>
										<Typography variant="subtitle2" color="primary">
											{source.documentTitle}
											{source.section && ` • ${source.section}`}
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{source.chunkType} • Relevance:{" "}
											{(source.score * 100).toFixed(1)}%
										</Typography>
									</Box>
									<Link
										component="button"
										onClick={(e) => {
											e.stopPropagation();
											handleSourceClick(source.documentId);
										}}
										sx={{ textDecoration: "none" }}
									>
										Open
									</Link>
								</Box>
								<Typography variant="body2" color="text.secondary">
									{source.content}
								</Typography>
							</CardContent>
						</Card>
					))}
				</Box>
			)}

			{!answer && !isLoading && !error && (
				<Paper sx={{ p: 6, textAlign: "center", bgcolor: "background.default" }}>
					<SearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No results yet
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Enter a question above to search your workspace documents
					</Typography>
				</Paper>
			)}
		</Container>
	);
}
