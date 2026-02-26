import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { logout } from "../../features/auth";
import { setTheme, ThemeType } from "../../features/settings";
import { selectUser, setUserData } from "../../features/user";
import { clearLastWorkspaceSlug } from "../../features/workspace/utils/lastWorkspace";

function ProfilePopover(props: PopoverProps) {
	const dispatch = useDispatch();
	const userStore = useSelector(selectUser);
	const themeMode = useCurrentTheme();
	const navigate = useNavigate();

	const handleLogout = () => {
		clearLastWorkspaceSlug(userStore.data?.id);
		dispatch(logout());
		dispatch(setUserData(null));
	};

	const handleMoveProfilePage = () => {
		navigate(`/settings/profile`);
	};

	const handleChangeTheme = () => {
		dispatch(setTheme(themeMode === ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT));
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
				<MenuItem onClick={handleMoveProfilePage}>
					<ListItemIcon>
						<ManageAccountsIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Profile</ListItemText>
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
