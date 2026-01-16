import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Backdrop, CircularProgress } from "@mui/material";
import { selectUser } from "../../store/userSlice";
import { useGetWorkspaceListQuery } from "../../hooks/api/workspace";
import { getLastWorkspaceSlug } from "../../utils/lastWorkspace";

const WorkspaceRedirectHandler = () => {
	const user = useSelector(selectUser);
	const navigate = useNavigate();
	const { data: workspaceList, isLoading } = useGetWorkspaceListQuery();

	useEffect(() => {
		if (isLoading) return;

		const lastSlug = getLastWorkspaceSlug(user?.data?.id ?? null);

		// Check if the last accessed workspace is still accessible to the user
		if (lastSlug) {
			const hasAccessToLastWorkspace = workspaceList?.some(
				(workspace) => workspace.slug === lastSlug
			);

			if (hasAccessToLastWorkspace) {
				navigate(`/${lastSlug}`, { replace: true });
				return;
			}
		}

		// Fallback to first workspace if last workspace is not accessible
		const firstWorkspace = workspaceList?.[0];

		if (firstWorkspace) {
			navigate(`/${firstWorkspace.slug}`, { replace: true });
			return;
		}
	}, [user?.data?.id, workspaceList, navigate, isLoading]);

	return (
		<Backdrop open>
			<CircularProgress color="inherit" />
		</Backdrop>
	);
};

export default WorkspaceRedirectHandler;
