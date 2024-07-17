import {
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useDispatch } from "react-redux";
import { setAccessToken } from "../../store/authSlice";
import { setUserData } from "../../store/userSlice";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { setTheme } from "../../store/configSlice";
import { useNavigate, useParams } from "react-router-dom";

function ProfilePopover(props: PopoverProps) {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const navigate = useNavigate();
	const params = useParams();

	const handleLogout = () => {
		dispatch(setAccessToken(null));
		dispatch(setUserData(null));
	};

	const handleMoveProfilePage = () => {
		navigate(`/${params.workspaceSlug}/profile`);
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
