/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { ChildProcessWithoutNullStreams } from 'node:child_process';
import * as childProcess from 'child_process';
import { WebSocket } from 'ws';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { PlayerInfo } from '../renderer/PlayerInfo';

const SteamApi = require('steam-web');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tf2rconChild: ChildProcessWithoutNullStreams | null = null;
let tf2rconWs: WebSocket | null = null;
let shouldRestartTF2Rcon = false; // %TODO, make it true
let currentPlayerCollection: PlayerInfo[] = [];
let steamUpdateTimer: NodeJS.Timeout | null = null;
let steamUpdatePlayerList: string[] = [];

const currentSteamInformation: PlayerInfo[] = [];

// Signal handler.
function handleExit(): void {
  console.log(`[main.ts] Received signal. Exiting application.`);
  shouldRestartTF2Rcon = false;

  if (tf2rconChild) {
    tf2rconChild.kill('SIGTERM');
  }

  // Safely exit the Electron application
  app.quit();
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(`[main.ts] ${msgTemplate(arg)}`);
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const sendPlayerData = () => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('player-data', currentPlayerCollection);
  });
};

// updateSteamInfoForPlayers updates steam info to current player-list
const updateSteamInfoForPlayers = (
  steam: typeof SteamApi,
  playerSteamIds: string[],
) => {
  console.log(`updateSteamInfoForPlayer() for: ${playerSteamIds.join(', ')}`);

  steam.getPlayerSummaries({
    steamids: playerSteamIds,
    callback: (err: any, data: any) => {
      if (data && typeof data.response === 'object') {
        data.response.players.forEach((steamPlayer: any) => {
          currentPlayerCollection.forEach((player) => {
            if (player.SteamID === steamPlayer.steamid) {
              player.SteamDataLoaded = 'COMPLETED';
              player.SteamURL = steamPlayer.profileurl;
              player.SteamAvatarSmall = steamPlayer.avatar;
              player.SteamAvatarMedium = steamPlayer.avatarmedium;
              player.SteamAvatarFull = steamPlayer.avatarfull;
              player.SteamVisible = steamPlayer.communityvisibilitystate;
              player.SteamConfigured = steamPlayer.profilestate;
              player.SteamCreatedTimestamp = steamPlayer.timecreated;
              player.SteamCountryCode = steamPlayer.loccountrycode;
              console.log(
                `Updated '${player.SteamID}': ${JSON.stringify(player)}`,
              );
              currentSteamInformation.push(player);
            }
          });
        });
      }
    },
  });
};

// updateSteamInfo updates steam info to current player-list
const updateSteamInfo = () => {
  // Enrich current players with steam-cache-data if available.
  currentPlayerCollection.forEach((player) => {
    currentSteamInformation.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamDataLoaded = 'COMPLETED';
        player.SteamURL = steamPlayer.SteamURL;
        player.SteamAvatarSmall = steamPlayer.SteamAvatarSmall;
        player.SteamAvatarMedium = steamPlayer.SteamAvatarMedium;
        player.SteamAvatarFull = steamPlayer.SteamAvatarFull;
        player.SteamVisible = steamPlayer.SteamVisible;
        player.SteamConfigured = steamPlayer.SteamConfigured;
        player.SteamCreatedTimestamp = steamPlayer.SteamCreatedTimestamp;
        player.SteamCountryCode = steamPlayer.SteamCountryCode;
        console.log(
          `Updated '${player.SteamID}' with cached data: ${JSON.stringify(player)}`,
        );
      }
    });
  });

  // Check if there are currently any players.
  currentPlayerCollection.forEach((player) => {
    if (
      typeof player.SteamURL === 'undefined' &&
      typeof player.SteamDataLoaded === 'undefined'
    ) {
      // Check if the SteamID is not already in the list
      if (!steamUpdatePlayerList.includes(player.SteamID)) {
        steamUpdatePlayerList.push(player.SteamID);
      }
      player.SteamDataLoaded = 'IN_PROGRESS';
    }
  });
};

