/* eslint-disable @typescript-eslint/no-explicit-any, import/no-unresolved, import/no-import-module-exports */
/// <reference types="electron" />

import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { ChildProcessWithoutNullStreams } from 'node:child_process';
import childProcess from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import https from 'https';
import { WebSocket } from 'ws';
import { PlayerInfo } from '@components/PlayerInfo';
import { RconAppFragEntry } from '@components/RconAppFragEntry';
import { RconAppLogEntry } from '@components/RconAppLogEntry';
import { PlayerTF2ClassInfo } from '@main/playerRep';
import { SteamGamePlayerstats } from '@main/steamGamePlayerstats';
import { createAppWindow } from './appWindow';
import {
  handleAddPlayerReputation,
  getPlayerReputations,
  updatePlayerReputationData,
} from './playerReputationHandler';

const path = require('path');

let tf2rconChild: ChildProcessWithoutNullStreams | null = null;
let tf2rconWs: WebSocket | null = null;
let shouldRestartTF2Rcon = true;
let currentPlayerCollection: PlayerInfo[] = [];
// eslint-disable-next-line no-undef
let steamProfileUpdateTimer: NodeJS.Timeout | null = null;
// eslint-disable-next-line no-undef
let steamTF2UpdateTimer: NodeJS.Timeout | null = null;
// eslint-disable-next-line no-undef
let steamBanUpdateTimer: NodeJS.Timeout | null = null;
// eslint-disable-next-line no-undef
let steamPlaytimeUpdateTimer: NodeJS.Timeout | null = null;
// eslint-disable-next-line no-undef
let playerReputationUpdateTime: NodeJS.Timeout | null = null;
let steamProfileUpdatePlayerList: string[] = [];
let steamTF2UpdatePlayerList: string[] = [];
let steamBanUpdatePlayerList: string[] = [];
let steamPlaytimeUpdatePlayerList: string[] = [];
const playerTF2Classes: PlayerTF2ClassInfo[] = [];

const tf2RconFilepath = './tf2-rcon.exe';
const tf2RconDownloadSite =
  'https://github.com/atomy/TF2-RCON-MISC/releases/download/10.1.0/main-windows-amd64.exe';
const tf2RconExpectedFilehash = '03463795becf55e1aa22fd648967209329758eb8';

const currentSteamProfileInformation: PlayerInfo[] = [];
const currentSteamTF2Information: PlayerInfo[] = [];
const currentSteamBanInformation: PlayerInfo[] = [];
const currentSteamPlaytimeInformation: PlayerInfo[] = [];

// Define the callback type
type CallbackFunction = (error?: string | null) => void;
type Tf2ClassCallback = (
  error: boolean,
  className: string[],
  weaponEntityName: string,
  killerSteamID: string,
) => void;

const SteamApi = require('steam-web');

const logFilePath = path.join(__dirname, 'weapon_mapping_failures.log');

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

const sendPlayerData = () => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // currentPlayerCollection.forEach((player) => {
  //   if (!player.Team) {
  //      console.log(`Sending player without a team: ${player.Name} -- ${player.Team}`);
  //   }
  // });

  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('player-data', currentPlayerCollection);
  });
};

const sendApplicationLogData = (logMessage: RconAppLogEntry) => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // console.log(`Sending log-message: ${logMessage}`);

  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('rcon-applog', logMessage);
  });
};

// Function to log just the entity names to a file
const logEntityNameToFile = (weaponEntityName: string) => {
  try {
    fs.appendFileSync(logFilePath, `${weaponEntityName}\n`, 'utf8');
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
};

// Function to request the TF2 class for a given weapon entity name
const mapWeaponEntityToTFClass = (
  weaponEntityName: string,
  killerSteamID: string,
  callback: Tf2ClassCallback,
) => {
  const windows = BrowserWindow.getAllWindows();

  // Send request to renderer
  // console.log(
  //   `mapWeaponEntityToTFClass() sending request *get-tf2-class* to frontend with weaponEntityName ${weaponEntityName}`,
  // );
  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('get-tf2-class', weaponEntityName, killerSteamID);
  });

  // Set up one-time listener for the response
  ipcMain.once('tf2-class-response', (event: IpcMainEvent, result: any) => {
    // console.log(`*tf2-class-response* result is: ${JSON.stringify(result)}`);

    if (result.error) {
      callback(true, [], '', '');
      console.log(
        `*tf2-class-response* error while trying to resolve entity-name: ${weaponEntityName}`,
      );
      logEntityNameToFile(weaponEntityName);
    } else {
      // console.log(`callback: ${result.classNames}, ${result.weaponEntityName}, ${result.killerSteamID}`)
      callback(
        false,
        result.classNames,
        result.weaponEntityName,
        result.killerSteamID,
      );
    }
  });
};

