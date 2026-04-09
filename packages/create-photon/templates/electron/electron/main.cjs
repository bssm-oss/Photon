const { app, BrowserWindow } = require("electron");
const path = require("path");

let win;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "Photon",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, "..", "dist-renderer", "index.html"));
  win.webContents.openDevTools();
});

app.on("window-all-closed", () => app.quit());