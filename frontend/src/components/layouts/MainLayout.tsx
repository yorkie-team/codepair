import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import MainHeader from "../headers/MainHeader";

function MainLayout() {
	return (
		<Box sx={{ flexGrow: 1 }} height="100vh">
			<MainHeader />
			<Outlet />
		</Box>
	);
}

export default MainLayout;
