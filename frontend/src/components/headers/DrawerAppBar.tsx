import { styled } from "@mui/material";
import AppBar, { AppBarProps } from "@mui/material/AppBar";
import { DRAWER_WIDTH } from "../../constants/layout";

interface DrawerAppBarProps extends AppBarProps {
	open?: boolean;
}

export const DrawerAppBar = styled(AppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})<DrawerAppBarProps>(({ theme, open }) => ({
	transition: theme.transitions.create(["margin", "width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${DRAWER_WIDTH}px)`,
		marginLeft: `${DRAWER_WIDTH}px`,
		transition: theme.transitions.create(["margin", "width"], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));
