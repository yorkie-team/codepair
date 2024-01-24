import { Stack } from "@mui/material";
import { Outlet } from "react-router-dom";
import MainHeader from "../headers/MainHeader";

function MainLayout() {
	return (
		<Stack sx={{ flexGrow: 1, height: "100vh" }}>
			<MainHeader />
			<Outlet />
		</Stack>
	);
}

export default MainLayout;
