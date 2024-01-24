import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DocumentHeader from "../headers/DocumentHeader";

function DocumentLayout() {
	return (
		<Box sx={{ flexGrow: 1 }} height="100vh">
			<DocumentHeader />
			<Outlet />
		</Box>
	);
}

export default DocumentLayout;
