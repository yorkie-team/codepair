import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import EditorHeader from "../headers/EditorHeader";

function EditorLayout() {
	return (
		<Box sx={{ flexGrow: 1 }} height="100vh">
			<EditorHeader />
			<Outlet />
		</Box>
	);
}

export default EditorLayout;
