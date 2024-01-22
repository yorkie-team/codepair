import { useParams } from "react-router-dom";
import WorkspaceDrawer from "../../components/drawers/WorkspaceDrawer";
import { useGetWorkspaceDocumentListQuery } from "../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";
import { Box, Stack } from "@mui/material";

function WorkspaceIndex() {
	const params = useParams();
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceSlug);
	const { data } = useGetWorkspaceDocumentListQuery(workspace?.id);

	console.log(workspace, data);
	return (
		<Stack direction="row">
			<WorkspaceDrawer />
			<Box>123</Box>
		</Stack>
	);
}

export default WorkspaceIndex;
