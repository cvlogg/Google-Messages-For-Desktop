# Google Messages for Desktop

![Google Messages Home Page](https://i.imgur.com/OVKBkNY.png)

A "native-like" desktop app for [Google Messages](https://messages.google.com/web), built with [Electron](https://github.com/electron/electron).

**The Mac, Windows, and Linux apps can be downloaded from the [latest release](https://github.com/cvlogg/Google-Messages-For-Desktop/releases).**

## Purpose
The purpose of this project is to build dedicated native-like desktop apps for Google Messages and leverage your OS's built in notification system.

This desktop app and project is not an official product of Google and is not affiliated with Google in any way.

## Features
- Cross-platform support (Mac, Windows, Linux)
- Native OS notifications
- Single instance lock (only one window at a time)
- System tray support (Windows/Linux)
- External links open in your default browser

## Development

Requires Node.js v18+ and npm.

### Running locally
```bash
npm install
npm start
```

To run with system tray support:
```bash
npm run start:tray
```

### Building

| Command | Description |
|---|---|
| `npm run build:mac` | Build the Mac app |
| `npm run build:windows` | Build the Windows app |
| `npm run build:linux` | Build the Linux app |
| `npm run build:all` | Build for all platforms |

## Windows

### Notifications
To receive notifications on Windows, you'll need to do the following:

1. Add a shortcut of this app to the Start Menu folder
2. In the "Windows Settings" app, check if the setting for "Show notifications in action center" is on (it might be off by default)

### System Tray
The app can run in the system tray on Windows. When you close the app, it will still exist in the system tray and run in the background. To enable this, run the app with the `--tray` flag or download the tray-enabled build from the releases.

## Ubuntu Shortcut
To create a shortcut for the Ubuntu launcher:

1. Create and open the shortcut file
```bash
nano ~/.local/share/applications/Google-Messages.desktop
```

2. Copy and paste the following entry inside the file:

```ini
[Desktop Entry]
Version=2.0.0
Name=Google Messages
Comment=Send and receive messages from your Android Phone
Keywords=Message;Messaging;Android;SMS
Exec=/path/to/Google Messages.AppImage
Icon=/path/to/icon.png
Terminal=false
Type=Application
Categories=Internet;Application;
```

Be sure to replace the paths with your actual installation paths.

## License
MIT
