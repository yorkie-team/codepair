import { app, BrowserWindow } from "electron";

function createWindow() {
  try {
    const win = new BrowserWindow({ maximizable: true });

    if (process.env.NODE_ENV === "development") {
      const devServerURL =
        process.env.DESKTOP_YORKIE_DEVELOPMENT_URL || "http://localhost:5173";
      win.loadURL(devServerURL).catch((err) => {
        console.error("Failed to load dev server:", err);
      });
    } else {
      const productionURL =
        process.env.DESKTOP_YORKIE_PRODUCTION_URL ||
        "https://codepair.yorkie.dev";
      win.loadURL(productionURL).catch((err) => {
        console.error("Failed to load production URL:", err);
      });
    }
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
