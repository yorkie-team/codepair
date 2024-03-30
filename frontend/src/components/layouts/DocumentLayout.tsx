import { Box } from "yorkie-ui";
import { Outlet } from "react-router-dom";
import DocumentHeader from "../headers/DocumentHeader";

function DocumentLayout() {
	return (
		<Box style={{ height: "100vh" }} flexGrow="1">
			<DocumentHeader />
			<Outlet />
		</Box>
	);
}

export default DocumentLayout;