// Listen for *add-player-reputation* messages over IPC.
ipcMain.on('add-player-reputation', handleAddPlayerReputation);

const getPlayerNameForSteam = (steamID: string) => {
  const player = currentPlayerCollection.find((p) => steamID === p.SteamID);

  if (player) {
    return player.Name;
  }

  console.error(`Error: unable to find steamID ${steamID} in playerCollection`);
  return '???';
};

// assign given class to given player's steam-id
const assignPlayerClass = (
  steamID: string,
  playerClass: string,
  weaponName: string,
) => {
  // console.log(
  //   `[main.ts] CLASS-ASSIGNMENT [${steamID}][${getPlayerNameForSteam(steamID)}] Setting class ${playerClass}`,
  // );

  // Check if the player already exists in the array
  let playerExists = false;
  playerTF2Classes.forEach((player) => {
    if (steamID === player.steamid) {
      // this should never happen, if it does there may be an error in the weapon<->class database
      if (player.tf2class !== playerClass) {
        console.log(
          `[main.ts] CHANGED!!! [${player.steamid}][${getPlayerNameForSteam(player.steamid)}] player-class from "${player.tf2class}" to "${playerClass}" after weapon "${weaponName}"!`,
        );
      }
      player.tf2class = playerClass;
      playerExists = true;
      // console.log(
      //   `[main.ts] setting class ${playerClass} for player ${steamID} succeeded!`,
      // );
    }
  });

  // If the player does not exist, add a new entry
  if (!playerExists) {
    playerTF2Classes.push({ steamid: steamID, tf2class: playerClass });
    // console.log(
    //   `[main.ts] CLASS-ASSIGNMENT [${steamID}][${getPlayerNameForSteam(steamID)}] added new player with class ${playerClass}`,
    // );
  }
};

const sendApplicationFragData = (fragMessage: RconAppFragEntry) => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // Call func and supply callback, we have to work with a more extensive payload here cause else we may run into race-conditions leading to falsely data
  mapWeaponEntityToTFClass(
    fragMessage.Weapon,
    fragMessage.KillerSteamID,
    (error, tfClasses, weaponEntityName, killerSteamID) => {
      if (error) {
        console.log(
          `FAILED to map frag of entity-name ${weaponEntityName} to class!!!`,
        );
      } else if (tfClasses.length > 1) {
        // console.log(
        //   `Entity-name ${weaponEntityName} matches multiple classes: ${JSON.stringify(tfClasses)}`,
        // );
      } else {
        // console.log(
        //   `[${killerSteamID}][${getPlayerNameForSteam(killerSteamID)}] Mapped frag of entity-name ${weaponEntityName} to class ${tfClasses[0]}`,
        // );
        assignPlayerClass(killerSteamID, tfClasses[0], weaponEntityName);
      }

      [fragMessage.KillerClass] = tfClasses;

      // Send data to each window
      windows.forEach((w) => {
        w.webContents.send('rcon-appfrag', fragMessage);
      });
    },
  );
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
  }
};

// updatePlayerReputationData retrieve player-reputation-info and store it in memory
const startPlayerReputationUpdateTimer = () => {
  // Regularly update player reputations
  playerReputationUpdateTime = setInterval(() => {
    console.log('[main.ts] Checking for players without reputation data...');

    // Filter players who don't have any reputation data and haven't been checked
    const playersWithoutRep = currentPlayerCollection.filter(
      (player) => player.PlayerReputationType === undefined,
    );

    if (playersWithoutRep.length > 0) {
      const steamIds = playersWithoutRep.map((player) => player.SteamID);
      console.log(
        `[main.ts] Updating reputation data for ${steamIds.length} players without reputation...`,
      );
      return updatePlayerReputationData(steamIds).then((): void => {
        // Set default NONE reputation for players who were checked but had no reputation
        playersWithoutRep.forEach((player) => {
          if (!player.PlayerReputationType) {
            player.PlayerReputationType = 'NONE';
            player.PlayerReputationInfo = '';
          }
        });
        return undefined;
      });
    }
    console.log('[main.ts] No players found without reputation data.');
    return undefined;
  }, 60000);
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
              // console.log(`ERROR '${player.SteamID}': ${err}`);
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
                // console.log(
                //   `updateSteamBanDataForPlayers() Updated '${player.SteamID}': ${JSON.stringify(player)}`,
                // );
                currentSteamBanInformation.push(player);
              }
            });
          });
        }
      },
    });
  }
};

