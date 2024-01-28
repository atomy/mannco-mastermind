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
import { SteamGamePlayerstats } from '../renderer/SteamGamePlayerstats';

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
let shouldRestartTF2Rcon = true;
let currentPlayerCollection: PlayerInfo[] = [];
let steamProfileUpdateTimer: NodeJS.Timeout | null = null;
let steamTF2UpdateTimer: NodeJS.Timeout | null = null;
let steamBanUpdateTimer: NodeJS.Timeout | null = null;
let steamProfileUpdatePlayerList: string[] = [];
let steamTF2UpdatePlayerList: string[] = [];
let steamBanUpdatePlayerList: string[] = [];

const currentSteamProfileInformation: PlayerInfo[] = [];
const currentSteamTF2Information: PlayerInfo[] = [];
const currentSteamBanInformation: PlayerInfo[] = [];

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

// updateSteamProfileDataForPlayers updates steam info to current player-list
const updateSteamProfileDataForPlayers = (
  steam: typeof SteamApi,
  playerSteamIds: string[],
) => {
  if (playerSteamIds.length > 0) {
    console.log(
      `updateSteamProfileDataForPlayers() for: ${playerSteamIds.join(', ')}`,
    );
  }

  steam.getPlayerSummaries({
    steamids: playerSteamIds,
    callback: (err: any, data: any) => {
      if (data && typeof data.response === 'object') {
        data.response.players.forEach((steamPlayer: any) => {
          currentPlayerCollection.forEach((player) => {
            if (player.SteamID === steamPlayer.steamid) {
              player.SteamProfileDataLoaded = 'COMPLETED';
              player.SteamURL = steamPlayer.profileurl;
              player.SteamAvatarSmall = steamPlayer.avatar;
              player.SteamAvatarMedium = steamPlayer.avatarmedium;
              player.SteamAvatarFull = steamPlayer.avatarfull;
              player.SteamVisible = steamPlayer.communityvisibilitystate;
              player.SteamConfigured = steamPlayer.profilestate;
              player.SteamCreatedTimestamp = steamPlayer.timecreated;
              player.SteamCountryCode = steamPlayer.loccountrycode;
              // console.log(
              // `Updated '${player.SteamID}': ${JSON.stringify(player)}`,
              // );
              currentSteamProfileInformation.push(player);
            }
          });
        });
      }
    },
  });
};

// updateSteamBanDataForPlayers updates steam info to current player-list
const updateSteamBanDataForPlayers = (
  steam: typeof SteamApi,
  playerSteamIds: string[],
) => {
  // console.log(
  //   `updateSteamBanDataForPlayers()`,
  // );
  if (playerSteamIds.length > 0) {
    //   console.log(
    //     `updateSteamBanDataForPlayers() for: ${playerSteamIds.join(', ')}`,
    //   );

    steam.getPlayerBans({
      steamids: playerSteamIds,
      callback: (err: any, data: any) => {
        if (typeof err !== 'undefined') {
          currentPlayerCollection.forEach((player) => {
            if (playerSteamIds.includes(player.SteamID)) {
              player.SteamBanDataLoaded = 'ERROR';
              console.log(`ERROR '${player.SteamID}': ${err}`);
              currentSteamBanInformation.push(player);
            }
          });
        } else if (data && typeof data.players !== 'undefined') {
          data.players.forEach((steamBanPlayer: any) => {
            currentPlayerCollection.forEach((player) => {
              if (player.SteamID === steamBanPlayer.SteamId) {
                player.SteamBanDataLoaded = 'COMPLETED';
                player.SteamBanCommunityBanned = steamBanPlayer.CommunityBanned;
                player.SteamBanVACBanned = steamBanPlayer.VACBanned;
                player.SteamBanVACBans = steamBanPlayer.NumberOfVACBans;
                player.SteamBanDaysSinceLastBan =
                  steamBanPlayer.DaysSinceLastBan;
                player.SteamBanCommunityBanned = steamBanPlayer.CommunityBanned;
                player.SteamBanNumberOfGameBans =
                  steamBanPlayer.NumberOfGameBans;
                player.SteamBanEconomyBan = steamBanPlayer.EconomyBan;
                console.log(
                  `updateSteamBanDataForPlayers() Updated '${player.SteamID}': ${JSON.stringify(player)}`,
                );
                currentSteamBanInformation.push(player);
              }
            });
          });
        }
      },
    });
  }
};

