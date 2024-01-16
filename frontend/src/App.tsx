import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import EditorLayout from "./components/layouts/EditorLayout";
import EditorIndex from "./pages/editor/Index";
import { useEffect, useMemo } from "react";
import { selectConfig } from "./store/configSlice";
import { createClient } from "@supabase/supabase-js";
import { setClient } from "./store/supabaseSlice";

const router = createBrowserRouter([
	{
		path: "/",
		element: <EditorLayout />,
		children: [
			{
				path: ":documentId",
				element: <EditorIndex />,
			},
		],
	},
]);

function App() {
	const dispatch = useDispatch();
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

	useEffect(() => {
		const supabase = createClient(
			import.meta.env.VITE_SUPABASE_URL,
			import.meta.env.VITE_SUPABASE_ANON
		);

		dispatch(setClient(supabase));

		return () => {
			dispatch(setClient(null));
		};
	}, [dispatch]);

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