const parseTF2PlayerStats = (
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

  // When playerStats are unavailable, skip.
  if (typeof playerStats.stats === 'undefined') {
    console.log(
      `Failed to acquire tf2-playtime for SteamID '${player.SteamID}'!`,
    );

    return player;
  }

  playerStats.stats.forEach((stat) => {
    const classMatch = classes.some((className) =>
      stat.name.startsWith(className),
    );
    if (classMatch && stat.name.endsWith('.accum.iPlayTime')) {
      totalPlayTime += stat.value;
    }
  });

  // console.log(`SteamID '${player.SteamID}' totalPlayTime: ${totalPlayTime}`);

  player.SteamTF2Playtime = totalPlayTime;

  return player;
};

// Get playtime for any Steam game
const getSteamGamePlaytime = (
  playerSteamId: string,
  appId: number,
  callback: (playtime: number) => void,
) => {
  if (!process.env.STEAM_PLAYTIME_API_URL) {
    console.log('[main.ts] STEAM_PLAYTIME_API_URL not configured');
    callback(-1);
    return;
  }

  const url = `${process.env.STEAM_PLAYTIME_API_URL}?steamid=${playerSteamId}&appid=${appId}`;

  https
    .get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(data);

          if (jsonResponse.playtime) {
            const hours = parseInt(jsonResponse.playtime, 10);
            callback(hours);
          } else {
            console.log(
              `[main.ts] No playtime data for ${playerSteamId} in game ${appId}`,
            );
            callback(-1);
          }
        } catch (error) {
          console.log(
            `[main.ts] Error parsing playtime data for ${playerSteamId}: ${error}`,
          );
          callback(-1);
        }
      });
    })
    .on('error', (error) => {
      console.log(
        `[main.ts] Error fetching playtime for ${playerSteamId}: ${error}`,
      );
      callback(-1);
    });
};

// Update the updateSteamTF2DataForPlayer function to use STEAM_APPID
const updateSteamTF2DataForPlayer = (
  steam: typeof SteamApi,
  playerSteamId: string,
) => {
  // Get current game's playtime
  const currentAppId = Number(process.env.STEAM_APPID) || 0;

  getSteamGamePlaytime(playerSteamId, currentAppId, (playtime) => {
    const playerIndex = currentPlayerCollection.findIndex(
      (p) => p.SteamID === playerSteamId,
    );
    if (playerIndex !== -1) {
      console.log(
        `[main.ts] Updated playtime for ${currentPlayerCollection[playerIndex].Name} (${playerSteamId}): ${playtime} hours`,
      );
      currentPlayerCollection[playerIndex].SteamPlaytime = playtime;

      // Cache the updated playtime
      const existingCacheIndex = currentSteamPlaytimeInformation.findIndex(
        (p) => p.SteamID === playerSteamId,
      );
      if (existingCacheIndex !== -1) {
        currentSteamPlaytimeInformation[existingCacheIndex].SteamPlaytime =
          playtime;
      } else {
        const cachePlayer = { ...currentPlayerCollection[playerIndex] };
        currentSteamPlaytimeInformation.push(cachePlayer);
      }
    }
  });

  // For TF2, also get detailed class-based playtime
  if (process.env.STEAM_APPID === '440') {
    steam.getUserStatsForGame({
      steamid: playerSteamId,
      appid: 440,
      callback: (err: any, data: any) => {
        if (typeof err !== 'undefined') {
          currentPlayerCollection.forEach((player) => {
            if (player.SteamID === playerSteamId) {
              player.SteamTF2DataLoaded = 'ERROR';
              currentSteamTF2Information.push(player);
            }
          });
        } else if (data && typeof data.playerstats === 'object') {
          const steamPlayerStats = data.playerstats;
          currentPlayerCollection.forEach((player) => {
            if (player.SteamID === playerSteamId) {
              player.SteamTF2DataLoaded = 'COMPLETED';
              const playtimePlayer = parseTF2PlayerStats(
                player,
                steamPlayerStats,
              );
              player.SteamTF2Playtime = playtimePlayer.SteamTF2Playtime;
              currentSteamTF2Information.push(player);
            }
          });
        }
      },
    });
  }
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
      }
    });

    currentSteamTF2Information.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamTF2DataLoaded = steamPlayer.SteamTF2DataLoaded;
        player.SteamTF2Playtime = steamPlayer.SteamTF2Playtime;
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
      }
    });

    // Check cached playtime data
    let playtimeFound = false;
    currentSteamPlaytimeInformation.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamPlaytime = steamPlayer.SteamPlaytime;
        playtimeFound = true;
      }
    });

    // Initialize playtime to -1 only if it's undefined and not found in cache
    if (typeof player.SteamPlaytime === 'undefined' && !playtimeFound) {
      player.SteamPlaytime = -1;
      // Only queue for update if playtime hasn't been loaded yet
      if (!steamPlaytimeUpdatePlayerList.includes(player.SteamID)) {
        console.log(
          `steamPlaytimeUpdatePlayerList - Adding '${player.SteamID}' (new player)`,
        );
        steamPlaytimeUpdatePlayerList.push(player.SteamID);
      }
    }
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

