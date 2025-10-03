import { Box } from "@mui/material";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { selectUser } from "../../store/userSlice";
import { setLastWorkspaceSlug } from "../../utils/lastWorkspace";
import DocumentHeader from "../headers/DocumentHeader";

function DocumentLayout() {
	const { data: user } = useSelector(selectUser);
	const { workspaceSlug } = useParams();

	useEffect(() => {
		if (user?.id && workspaceSlug) {
			setLastWorkspaceSlug(user.id, workspaceSlug);
		}
	}, [user?.id, workspaceSlug]);

	return (
		<Box sx={{ flexGrow: 1 }} height="100vh">
			<DocumentHeader />
			<Outlet />
		</Box>
	);
}

export default DocumentLayout;
