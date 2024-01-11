import {
	AppBar,
	Box,
	IconButton,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Toolbar,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

function EditorLayout() {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<Stack direction="row" spacing={1}>
						<ToggleButtonGroup
							// value={alignment}
							exclusive
							// onChange={handleAlignment}
							size="small"
							sx={{
								backgroundColor: "white",
							}}
						>
							<ToggleButton value="edit" aria-label="edit">
								<EditIcon />
							</ToggleButton>
							<ToggleButton value="both" aria-label="both">
								<VerticalSplitIcon />
							</ToggleButton>
							<ToggleButton value="view" aria-label="view">
								<VisibilityIcon />
							</ToggleButton>
						</ToggleButtonGroup>
						<IconButton color="inherit">
							<AddIcon />
						</IconButton>
					</Stack>
				</Toolbar>
			</AppBar>
			<Outlet />
		</Box>
	);
}

export default EditorLayout;