// updatePlayerWarns updates player-warn data
const updatePlayerWarns = () => {
  // Enrich current players with steam-cache-data if available.
  currentPlayerCollection.forEach((player) => {
    getPlayerReputations().forEach((playerReputation) => {
      if (player.SteamID === playerReputation.steamid) {
        player.PlayerReputationInfo = playerReputation.reason;
        player.PlayerReputationType = playerReputation.type;
      }
    });
  });
};

// updateTF2ClassInfo updates players with class-info
const updateTF2ClassInfo = () => {
  // Enrich current players with class-cache-data if available.
  currentPlayerCollection.forEach((player) => {
    playerTF2Classes.forEach((playerTF2Class) => {
      if (player.SteamID === playerTF2Class.steamid) {
        player.TF2Class = playerTF2Class.tf2class;
      }
    });
  });
};

// Establish connection to tf2-rcon websocket.
const connectTf2rconWebsocket = () => {
  tf2rconWs = new WebSocket('ws://127.0.0.1:27689/websocket');

  if (tf2rconWs !== null) {
    tf2rconWs.on('open', function open() {
      // Always send status command
      const statusPayload = JSON.stringify({
        type: 'command',
        command: 'status',
      });
      tf2rconWs.send(statusPayload);

      // Send tf_lobby_debug command only for TF2 (appid 440)
      if (process.env.STEAM_APPID === '440') {
        const lobbyPayload = JSON.stringify({
          type: 'command',
          command: 'tf_lobby_debug',
        });
        tf2rconWs.send(lobbyPayload);
      }
    });

    tf2rconWs.on('message', function incoming(data: string) {
      // console.log(`[main.ts] Received: ${String(data)}`);
      const incommingJson = JSON.parse(String(data));

      if (incommingJson.type === 'player-update') {
        const playerJson = JSON.stringify(incommingJson['current-players']);
        currentPlayerCollection = JSON.parse(playerJson);
        // console.log(
        //   `play-update coming in, len: ${currentPlayerCollection.length}`,
        // );

        updateSteamInfo();
        updatePlayerWarns();
        // Only update TF2 class info for TF2 (appid 440)
        if (process.env.STEAM_APPID === '440') {
          updateTF2ClassInfo();
        }
        sendPlayerData();
      } else if (incommingJson.type === 'application-log') {
        const uniqueKey = () => {
          const randomPart = Math.random().toString(36).substr(2, 9); // Using a random string
          const timestampPart = new Date().getTime(); // Using a timestamp
          return `${randomPart}-${timestampPart}`;
        };

        const logEntry: RconAppLogEntry = {
          Timestamp: Date.now(), // Set the timestamp to the current time
          Message: incommingJson.message,
          Key: uniqueKey(),
        };
        sendApplicationLogData(logEntry);
      } else if (incommingJson.type === 'frag') {
        const uniqueKey = () => {
          const randomPart = Math.random().toString(36).substr(2, 9); // Using a random string
          const timestampPart = new Date().getTime(); // Using a timestamp
          return `${randomPart}-${timestampPart}`;
        };

        // console.log(
        //   `[main.ts] Dump: *${JSON.stringify(incommingJson)}*!`,
        // );

        const fragEntry: RconAppFragEntry = {
          Timestamp: Date.now(), // Set the timestamp to the current time
          KillerName: incommingJson.frag.KillerName,
          VictimName: incommingJson.frag.VictimName,
          KillerSteamID: incommingJson.frag.KillerSteamID,
          VictimSteamID: incommingJson.frag.VictimSteamID,
          Weapon: incommingJson.frag.Weapon,
          Crit: incommingJson.frag.Crit === true,
          Key: uniqueKey(),
          KillerClass: '',
        };

        // console.log(
        //   `[main.ts] Dump2: *${JSON.stringify(fragEntry)}*!`,
        // );

        sendApplicationFragData(fragEntry);
      } else {
        console.log(
          `[main.ts] Discarding unconfigured type *${incommingJson.type}*!`,
        );
      }
    });
    tf2rconWs.on('close', function close() {
      console.log('[main.ts] Connection closed. Trying to reconnect...');
      setTimeout(connectTf2rconWebsocket, 1000); // Reconnect every 1 second
    });

    tf2rconWs.on('error', function error(err: any) {
      console.error('[main.ts] WebSocket error:', err.message);
      if (tf2rconWs !== null) {
        tf2rconWs.close(); // Trigger the close event, which handles the retry
      }
    });
  }
};

