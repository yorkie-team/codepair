import { default as dotenv } from "dotenv";
import { app, BrowserWindow } from "electron";

dotenv.config({
	path: process.env.NODE_ENV === "development" ? ".env.development" : ".env.production",
});

async function createWindow() {
	try {
		const win = new BrowserWindow({ maximizable: true });
		win.maximize();
		const serviceUrl = process.env.DESKTOP_CODEPAIR_URL as string;

		await win.loadURL(serviceUrl);
	} catch (error) {
		console.error("Error creating the browser window:", error);
		app.quit();
	}
}

app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// Open a window if none are open (macOS)
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
