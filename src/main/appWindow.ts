import { app, BrowserWindow, screen } from 'electron';
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
  const externalDisplay = displays.find((display) => {
    return (
      display.id === 1402268924 && // %TODO, make configurable
      (display.bounds.x !== 0 || display.bounds.y !== 0)
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

  // Load the index.html of the app window.
  appWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);

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

  return appWindow;
}
