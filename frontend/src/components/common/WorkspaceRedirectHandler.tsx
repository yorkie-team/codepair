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
		if (lastSlug) {
			navigate(`/${lastSlug}`, { replace: true });
			return;
		}

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
