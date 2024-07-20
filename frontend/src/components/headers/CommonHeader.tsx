import { styled } from "@mui/material";
import AppBar, { AppBarProps } from "@mui/material/AppBar";
import { DRAWER_WIDTH } from "../layouts/WorkspaceLayout";

interface CommonAppBarProps extends AppBarProps {
	open?: boolean;
}

export const CommonAppBar = styled(AppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})<CommonAppBarProps>(({ theme, open }) => ({
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