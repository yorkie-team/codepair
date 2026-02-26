import { SnackbarProvider } from "notistack";
import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import "./index.css";
import { persistor, store } from "./store/store";

const trackingCode = `${import.meta.env.VITE_APP_GOOGLE_ANALYTICS}`;
if (trackingCode) {
	ReactGA.initialize(trackingCode);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<SnackbarProvider maxSnack={3}>
					<App />
				</SnackbarProvider>
			</PersistGate>
		</Provider>
	</React.StrictMode>
);