const parsePlayerstats = (
  player: PlayerInfo,
  playerStats: SteamGamePlayerstats,
) => {
  let totalPlayTime = 0;
  const classes = [
    'Scout',
    'Soldier',
    'Medic',
    'Engineer',
    'Heavy',
    'Sniper',
    'Spy',
    'Pyro',
    'Demoman',
  ];

  playerStats.stats.forEach((stat) => {
    const classMatch = classes.some((className) =>
      stat.name.startsWith(className),
    );
    if (classMatch && stat.name.endsWith('.accum.iPlayTime')) {
      totalPlayTime += stat.value;
    }
  });

  console.log(`SteamID '${player.SteamID}' totalPlayTime: ${totalPlayTime}`);

  player.SteamTF2Playtime = totalPlayTime;

  return player;
};

// updateSteamTF2DataForPlayer updates steam tf2 data to current player-list
const updateSteamTF2DataForPlayer = (
  steam: typeof SteamApi,
  playerSteamId: string,
) => {
  console.log(`updateSteamTF2DataForPlayer() for: ${playerSteamId}`);

  steam.getUserStatsForGame({
    steamid: playerSteamId,
    appid: 440,
    callback: (err: any, data: any) => {
      // console.log(`? ${err} --- ${JSON.stringify(data)}`);
      // HTTP 403 are expected, they happen when that information is private.
      if (typeof err !== 'undefined') {
        currentPlayerCollection.forEach((player) => {
          if (player.SteamID === playerSteamId) {
            const fixedErr = err.replace(
              ' Error: Check your API key is correct',
              '',
            );
            player.SteamTF2DataLoaded = 'ERROR';
            console.log(`ERROR '${player.SteamID}': ${fixedErr}`);
            currentSteamTF2Information.push(player);
          }
        });
      } else if (data && typeof data.playerstats === 'object') {
        const steamPlayerStats = data.playerstats;
        console.log(
          `Incomming tf2-data-update for ${data.playerstats.steamID}`,
        );
        currentPlayerCollection.forEach((player) => {
          if (player.SteamID === playerSteamId) {
            player.SteamTF2DataLoaded = 'COMPLETED';
            console.log(
              `Updated '${player.SteamID}' gameName: ${steamPlayerStats.gameName}`,
            );
            const playtimePlayer = parsePlayerstats(player, steamPlayerStats);
            console.log(
              `SteamID '${player.SteamID}' SteamTF2Playtime: ${playtimePlayer.SteamTF2Playtime}`,
            );
            player.SteamTF2Playtime = playtimePlayer.SteamTF2Playtime;
            currentSteamTF2Information.push(playtimePlayer);
          }
        });
      }
    },
  });
};

