import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import SettingHeader from "../headers/SettingHeader";

function SettingLayout() {
	return (
		<Box sx={{ display: "flex" }}>
			<SettingHeader />
			<Outlet />
		</Box>
	);
}

export default SettingLayout;
