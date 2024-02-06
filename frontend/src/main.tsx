import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { SnackbarProvider } from "notistack";
import ReactGA from "react-ga4";

const trackingCode = `${import.meta.env.VITE_APP_GOOGLE_ANALYTICS}`;
if (trackingCode) {
	ReactGA.initialize(trackingCode);
}

const persistor = persistStore(store);

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