// updateSteamInfo updates steam info to current player-list
const updateSteamInfo = () => {
  // Enrich current players with steam-cache-data if available.
  currentPlayerCollection.forEach((player) => {
    currentSteamProfileInformation.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamProfileDataLoaded = steamPlayer.SteamProfileDataLoaded;
        player.SteamURL = steamPlayer.SteamURL;
        player.SteamAvatarSmall = steamPlayer.SteamAvatarSmall;
        player.SteamAvatarMedium = steamPlayer.SteamAvatarMedium;
        player.SteamAvatarFull = steamPlayer.SteamAvatarFull;
        player.SteamVisible = steamPlayer.SteamVisible;
        player.SteamConfigured = steamPlayer.SteamConfigured;
        player.SteamCreatedTimestamp = steamPlayer.SteamCreatedTimestamp;
        player.SteamCountryCode = steamPlayer.SteamCountryCode;
        // console.log(
        // `Updated '${player.SteamID}' with cached data: ${JSON.stringify(player)}`,
        // );
      }
    });

    currentSteamTF2Information.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamTF2DataLoaded = steamPlayer.SteamTF2DataLoaded;
        player.SteamTF2Playtime = steamPlayer.SteamTF2Playtime;
        // console.log(
        //   `Updated '${player.SteamID}' with cached tf2-data: ${JSON.stringify(player)}`,
        // );
      }
    });

    currentSteamBanInformation.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamBanDataLoaded = steamPlayer.SteamBanDataLoaded;
        player.SteamBanCommunityBanned = steamPlayer.SteamBanCommunityBanned;
        player.SteamBanVACBanned = steamPlayer.SteamBanVACBanned;
        player.SteamBanVACBans = steamPlayer.SteamBanVACBans;
        player.SteamBanDaysSinceLastBan = steamPlayer.SteamBanDaysSinceLastBan;
        player.SteamBanCommunityBanned = steamPlayer.SteamBanCommunityBanned;
        player.SteamBanNumberOfGameBans = steamPlayer.SteamBanNumberOfGameBans;
        player.SteamBanEconomyBan = steamPlayer.SteamBanEconomyBan;

        // console.log(
        //   `currentSteamBanInformation - Updated '${player.SteamID}' with cached steam-ban: ${JSON.stringify(player)}`,
        // );
      }
    });
  });

  // Check if there are currently any players.
  currentPlayerCollection.forEach((player) => {
    // Update general steam profile data for the given player.
    if (
      typeof player.SteamURL === 'undefined' &&
      typeof player.SteamProfileDataLoaded === 'undefined'
    ) {
      // Check if the SteamID is not already in the list
      if (!steamProfileUpdatePlayerList.includes(player.SteamID)) {
        steamProfileUpdatePlayerList.push(player.SteamID);
      }
      player.SteamProfileDataLoaded = 'IN_PROGRESS';
    }

    // Update tf2 steam stats for the given player.
    if (typeof player.SteamTF2DataLoaded === 'undefined') {
      // Check if the SteamID is not already in the list
      if (!steamTF2UpdatePlayerList.includes(player.SteamID)) {
        steamTF2UpdatePlayerList.push(player.SteamID);
      }
      player.SteamTF2DataLoaded = 'IN_PROGRESS';
    }

    // Update steam ban data for the given player.
    if (typeof player.SteamBanDataLoaded === 'undefined') {
      // Check if the SteamID is not already in the list
      if (!steamBanUpdatePlayerList.includes(player.SteamID)) {
        steamBanUpdatePlayerList.push(player.SteamID);
      }
      player.SteamBanDataLoaded = 'IN_PROGRESS';
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

const startSteamProfileUpdater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-data.');
    return;
  }

  // Regularly update steam-data.
  steamProfileUpdateTimer = setInterval(() => {
    // console.log('[main.ts] Updating steam data...');
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    updateSteamProfileDataForPlayers(steam, steamProfileUpdatePlayerList);
    steamProfileUpdatePlayerList = [];
    // console.log('[main.ts] Updating steam data... DONE');
  }, 10000);
};

const startSteamTF2Updater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-tf2-data.');
    return;
  }

  // Regularly update steam-data.
  steamTF2UpdateTimer = setInterval(() => {
    // console.log('[main.ts] Updating steam tf2 data...');
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    steamTF2UpdatePlayerList.forEach((playerSteamID) => {
      updateSteamTF2DataForPlayer(steam, playerSteamID);
    });
    steamTF2UpdatePlayerList = [];
    // console.log('[main.ts] Updating steam tf2 data... DONE');
  }, 10000);
};

const startSteamBanUpdater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-tf2-data.');
    return;
  }

  // Regularly update steam-bans.
  steamBanUpdateTimer = setInterval(() => {
    // console.log('[main.ts] Updating steam-ban data...');
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    updateSteamBanDataForPlayers(steam, steamBanUpdatePlayerList);
    steamBanUpdatePlayerList = [];
    // console.log('[main.ts] Updating steam-ban data... DONE');
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
    startSteamProfileUpdater();
    startSteamTF2Updater();
    startSteamBanUpdater();

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

      if (steamProfileUpdateTimer) {
        clearInterval(steamProfileUpdateTimer);
        steamProfileUpdateTimer = null;
      }

      if (steamTF2UpdateTimer) {
        clearInterval(steamTF2UpdateTimer);
        steamTF2UpdateTimer = null;
      }

      if (steamBanUpdateTimer) {
        clearInterval(steamBanUpdateTimer);
        steamBanUpdateTimer = null;
      }
    });
  })
  .catch(console.log);
