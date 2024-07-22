import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import WorkspaceHeader from "../headers/WorkspaceHeader";
import WorkspaceDrawer from "../drawers/WorkspaceDrawer";
import { useDispatch, useSelector } from "react-redux";
import { selectConfig, setDrawerOpen } from "../../store/configSlice";
import { DRAWER_WIDTH } from "../../constants/layout";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
	open?: boolean;
}>(({ theme, open }) => ({
	flexGrow: 1,
	paddingLeft: theme.spacing(3),
	paddingRight: theme.spacing(3),
	paddingTop: theme.spacing(3),
	transition: theme.transitions.create("margin", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	marginLeft: `-${DRAWER_WIDTH}px`,
	...(open && {
		transition: theme.transitions.create("margin", {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	}),
}));

export const WorkspaceDrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: "flex-end",
}));

function WorkspaceLayout() {
	const { drawerOpen } = useSelector(selectConfig);
	const dispatch = useDispatch();

	const handleDrawerOpen = () => {
		dispatch(setDrawerOpen(!drawerOpen));
	};

	return (
		<Box sx={{ display: "flex" }}>
			<WorkspaceHeader open={drawerOpen} onDrawerOpen={handleDrawerOpen} />
			<WorkspaceDrawer open={drawerOpen} />
			<Main open={drawerOpen}>
				<WorkspaceDrawerHeader />
				<Outlet />
			</Main>
		</Box>
	);
}

export default WorkspaceLayout;
