import {
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useDispatch } from "react-redux";
import { setAccessToken } from "../../store/authSlice";
import { setUserData } from "../../store/userSlice";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { setTheme } from "../../store/configSlice";

function ProfilePopover(props: PopoverProps) {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();

	const handleLogout = () => {
		dispatch(setAccessToken(null));
		dispatch(setUserData(null));
	};

	const handleChangeTheme = () => {
		dispatch(setTheme(themeMode == "light" ? "dark" : "light"));
	};

	return (
		<Popover
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "right",
			}}
			transformOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			{...props}
		>
			<MenuList>
				<MenuItem onClick={handleChangeTheme}>
					<ListItemIcon>
						{themeMode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
					</ListItemIcon>
					<ListItemText>Appearance</ListItemText>
				</MenuItem>
				<MenuItem onClick={handleLogout}>
					<ListItemIcon>
						<LogoutIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Logout</ListItemText>
				</MenuItem>
			</MenuList>
		</Popover>
	);
}

export default ProfilePopover;
