const { app, BrowserWindow, Menu, Tray, shell, nativeImage, session, ipcMain, Notification } = require("electron");
const path = require("path");

const MESSAGES_URL = "https://messages.google.com/web";
const APP_ID = "com.googlemessages.desktop";

app.setAppUserModelId(APP_ID);

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;
  let tray = null;
  const isMac = process.platform === "darwin";
  const isWindows = process.platform === "win32";
  const enableTray = isWindows || process.argv.includes("--tray");

  function getIconPath() {
    const ext = isWindows ? "ico" : "png";
    if (app.isPackaged) {
      return path.join(process.resourcesPath, `icon.${ext}`);
    }
    return path.join(__dirname, "icons", `icon.${ext}`);
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
        contextIsolation: false,
        nodeIntegration: false,
      },
    });

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowed = ["notifications", "media", "mediaKeySystem", "clipboard-read", "clipboard-sanitized-write"];
      callback(allowed.includes(permission));
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      const allowed = ["notifications", "media", "mediaKeySystem", "clipboard-read", "clipboard-sanitized-write"];
      return allowed.includes(permission);
    });

    ipcMain.on("show-notification", (event, data) => {
      const notif = new Notification({
        title: data.title,
        body: data.body,
        icon: getIconPath(),
      });
      notif.on("click", () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
      notif.show();
    });

    mainWindow.loadURL(MESSAGES_URL);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    mainWindow.webContents.on("page-title-updated", (event, title) => {
      if (mainWindow && !mainWindow.isFocused() && title !== mainWindow.getTitle()) {
        mainWindow.flashFrame(true);
      }
    });

    mainWindow.on("focus", () => {
      mainWindow.flashFrame(false);
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
