import { app, BrowserWindow, dialog } from "electron";
import { join } from "path";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const is = {
  dev: !app.isPackaged
};
({
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
});
const createWindow = async () => {
  try {
    const win = new BrowserWindow({
      show: false,
      maximizable: true,
      webPreferences: {
        preload: join(__dirname, "../preload/index.js"),
        sandbox: false
      }
    });
    win.maximize();
    win.show();
    const serviceUrl = is.dev ? "http://localhost:5173" : "https://codepair.yorkie.dev";
    await win.loadURL(serviceUrl);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating the browser window:", error.message);
      dialog.showErrorBox(
        "Application Error",
        `Failed to start application: ${error.message}

The application will now quit.`
      );
      app.quit();
    }
  }
};
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", function() {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
