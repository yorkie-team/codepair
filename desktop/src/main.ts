
import { config } from "dotenv";
import { app, BrowserWindow } from "electron";
config();


async function createWindow() {
	try {
		const win = new BrowserWindow({ maximizable: true });
		win.maximize();
		// In the future, migrate to a proper build tool and environment variable management.
		const serviceUrl = "https://codepair.yorkie.dev";

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
