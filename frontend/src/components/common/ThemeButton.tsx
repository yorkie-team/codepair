import { IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDispatch } from "react-redux";
import { setTheme } from "../../store/configSlice";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";

function ThemeButton() {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();

	const handleChangeTheme = () => {
		dispatch(setTheme(themeMode == "light" ? "dark" : "light"));
	};

	return (
		<IconButton onClick={handleChangeTheme} color="inherit">
			{themeMode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
		</IconButton>
	);
}

export default ThemeButton;
