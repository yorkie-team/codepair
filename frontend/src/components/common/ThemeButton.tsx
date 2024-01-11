import { IconButton, useMediaQuery } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDispatch, useSelector } from "react-redux";
import { selectConfig, setTheme } from "../../store/configSlice";
import { useMemo } from "react";

function ThemeButton() {
	const dispatch = useDispatch();
	const config = useSelector(selectConfig);
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const themeMode = useMemo(() => {
		const defaultTheme = prefersDarkMode ? "dark" : "light";

		return config.theme === "default" ? defaultTheme : config.theme;
	}, [config.theme, prefersDarkMode]);

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
