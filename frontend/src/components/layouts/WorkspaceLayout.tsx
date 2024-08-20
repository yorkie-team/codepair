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
		<Box sx={{ display: "flex" }}>
			<WorkspaceHeader />
			<Stack direction="row" sx={{ width: "100%" }}>
				<WorkspaceDrawer open={drawerOpen} />
				<Box flexGrow={1} padding={3}>
					<WorkspaceDrawerHeader />
					<Outlet />
				</Box>
			</Stack>
		</Box>
	);
}

export default WorkspaceLayout;