// computeFileSHA1 function to compute SHA1 hash of a file
function computeFileSHA1Sync(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha1');
  hashSum.update(fileBuffer.toString());

  return hashSum.digest('hex');
}

// downloadFile function to download a file
function downloadFile(
  url: string,
  dest: string,
  expectedSHA1: string,
  cb: (error?: string | null) => void,
) {
  const processDownload = (response: any) => {
    const file = fs.createWriteStream(dest);
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        // Compute SHA1 hash of the downloaded file synchronously
        const fileHash = computeFileSHA1Sync(dest);
        if (fileHash === expectedSHA1) {
          console.log(
            `File hash of downloaded file validated (hash: ${fileHash})`,
          );
          cb(null); // Success
        } else {
          console.log(
            `File hash of downloaded file FAILED validation (hash: ${fileHash})`,
          );
          fs.unlink(dest, () => {}); // Delete the file on hash mismatch
          cb('SHA1 hash mismatch, file discarded.');
        }
      });
    });
  };

  const makeRequest = (urlToDownload: string) => {
    const request = https
      .get(urlToDownload, (response) => {
        // Handle redirect
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Get the redirect URL from the Location header
          const { location } = response.headers;
          if (location) {
            console.log(`Following redirect to ${location}`);
            // Close the current response stream and follow the redirect
            response.destroy();
            // Follow only one redirect
            const newRequest = https
              .get(location, (newResponse) => {
                if (newResponse.statusCode === 200) {
                  processDownload(newResponse);
                } else {
                  cb(
                    `Server responded with status code: ${newResponse.statusCode}`,
                  );
                }
              })
              .on('error', (err) => {
                cb(err.message);
              });
            newRequest.end();
          } else {
            cb('Redirect location header missing');
          }
        } else if (response.statusCode === 200) {
          processDownload(response);
        } else {
          cb(`Server responded with status code: ${response.statusCode}`);
        }
      })
      .on('error', (err) => {
        cb(err.message);
      });

    request.end();
  };

  // Start the download process
  makeRequest(url);
}

// downloadTF2Rcon downloads the tf2-rcon program that establishes communication with tf2
const downloadTF2Rcon = (callback: CallbackFunction) => {
  // Use fs.access to check if the file exists
  fs.access(tf2RconFilepath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log('downloadTF2Rcon() File does not exist, downloading...');
      downloadFile(
        tf2RconDownloadSite,
        tf2RconFilepath,
        tf2RconExpectedFilehash,
        (error) => {
          if (error) {
            console.error(
              'downloadTF2Rcon() Error downloading the file:',
              error,
            );
          } else {
            console.log('downloadTF2Rcon() File downloaded successfully');
            callback();
          }
        },
      );
    } else {
      console.log('downloadTF2Rcon() File already exists');
      callback();
    }
  });
};

