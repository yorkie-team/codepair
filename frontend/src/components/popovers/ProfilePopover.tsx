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

function ProfilePopover(props: PopoverProps) {
	const dispatch = useDispatch();

	const handleLogout = () => {
		dispatch(setAccessToken(null));
		dispatch(setUserData(null));
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
