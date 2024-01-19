import { useParams } from "react-router-dom";
import WorkspaceDrawer from "../../components/drawers/WorkspaceDrawer";
import { useGetWorkspaceDocumentListQuery } from "../../hooks/api/workspaceDocument";
import { useGetWorkspaceQuery } from "../../hooks/api/workspace";

function WorkspaceIndex() {
	const params = useParams();
	const { data: workspace } = useGetWorkspaceQuery(params.workspaceId);
	const { data } = useGetWorkspaceDocumentListQuery(workspace?.id);

	console.log(data);
	return <WorkspaceDrawer />;
}

export default WorkspaceIndex;
