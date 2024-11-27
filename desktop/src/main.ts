import { app, BrowserWindow, dialog } from "electron";

async function createWindow() {
	try {
		const win = new BrowserWindow({ maximizable: true });
		win.maximize();
		// In the future, migrate to a proper build tool and environment variable management.
		const serviceUrl = "https://codepair.yorkie.dev";

		await win.loadURL(serviceUrl);
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error creating the browser window:", error.message);

			dialog.showErrorBox(
				"Application Error",
				`Failed to start application: ${error.message}\n\nThe application will now quit.`
			);

			app.quit();
		}
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
