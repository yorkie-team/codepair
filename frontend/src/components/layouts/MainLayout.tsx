import { Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

function MainLayout() {
	return (
		<Stack sx={{ flexGrow: 1, height: "100vh" }}>
			<Outlet />
		</Stack>
	);
}

export default MainLayout;
