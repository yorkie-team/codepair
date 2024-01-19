import {
	Avatar,
	Box,
	Divider,
	Drawer,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/userSlice";

const DRAWER_WIDTH = 240;

function WorkspaceDrawer() {
	const userStore = useSelector(selectUser);

	return (
		<Drawer
			sx={{
				width: DRAWER_WIDTH,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: DRAWER_WIDTH,
					boxSizing: "border-box",
				},
			}}
			variant="persistent"
			anchor="left"
			open
		>
			<Box sx={{ mt: "auto" }}>
				<Divider />
				<ListItem disablePadding>
					<ListItemButton>
						<ListItemAvatar>
							<Avatar>{userStore.data?.nickname.charAt(0)}</Avatar>
						</ListItemAvatar>
						<ListItemText primary={userStore.data?.nickname} />
					</ListItemButton>
				</ListItem>
			</Box>
		</Drawer>
	);
}

export default WorkspaceDrawer;
