const { app, BrowserWindow, Menu, Tray, shell, nativeImage } = require("electron");
const path = require("path");

const MESSAGES_URL = "https://messages.google.com/web";
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;
  let tray = null;
  const isMac = process.platform === "darwin";
  const isWindows = process.platform === "win32";
  const enableTray = process.argv.includes("--tray");

  function getIconPath() {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, "icon.png");
    }
    return path.join(__dirname, "icons", "icon.png");
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1100,
      height: 800,
      icon: getIconPath(),
      title: "Google Messages",
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    mainWindow.loadURL(MESSAGES_URL);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    if (enableTray && (isWindows || !isMac)) {
      mainWindow.on("close", (event) => {
        if (!app.isQuitting) {
          event.preventDefault();
          mainWindow.hide();
        }
      });
    }
  }

  function createTray() {
    const icon = nativeImage.createFromPath(getIconPath());
    tray = new Tray(icon.resize({ width: 16, height: 16 }));
    tray.setToolTip("Google Messages");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on("double-click", () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }

  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    if (enableTray) createTray();

    app.on("activate", () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (!isMac || !enableTray) {
      app.quit();
    }
  });

  app.on("before-quit", () => {
    app.isQuitting = true;
  });
}
