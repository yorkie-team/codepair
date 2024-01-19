import { Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

function MainLayout() {
	return (
		<Stack sx={{ flexGrow: 1 }} gap={3}>
			<Outlet />
		</Stack>
	);
}

export default MainLayout;
