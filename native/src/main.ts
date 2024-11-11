import { app, BrowserWindow } from "electron";

function createWindow() {
  try {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    if (process.env.NODE_ENV === "development") {
      win.loadURL("http://localhost:5173").catch((err) => {
        console.error("Failed to load dev server:", err);
      });
    } else {
      win
        .loadURL("https://codepair.yorkie.dev", {
          httpHeaders: {
            "Content-Security-Policy":
              "default-src 'self' https://codepair.yorkie.dev",
          },
        })
        .catch((err) => {
          console.error("Failed to load production URL:", err);
        });
    }
  } catch (error) {
    console.error("Error creating the browser window:", error);
    app.quit();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
