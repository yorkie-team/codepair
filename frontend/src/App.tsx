import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import * as Sentry from "@sentry/react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	RouterProvider,
	createBrowserRouter,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";
import "./App.css";
import { useGetSettingsQuery } from "./hooks/api/settings";
import { useErrorHandler } from "./hooks/useErrorHandler";
import AuthProvider from "./providers/AuthProvider";
import { routes } from "./routes";
import { setAccessToken, setRefreshToken } from "./store/authSlice";
import { selectConfig } from "./store/configSlice";
import { store } from "./store/store";
import { setUserData } from "./store/userSlice";
import { isAxios404Error, isAxios500Error } from "./utils/axios.default";

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

axios.interceptors.response.use(
    res => {
		console.log("inspector test: " + res.data.json);
		return res;
	},
    async error => {
		const state = store.getState();
		const dispatch = useDispatch();
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = state.auth.refreshToken;
            const response = await axios.post('/auth/refresh', { refreshToken });

            if (response.status === 200) {
                const newAccessToken = response.data.accessToken;
				dispatch(setAccessToken(newAccessToken));

                axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axios(originalRequest);
            } else {
				dispatch(setAccessToken(null));
				dispatch(setRefreshToken(null));
				dispatch(setUserData(null));
			}
        }

        return Promise.reject(error);
    }
);


axios.defaults.baseURL = import.meta.env.VITE_API_ADDR;

function SettingLoader() {
	useGetSettingsQuery();
	return null;
}

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
				onError: (error) => {
					if (isAxios404Error(error)) {
						window.location.href = "/404";
					} else if (isAxios500Error(error)) {
						window.location.href = "/404";
					} else {
						handleError(error);
					}
				},
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
					<SettingLoader />
					<Box minHeight="100vh">
						<RouterProvider router={router} />
					</Box>
				</ThemeProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default App;
