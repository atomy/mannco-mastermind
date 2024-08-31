import { app, BrowserWindow, screen, shell } from 'electron';
import path from 'path';
import { registerTitlebarIpc } from '@main/window/titlebarIpc';

// Electron Forge automatically creates these entry points
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let appWindow: BrowserWindow;

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
  registerTitlebarIpc(appWindow);
}

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export function createAppWindow(): BrowserWindow {
  const displays = screen.getAllDisplays();
  // Criteria to find the external display based on bounds
  const targetBounds = { x: -247, y: -1086, width: 1920, height: 1080 };
  const externalDisplay = displays.find((display) => {
    // %TODO, make configurable
    const { bounds } = display;
    return (
      bounds.x === targetBounds.x &&
      bounds.y === targetBounds.y &&
      bounds.width === targetBounds.width &&
      bounds.height === targetBounds.height
    );
  });

  if (externalDisplay) {
    // Create a new window instance with all options, including external display position
    appWindow = new BrowserWindow({
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50,
      width: 800,
      height: 600,
      backgroundColor: '#202020',
      show: false,
      autoHideMenuBar: true,
      frame: false,
      titleBarStyle: 'hidden',
      icon: path.resolve('assets/images/appIcon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
        preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
        sandbox: false,
      },
    });
  } else {
    // Create a new window instance without specifying external display position
    appWindow = new BrowserWindow({
      width: 800,
      height: 600,
      backgroundColor: '#202020',
      show: false,
      autoHideMenuBar: true,
      frame: false,
      titleBarStyle: 'hidden',
      icon: path.resolve('assets/images/appIcon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
        preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
        sandbox: false,
      },
    });
  }

  // Create new window instance with the combined options
  appWindow.maximize();

  // Set Content Security Policy
  appWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; connect-src 'self' https://firebaseinstallations.googleapis.com https://firebaseremoteconfig.googleapis.com https://firestore.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.firebaseio.com; img-src 'self' data: https: https://upload.wikimedia.org; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          ],
        },
      });
    },
  );

  // Load the index.html of the app window.
  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);

  // Intercept new-window events (links with target="_blank")
  appWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' }; // Prevent Electron from handling it
  });

  // Show window when its ready to
  appWindow.on('ready-to-show', () => appWindow.show());

  appWindow.on('show', () => {
    setTimeout(() => {
      appWindow.focus();
    }, 500);
  });

  // Register Inter Process Communication for main process
  registerMainIPC();

  // Close all windows when main window is closed
  appWindow.on('close', () => {
    appWindow = null;
    app.quit();
  });

  if (
    process.env.AUTO_OPEN_DEVTOOLS &&
    process.env.AUTO_OPEN_DEVTOOLS === '1'
  ) {
    appWindow.webContents.openDevTools();
  }

  return appWindow;
}
