import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Backdrop, CircularProgress } from "@mui/material";
import { selectUser } from "../../store/userSlice";
import { useGetWorkspaceListQuery } from "../../hooks/api/workspace";

const WorkspaceRedirectHandler = () => {
	const user = useSelector(selectUser);
	const navigate = useNavigate();
	const { data: workspaceList, isLoading } = useGetWorkspaceListQuery();

	useEffect(() => {
		if (isLoading) return;

		if (user?.data?.lastWorkspaceSlug) {
			navigate(`/${user.data.lastWorkspaceSlug}`, { replace: true });
			return;
		}

		if (workspaceList?.pages?.[0]?.workspaces?.length) {
			const firstWorkspace = workspaceList.pages[0].workspaces[0];
			navigate(`/${firstWorkspace.slug}`, { replace: true });
			return;
		}
	}, [user, workspaceList, navigate, isLoading]);

	return (
		<Backdrop open>
			<CircularProgress color="inherit" />
		</Backdrop>
	);
};

export default WorkspaceRedirectHandler;