// Establish connection to tf2-rcon websocket.
const connectTf2rconWebsocket = () => {
  tf2rconWs = new WebSocket('ws://127.0.0.1:27689/websocket');

  if (tf2rconWs !== null) {
    tf2rconWs.on('open', function open() {
      // const jsonPayload = JSON.stringify({ key: 'value' }); // Replace with your JSON payload
      // tf2rconWs.send(jsonPayload);
      // console.log('Sent message:', jsonPayload);
    });

    tf2rconWs.on('message', function incoming(data) {
      // console.log(`[main.ts] Received: ${String(data)}`);
      const incommingJson = JSON.parse(String(data));

      if (incommingJson.type === 'player-update') {
        const playerJson = JSON.stringify(incommingJson['current-players']);
        currentPlayerCollection = JSON.parse(playerJson);

        updateSteamInfo();
        sendPlayerData();
      } else {
        console.log(
          `[main.ts] Discarding unconfigured type ${incommingJson.type}!`,
        );
      }

      // const playerCollection: PlayerInfo[] = JSON.parse(incommingJson);
    });

    tf2rconWs.on('close', function close() {
      console.log('[main.ts] Connection closed. Trying to reconnect...');
      setTimeout(connectTf2rconWebsocket, 1000); // Reconnect every 1 second
    });

    tf2rconWs.on('error', function error(err) {
      console.error('[main.ts] WebSocket error:', err.message);
      if (tf2rconWs !== null) {
        tf2rconWs.close(); // Trigger the close event, which handles the retry
      }
    });
  }
};

// start TF2-Rcon-Subprocess
const startTF2Rcon = () => {
  tf2rconChild = childProcess.spawn(
    'cmd /c "cd D:\\\\git\\\\TF2-RCON-MISC && .\\\\runDev.bat"',
    [''],
    {
      shell: true,
    },
  );

  // You can also use a variable to save the output for when the script closes later
  tf2rconChild.on('error', (error) => {
    console.log(`[main.ts][TF2RCON] ERROR: ${error}`);
  });

  tf2rconChild.stdout.setEncoding('utf8');
  tf2rconChild.stdout.on('data', (data) => {
    console.log(`[main.ts][TF2RCON][STDOUT]: ${data}`);
  });

  tf2rconChild.stderr.setEncoding('utf8');
  tf2rconChild.stderr.on('data', (data) => {
    // Here is the output from the command
    console.log(`[main.ts][TF2RCON][STDERR]: ${data}`);
  });

  tf2rconChild.on('close', (code) => {
    console.log(`[main.ts][TF2RCON] CLOSE: ${code}`);
  });

  tf2rconChild.on('exit', (code, signal) => {
    console.log(
      `[main.ts][TF2RCON] Child process exited with code ${code} and signal ${signal}`,
    );

    if (shouldRestartTF2Rcon) {
      startTF2Rcon();
    }
  });
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const startSteamUpdater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-data.');
    return;
  }

  // Regularly update steam-data.
  steamUpdateTimer = setInterval(() => {
    console.log('[main.ts] Updating steam data...');
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    updateSteamInfoForPlayers(steam, steamUpdatePlayerList);
    steamUpdatePlayerList = [];
    console.log('[main.ts] Updating steam data... DONE');
  }, 10000);
};

app
  .whenReady()
  .then(() => {
    process.on('SIGTERM', handleExit);
    process.on('SIGHUP', handleExit);
    process.on('SIGQUIT', handleExit);
    process.on('SIGINT', handleExit);

    // Start tf2-rcon-backend.
    startTF2Rcon();
    createWindow();
    connectTf2rconWebsocket();
    startSteamUpdater();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });

    app.on('before-quit', () => {
      shouldRestartTF2Rcon = false;

      if (tf2rconWs !== null && tf2rconWs.readyState !== WebSocket.CLOSED) {
        const jsonPayload = JSON.stringify({ type: 'exit' });
        tf2rconWs.send(jsonPayload);
      }

      if (tf2rconChild && !tf2rconChild.killed) {
        console.log('[main.ts] Terminating tf2rcon-child process...');
        tf2rconChild.kill('SIGINT');

        // Wait for 5 seconds before sending SIGKILL
        setTimeout(() => {
          if (tf2rconChild && !tf2rconChild.killed) {
            console.log('[main.ts] Forcefully terminating child process...');
            tf2rconChild.kill('SIGKILL');
          }
        }, 5000);
      }

      if (steamUpdateTimer) {
        clearInterval(steamUpdateTimer);
        steamUpdateTimer = null;
      }
    });
  })
  .catch(console.log);
