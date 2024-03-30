import { Stack } from "yorkie-ui";
import { Outlet } from "react-router-dom";
import MainHeader from "../headers/MainHeader";

function MainLayout() {
	return (
		<Stack flexGrow="1" style={{ height: "100vh" }}>
			<MainHeader />
			<Outlet />
		</Stack>
	);
}

export default MainLayout;
