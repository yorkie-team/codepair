import { useNavigate, useParams } from "react-router-dom";
import {
	useCreateDocumentMutation,
	useGetWorkspaceDocumentListQuery,
} from "../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import { Backdrop, Box, Button, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import DocumentCard from "../../components/cards/DocumentCard";
import { useMemo, useState } from "react";
import { Document } from "../../hooks/api/types/document.d";
import InfiniteScroll from "react-infinite-scroller";
import CreateModal from "../../components/modals/CreateModal";
import AddIcon from "@mui/icons-material/Add";

function WorkspaceIndex() {
	const params = useParams();
	const navigate = useNavigate();
	const { data: workspace, isLoading } = useGetWorkspaceQuery(params.workspaceSlug);

	const {
		data: documentPageList,
		fetchNextPage,
		hasNextPage,
	} = useGetWorkspaceDocumentListQuery(workspace?.id);
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

	return (
		<Stack gap={2}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" px={2}>
				<Typography variant="h5" fontWeight="bold">
					{workspace?.title}{" "}
					<Typography component="span" variant="inherit" color="primary">
						{documentPageList?.pages[0].totalLength}
					</Typography>
				</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleCreateDocumentModalOpen}
				>
					New Note
				</Button>
			</Stack>
			<Stack
				style={{
					maxHeight: "calc(100vh - 144px)",
					overflow: "auto",
				}}
			>
				<InfiniteScroll
					pageStart={0}
					loadMore={() => fetchNextPage()}
					hasMore={hasNextPage}
					loader={
						<Stack className="loader" key={0} alignItems="center">
							<CircularProgress size={20} />
						</Stack>
					}
					useWindow={false}
				>
					<Box p={2} width={1}>
						<Grid
							container
							spacing={{ xs: 2, md: 3 }}
							columns={{ xs: 4, sm: 8, md: 12, lg: 12 }}
						>
							{documentList.map((document) => (
								<Grid key={document.id} item xs={4} sm={4} md={4} lg={3}>
									<DocumentCard document={document} />
								</Grid>
							))}
						</Grid>
					</Box>
				</InfiniteScroll>
			</Stack>
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
