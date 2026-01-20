import { Box } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { selectUser } from "../../features/user";
import { setLastWorkspaceSlug } from "../../utils/lastWorkspace";
import DocumentHeader from "../headers/DocumentHeader";

function DocumentLayout() {
	const { data: user } = useSelector(selectUser);
	const { workspaceSlug } = useParams();
	const location = useLocation();

	useEffect(() => {
		// Don't save workspace slug for shared documents (public access)
		// to avoid redirecting users to workspaces they don't have access to
		const isSharePath = location.pathname.includes("/share");
		if (user?.id && workspaceSlug && !isSharePath) {
			setLastWorkspaceSlug(user.id, workspaceSlug);
		}
	}, [user?.id, workspaceSlug, location.pathname]);

	return (
		<Box sx={{ flexGrow: 1 }} height="100vh">
			<DocumentHeader />
			<Outlet />
		</Box>
	);
}

export default DocumentLayout;
