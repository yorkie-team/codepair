import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import {
	RouterProvider,
	createBrowserRouter,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";
import { useEffect, useMemo } from "react";
import { selectConfig } from "./store/configSlice";
import axios from "axios";
import { routes } from "./routes";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./providers/AuthProvider";
import { useErrorHandler } from "./hooks/useErrorHandler";
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
	Sentry.init({
		dsn: `${import.meta.env.VITE_APP_SENTRY_DSN}`,
		release: `codepair@${import.meta.env.PACKAGE_VERSION}`,
		integrations: [
			new Sentry.BrowserTracing({
				routingInstrumentation: Sentry.reactRouterV6Instrumentation(
					useEffect,
					useLocation,
					useNavigationType,
					createRoutesFromChildren,
					matchRoutes
				),
			}),
		],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,
	});
}

const router = createBrowserRouter(routes);

axios.defaults.baseURL = import.meta.env.VITE_API_ADDR;

function App() {
	const config = useSelector(selectConfig);
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const theme = useMemo(() => {
		const defaultMode = prefersDarkMode ? "dark" : "light";

		return createTheme({
			typography: {
				button: {
					textTransform: "none",
				},
			},
			palette: {
				mode: config.theme == "default" ? defaultMode : config.theme,
			},
		});
	}, [config.theme, prefersDarkMode]);
	const handleError = useErrorHandler();
	const queryClient = useMemo(() => {
		return new QueryClient({
			queryCache: new QueryCache({
				onError: handleError,
			}),
			defaultOptions: {
				mutations: {
					onError: handleError,
				},
			},
		});
	}, [handleError]);

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Box minHeight="100vh">
						<RouterProvider router={router} />
					</Box>
				</ThemeProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
