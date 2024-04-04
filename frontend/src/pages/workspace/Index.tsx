import { useParams } from "react-router-dom";
import WorkspaceDrawer from "../../components/drawers/WorkspaceDrawer";
import { useGetWorkspaceDocumentListQuery } from "../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import { CircularProgress } from "@mui/material";
import DocumentCard from "../../components/cards/DocumentCard";
import { useMemo } from "react";
import { Document } from "../../hooks/api/types/document.d";
import InfiniteScroll from "react-infinite-scroller";
import { Grid, GridItem, Box, Stack } from "yorkie-ui";

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
				width="full"
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
					<Box p={2} w="full">
						<Grid gap={6} gridTemplateColumns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
							{documentList.map((document) => (
								<GridItem key={document.id}>
									<DocumentCard document={document} />
								</GridItem>
							))}
						</Grid>
					</Box>
				</InfiniteScroll>
			</Box>
		</Stack>
	);
}

export default WorkspaceIndex;
