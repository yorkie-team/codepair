import {
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuList,
	Popover,
	PopoverProps,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectConfig, setDisableScrollSync, setTheme, ThemeType } from "../../store/configSlice";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

function DocumentPopover(props: PopoverProps) {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();
	const configStore = useSelector(selectConfig);

	const handleChangeTheme = () => {
		dispatch(setTheme(themeMode === ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT));
	};

	const handleScrollSyncChange = () => {
		dispatch(setDisableScrollSync(!configStore.disableScrollSync));
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
				<MenuItem onClick={handleScrollSyncChange}>
					<ListItemIcon>
						{configStore.disableScrollSync ? (
							<ToggleOffIcon />
						) : (
							<ToggleOnIcon color="primary" />
						)}
					</ListItemIcon>
					<ListItemText>Panel Scroll Sync</ListItemText>
				</MenuItem>
			</MenuList>
		</Popover>
	);
}

export default DocumentPopover;
