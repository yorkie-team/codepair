import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton } from "@mui/material";
import { useDispatch } from "react-redux";
import { useCurrentTheme } from "../../hooks/useCurrentTheme";
import { setTheme, ThemeType } from "../../store/configSlice";

function ThemeButton() {
	const dispatch = useDispatch();
	const themeMode = useCurrentTheme();

	const handleChangeTheme = () => {
		dispatch(setTheme(themeMode == ThemeType.LIGHT ? ThemeType.DARK : ThemeType.LIGHT));
	};

	return (
		<IconButton onClick={handleChangeTheme} color="inherit">
			{themeMode === ThemeType.LIGHT ? <LightModeIcon /> : <DarkModeIcon />}
		</IconButton>
	);
}

export default ThemeButton;
