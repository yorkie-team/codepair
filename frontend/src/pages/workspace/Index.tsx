import { useParams } from "react-router-dom";
import WorkspaceDrawer from "../../components/drawers/WorkspaceDrawer";
import { useGetWorkspaceDocumentListQuery } from "../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import { Box, CircularProgress, Grid, Stack } from "@mui/material";
import DocumentCard from "../../components/cards/DocumentCard";
import { useMemo } from "react";
import { Document } from "../../hooks/api/types/document.d";
import InfiniteScroll from "react-infinite-scroller";

function WorkspaceIndex() {
	const params = useParams();
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const {
		data: documentPageList,
		fetchNextPage,
		hasNextPage,
	} = useGetWorkspaceDocumentListQuery(workspace?.id);
	const documentList = useMemo(() => {
		return (
			documentPageList?.pages.reduce((prev, page) => {
				return prev.concat(page.documents);
			}, [] as Array<Document>) ?? []
		);
	}, [documentPageList?.pages]);

	return (
		<Stack direction="row">
			<WorkspaceDrawer />
			<Box
				style={{
					maxHeight: "100vh",
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
					<Box p={2} width={1}>
						<Grid
							container
							spacing={{ xs: 2, md: 3 }}
							columns={{ xs: 4, sm: 8, md: 12, lg: 12 }}
						>
							{documentList.map((document, idx) => (
								<Grid key={idx} item xs={4} sm={4} md={4} lg={3}>
									<DocumentCard document={document} />
								</Grid>
							))}
						</Grid>
					</Box>
				</InfiniteScroll>
			</Box>
		</Stack>
	);
}

export default WorkspaceIndex;
