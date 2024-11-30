import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import WorkspaceHeader from "../headers/WorkspaceHeader";
import { selectConfig } from "../../store/configSlice";
import { useSelector } from "react-redux";
import WorkspaceDrawer from "../drawers/WorkspaceDrawer";
import { Stack } from "@mui/material";

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

	return (
		<Stack gap={0}>
			<WorkspaceHeader />
			<Stack direction="row">
				<WorkspaceDrawer open={drawerOpen} />
				<Box flexGrow={1} maxWidth="100%" px={2}>
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