// start TF2-Rcon-Subprocess
const startTF2Rcon = () => {
  if (
    process.env.TF2_RCON_AUTOSTART &&
    Number(process.env.TF2_RCON_AUTOSTART) === 0
  ) {
    console.log('Omitting start of TF2RCON cause of TF2_RCON_AUTOSTART==0!');
    return;
  }

  fs.access(tf2RconFilepath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log('TF2RCON not found, unable to start!');
    } else {
      console.log('Starting TF2RCON...');
      if (
        process.env.ENVIRONMENT &&
        process.env.ENVIRONMENT === 'development'
      ) {
        tf2rconChild = childProcess.spawn(
          'cmd /c "cd D:\\\\git\\\\TF2-RCON-MISC && .\\\\runDev.bat"',
          [''],
          {
            shell: true,
          },
        );
      } else {
        tf2rconChild = childProcess.spawn('.\\\\tf2-rcon.exe"', [''], {
          shell: true,
        });
      }

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

        // Restart after 5s.
        if (shouldRestartTF2Rcon) {
          console.log('[main.ts][TF2RCON] Restarting after 5 seconds...');
          setTimeout(() => {
            console.log(
              '[main.ts][TF2RCON] Restarting after 5 seconds... RESTARTING',
            );
            startTF2Rcon();
          }, 5000);
        }
      });
    }
  });
};

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

const startSteamPlaytimeUpdater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log(
      'Env *STEAM_KEY* not configured, not updating steam playtime data.',
    );
    return;
  }

  const currentAppId = Number(process.env.STEAM_APPID) || 0;
  if (currentAppId === 0) {
    console.log(
      'No valid STEAM_APPID configured, not updating steam playtime data.',
    );
    return;
  }

  console.log(
    `[main.ts] Starting Steam playtime updater for AppID: ${currentAppId}`,
  );

  // Regularly update steam playtime data
  steamPlaytimeUpdateTimer = setInterval(() => {
    if (steamPlaytimeUpdatePlayerList.length > 0) {
      console.log(
        `[main.ts] Updating playtime for ${steamPlaytimeUpdatePlayerList.length} players...`,
      );
    }

    steamPlaytimeUpdatePlayerList.forEach((playerSteamID) => {
      getSteamGamePlaytime(playerSteamID, currentAppId, (playtime) => {
        const playerIndex = currentPlayerCollection.findIndex(
          (p) => p.SteamID === playerSteamID,
        );
        if (playerIndex !== -1) {
          console.log(
            `[main.ts] Updated playtime for ${currentPlayerCollection[playerIndex].Name} (${playerSteamID}): ${playtime} hours`,
          );
          currentPlayerCollection[playerIndex].SteamPlaytime = playtime;

          // Cache the updated playtime
          const existingCacheIndex = currentSteamPlaytimeInformation.findIndex(
            (p) => p.SteamID === playerSteamID,
          );
          if (existingCacheIndex !== -1) {
            currentSteamPlaytimeInformation[existingCacheIndex].SteamPlaytime =
              playtime;
          } else {
            const cachePlayer = { ...currentPlayerCollection[playerIndex] };
            currentSteamPlaytimeInformation.push(cachePlayer);
          }
        }
      });
    });
    steamPlaytimeUpdatePlayerList = [];
  }, 10000);
};

/** Handle creating/removing shortcuts on Windows when installing/uninstalling. */
// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', () => {
  console.log('[event] ready!');

  process.on('SIGTERM', handleExit);
  process.on('SIGHUP', handleExit);
  process.on('SIGQUIT', handleExit);
  process.on('SIGINT', handleExit);

  // Download tf2-rcon when needed.
  downloadTF2Rcon(() => {
    // Start tf2-rcon-backend when download completed or file already present.
    startTF2Rcon();
  });

  connectTf2rconWebsocket();
  startSteamProfileUpdater();
  startSteamPlaytimeUpdater();
  // Only start TF2 updater for TF2 (appid 440)
  if (process.env.STEAM_APPID === '440') {
    startSteamTF2Updater();
  }
  startSteamBanUpdater();
  startPlayerReputationUpdateTimer();
  createAppWindow();
});

/**
 * Emitted when the application is activated. Various actions can
 * trigger this event, such as launching the application for the first time,
 * attempting to re-launch the application when it's already running,
 * or clicking on the application's dock or taskbar icon.
 */
app.on('activate', () => {
  /**
   * On OS X it's common to re-create a window in the app when the
   * dock icon is clicked and there are no other windows open.
   */
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow();
  }
});

/**
 * Emitted when all windows have been closed.
 */
app.on('window-all-closed', () => {
  /**
   * On OS X it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q
   */
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[event] before-quit!');

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

  if (playerReputationUpdateTime) {
    clearInterval(playerReputationUpdateTime);
    playerReputationUpdateTime = null;
  }

  if (steamPlaytimeUpdateTimer) {
    clearInterval(steamPlaytimeUpdateTimer);
    steamPlaytimeUpdateTimer = null;
  }
});

/**
 * In this file you can include the rest of your app's specific main process code.
 * You can also put them in separate files and import them here.
 */
