import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import WorkspaceHeader from "../headers/WorkspaceHeader";
import { selectConfig } from "../../store/configSlice";
import { useSelector } from "react-redux";
import WorkspaceDrawer from "../drawers/WorkspaceDrawer";
import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { selectUser } from "../../store/userSlice";
import { setLastWorkspaceSlug } from "../../utils/lastWorkspace";
import { DRAWER_WIDTH, COLLAPSED_DRAWER_WIDTH } from "../../constants/layout";

export const WorkspaceDrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: "flex-end",
}));

function WorkspaceLayout() {
	const { drawerOpen } = useSelector(selectConfig);
	const { data: user } = useSelector(selectUser);
	const { workspaceSlug } = useParams();

	useEffect(() => {
		if (user?.id && workspaceSlug) {
			setLastWorkspaceSlug(user.id, workspaceSlug);
		}
	}, [user?.id, workspaceSlug]);

	return (
		<Stack gap={0}>
			<WorkspaceHeader />
			<Stack direction="row">
				<WorkspaceDrawer open={drawerOpen} />
				<Box
					flexGrow={1}
					maxWidth={`calc(100% - ${drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)`}
					px={2}
				>
					<WorkspaceDrawerHeader />
					<Box mx="auto" maxWidth={1440} width="100%">
						<Outlet />
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
}

export default WorkspaceLayout;
