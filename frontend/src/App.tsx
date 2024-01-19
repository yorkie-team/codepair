import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import EditorLayout from "./components/layouts/EditorLayout";
import EditorIndex from "./pages/editor/Index";
import { useMemo } from "react";
import { selectConfig } from "./store/configSlice";

const router = createBrowserRouter([
	{
		path: ":documentId",
		element: <EditorLayout />,
		children: [
			{
				path: "",
				element: <EditorIndex />,
			},
		],
	},
]);

function App() {
	const config = useSelector(selectConfig);
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const theme = useMemo(() => {
		const defaultMode = prefersDarkMode ? "dark" : "light";

		return createTheme({
			palette: {
				mode: config.theme == "default" ? defaultMode : config.theme,
			},
		});
	}, [config.theme, prefersDarkMode]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box minHeight="100vh">
				<RouterProvider router={router} />
			</Box>
		</ThemeProvider>
	);
}

export default App;
