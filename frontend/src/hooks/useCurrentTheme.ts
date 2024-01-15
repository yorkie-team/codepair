import { useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import { selectConfig } from "../store/configSlice";

export function useCurrentTheme() {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const config = useSelector(selectConfig);
	const themeMode = useMemo(() => {
		const defaultTheme = prefersDarkMode ? "dark" : "light";

		return config.theme === "default" ? defaultTheme : config.theme;
	}, [config.theme, prefersDarkMode]);

	return themeMode;
}
