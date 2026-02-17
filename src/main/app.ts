// eslint-disable-next-line import/named
/* eslint-disable @typescript-eslint/no-explicit-any, import/no-unresolved, import/no-import-module-exports */
/// <reference types="electron" />

import { app, BrowserWindow, ipcMain } from 'electron';
import https from 'https';
import { PlayerInfo } from '@components/PlayerInfo';
import { RconAppFragEntry } from '@components/RconAppFragEntry';
import { PlayerTF2ClassInfo } from '@main/playerRep';
import { AppConfig } from '@components/AppConfig';
import { createAppWindow } from './appWindow';
import {
  handleAddPlayerReputation,
  getPlayerReputations,
  updatePlayerReputationData,
  setGetCurrentPlayerCollection,
} from './playerReputationHandler';
import { getDysStats } from './dysStatsHandler';
import { OnAppExitCallback } from './appExitCallback';
import {
  sendPlayerData,
  mapWeaponEntityToTFClass,
  sendBackendData,
} from './appIpc';
import { parseTF2PlayerStats } from './tf2PlayerStats';
import { PlaytimeRequest } from './playtimeTypes';
import { RconManager } from './rcon/RconManager';
import type { FragInfo as RconFragInfo } from './rcon/LogParser';

// RCON Manager instance
let rconManager: RconManager | null = null;

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
// eslint-disable-next-line no-undef
let dysStatsUpdateTimer: NodeJS.Timeout | null = null;
let steamProfileUpdatePlayerList: string[] = [];
let steamTF2UpdatePlayerList: string[] = [];
let steamBanUpdatePlayerList: string[] = [];
let steamPlaytimeUpdatePlayerList: string[] = [];
let dysStatsUpdatePlayerList: string[] = [];

// Rate-limited playtime request queue
let playtimeRequestQueue: PlaytimeRequest[] = [];
let isProcessingPlaytimeQueue = false;

const playerTF2Classes: PlayerTF2ClassInfo[] = [];

const currentSteamProfileInformation: PlayerInfo[] = [];
const currentSteamTF2Information: PlayerInfo[] = [];
const currentSteamBanInformation: PlayerInfo[] = [];
const currentSteamPlaytimeInformation: PlayerInfo[] = [];
const currentDysStatsInformation: PlayerInfo[] = [];

const SteamApi = require('steam-web');

// Signal handler.
function handleExit(onAppExitCallback: OnAppExitCallback): void {
  console.log(`[app.ts] Received signal. Exiting application.`);
  onAppExitCallback();

  if (rconManager) {
    rconManager.stop();
  }

  // Safely exit the Electron application
  app.quit();
}

const setIsRconConnected = (isRconConnected: boolean) => {
  sendBackendData({ isRconConnected });
};

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
  // Check if the player already exists in the array
  let playerExists = false;
  playerTF2Classes.forEach((player) => {
    if (steamID === player.steamid) {
      // this should never happen, if it does there may be an error in the weapon<->class database
      if (player.tf2class !== playerClass) {
        console.log(
          `[app.ts] CHANGED!!! [${player.steamid}][${getPlayerNameForSteam(player.steamid)}] player-class from "${player.tf2class}" to "${playerClass}" after weapon "${weaponName}"!`,
        );
      }
      player.tf2class = playerClass;
      playerExists = true;
    }
  });

  // If the player does not exist, add a new entry
  if (!playerExists) {
    playerTF2Classes.push({ steamid: steamID, tf2class: playerClass });
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
        // Multiple classes match
      } else {
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

const installAppConfigHandler = () => {
  const appConfig: AppConfig = {
    AppId: process.env.STEAM_APPID || '',
    Environment: process.env.ENVIRONMENT || 'production',
    SteamKey: process.env.STEAM_KEY || '',
    SteamAppId: process.env.STEAM_APPID || '',
    SteamGameShortname: process.env.STEAM_GAME_SHORTNAME || '',
    SteamPlaytimeApiUrl: process.env.STEAM_PLAYTIME_API_URL || '',
    PlayerReputationApiUrl: process.env.PLAYER_REPUATION_API_URL || '',
    PlayerReputationApiKey: process.env.PLAYER_REPUATION_API_KEY || '',
    ReputationWwwUrl: process.env.REPUTATION_WWW_URL || '',
    DysStatsApiUrl: process.env.DYSTATS_API_URL || '',
    Tf2RconAutostart: '1', // Always enabled with built-in client
    AutoOpenDevtools: process.env.AUTO_OPEN_DEVTOOLS || '0',
    Tf2LogPath: process.env.TF2_LOGPATH || '',
  };

  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // Listen for get-appconfig request
  ipcMain.on('get-appconfig', () => {
    console.log('[app.ts] Received get-appconfig request, sending app config');
    // Send data to each window
    windows.forEach((w) => {
      w.webContents.send('app-config', appConfig);
    });
  });

  console.log('[app.ts] Waiting for get-appconfig request...');
};

// [Rest of Steam API functions remain the same - keeping them from original]

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

                const cachePlayer = { ...player };
                const existingIndex = currentSteamProfileInformation.findIndex(
                  (p) => p.SteamID === player.SteamID,
                );
                if (existingIndex !== -1) {
                  currentSteamProfileInformation[existingIndex] = cachePlayer;
                } else {
                  currentSteamProfileInformation.push(cachePlayer);
                }
              }
            });
          });
        }
      },
    });
  }
};

const startPlayerReputationUpdateTimer = () => {
  playerReputationUpdateTime = setInterval(() => {
    const playersWithoutRep = currentPlayerCollection.filter(
      (player) => player.PlayerReputationType === 'IN_PROGRESS',
    );

    if (playersWithoutRep.length > 0) {
      const steamIds = playersWithoutRep.map((player) => player.SteamID);
      console.log(
        `[app.ts] Updating reputation data for ${steamIds.length} players without reputation...`,
      );
      return updatePlayerReputationData(steamIds).then((): void => {
        playersWithoutRep.forEach((player) => {
          if (!player.PlayerReputationType) {
            player.PlayerReputationType = 'NONE';
            player.PlayerReputationInfo = '';
          }
        });
        return undefined;
      });
    }
    return undefined;
  }, 5000);
};

const updateSteamBanDataForPlayers = (
  steam: typeof SteamApi,
  playerSteamIds: string[],
) => {
  if (playerSteamIds.length > 0) {
    steam.getPlayerBans({
      steamids: playerSteamIds,
      callback: (err: any, data: any) => {
        if (typeof err !== 'undefined') {
          currentPlayerCollection.forEach((player) => {
            if (playerSteamIds.includes(player.SteamID)) {
              player.SteamBanDataLoaded = 'ERROR';
              const cachePlayer = { ...player };
              const existingIndex = currentSteamBanInformation.findIndex(
                (p) => p.SteamID === player.SteamID,
              );
              if (existingIndex !== -1) {
                currentSteamBanInformation[existingIndex] = cachePlayer;
              } else {
                currentSteamBanInformation.push(cachePlayer);
              }
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
                player.SteamBanNumberOfGameBans =
                  steamBanPlayer.NumberOfGameBans;
                player.SteamBanEconomyBan = steamBanPlayer.EconomyBan;

                const cachePlayer = { ...player };
                const existingIndex = currentSteamBanInformation.findIndex(
                  (p) => p.SteamID === player.SteamID,
                );
                if (existingIndex !== -1) {
                  currentSteamBanInformation[existingIndex] = cachePlayer;
                } else {
                  currentSteamBanInformation.push(cachePlayer);
                }
              }
            });
          });
        }
      },
    });
  }
};

// Process the playtime request queue with rate limiting
const processPlaytimeQueue = () => {
  if (isProcessingPlaytimeQueue || playtimeRequestQueue.length === 0) {
    return;
  }

  isProcessingPlaytimeQueue = true;
  const request = playtimeRequestQueue.shift()!;

  if (!process.env.STEAM_PLAYTIME_API_URL) {
    console.log('[app.ts] STEAM_PLAYTIME_API_URL not configured');
    request.callback(-1);
    isProcessingPlaytimeQueue = false;
    setTimeout(processPlaytimeQueue, 2000);
    return;
  }

  const url = `${process.env.STEAM_PLAYTIME_API_URL}?steamid=${request.playerSteamId}&appid=${request.appId}`;

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
            request.callback(hours);
          } else {
            request.callback(-1);
          }
        } catch (error) {
          console.log(
            `[app.ts] Error parsing playtime data for ${request.playerSteamId}: ${error}`,
          );
          request.callback(-1);
        }

        setTimeout(() => {
          isProcessingPlaytimeQueue = false;
          processPlaytimeQueue();
        }, 2000);
      });
    })
    .on('error', (error) => {
      console.log(
        `[app.ts] Error fetching playtime for ${request.playerSteamId}: ${error}`,
      );
      request.callback(-1);

      setTimeout(() => {
        isProcessingPlaytimeQueue = false;
        processPlaytimeQueue();
      }, 2000);
    });
};

const isPlayerInPlaytimeQueue = (playerSteamId: string): boolean => {
  return playtimeRequestQueue.some(
    (request) => request.playerSteamId === playerSteamId,
  );
};

const getSteamGamePlaytime = (
  playerSteamId: string,
  appId: number,
  callback: (playtime: number) => void,
) => {
  playtimeRequestQueue.push({
    playerSteamId,
    appId,
    callback,
  });

  processPlaytimeQueue();
};

const updateSteamTF2DataForPlayer = (
  steam: typeof SteamApi,
  playerSteamId: string,
) => {
  const currentAppId = Number(process.env.STEAM_APPID) || 0;

  getSteamGamePlaytime(playerSteamId, currentAppId, (playtime) => {
    const playerIndex = currentPlayerCollection.findIndex(
      (p) => p.SteamID === playerSteamId,
    );
    if (playerIndex !== -1) {
      console.log(
        `[app.ts] Updated playtime for ${currentPlayerCollection[playerIndex].Name} (${playerSteamId}): ${playtime} hours`,
      );
      currentPlayerCollection[playerIndex].SteamPlaytime = playtime.toString();

      const existingCacheIndex = currentSteamPlaytimeInformation.findIndex(
        (p) => p.SteamID === playerSteamId,
      );
      if (existingCacheIndex !== -1) {
        currentSteamPlaytimeInformation[existingCacheIndex].SteamPlaytime =
          playtime.toString();
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
              const cachePlayer = { ...player };
              const existingIndex = currentSteamTF2Information.findIndex(
                (p) => p.SteamID === player.SteamID,
              );
              if (existingIndex !== -1) {
                currentSteamTF2Information[existingIndex] = cachePlayer;
              } else {
                currentSteamTF2Information.push(cachePlayer);
              }
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
              const cachePlayer = { ...player };
              const existingIndex = currentSteamTF2Information.findIndex(
                (p) => p.SteamID === player.SteamID,
              );
              if (existingIndex !== -1) {
                currentSteamTF2Information[existingIndex] = cachePlayer;
              } else {
                currentSteamTF2Information.push(cachePlayer);
              }
            }
          });
        }
      },
    });
  }
};

// [Continue with Steam update functions...]
const updateSteamInfo = () => {
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
        player.SteamBanNumberOfGameBans = steamPlayer.SteamBanNumberOfGameBans;
        player.SteamBanEconomyBan = steamPlayer.SteamBanEconomyBan;
      }
    });

    let playtimeFound = false;
    currentSteamPlaytimeInformation.forEach((steamPlayer) => {
      if (player.SteamID === steamPlayer.SteamID) {
        player.SteamPlaytime = steamPlayer.SteamPlaytime;
        playtimeFound = true;
      }
    });

    if (typeof player.SteamPlaytime === 'undefined' && !playtimeFound) {
      player.SteamPlaytime = 'IN_PROGRESS';
      if (
        !steamPlaytimeUpdatePlayerList.includes(player.SteamID) &&
        !isPlayerInPlaytimeQueue(player.SteamID)
      ) {
        console.log(
          `steamPlaytimeUpdatePlayerList - Adding '${player.SteamID}' (new player)`,
        );
        steamPlaytimeUpdatePlayerList.push(player.SteamID);
      }
    }

    if (process.env.STEAM_APPID === '17580') {
      currentDysStatsInformation.forEach((dysPlayer) => {
        if (player.SteamID === dysPlayer.SteamID) {
          player.DysStatsLoaded = dysPlayer.DysStatsLoaded;
          player.DysRank = dysPlayer.DysRank;
          player.DysPoints = dysPlayer.DysPoints;
          player.DysAssist = dysPlayer.DysAssist;
          player.DysCyberdamage = dysPlayer.DysCyberdamage;
          player.DysCyberfrag = dysPlayer.DysCyberfrag;
          player.DysDamage = dysPlayer.DysDamage;
          player.DysFrag = dysPlayer.DysFrag;
          player.DysHack = dysPlayer.DysHack;
          player.DysHealing = dysPlayer.DysHealing;
          player.DysObjective = dysPlayer.DysObjective;
          player.DysSecondary = dysPlayer.DysSecondary;
          player.DysTacscan = dysPlayer.DysTacscan;
        }
      });
    }
  });

  currentPlayerCollection.forEach((player) => {
    if (
      typeof player.SteamURL === 'undefined' &&
      typeof player.SteamProfileDataLoaded === 'undefined'
    ) {
      if (!steamProfileUpdatePlayerList.includes(player.SteamID)) {
        steamProfileUpdatePlayerList.push(player.SteamID);
      }
      player.SteamProfileDataLoaded = 'IN_PROGRESS';
    }

    if (typeof player.SteamTF2DataLoaded === 'undefined') {
      if (!steamTF2UpdatePlayerList.includes(player.SteamID)) {
        steamTF2UpdatePlayerList.push(player.SteamID);
      }
      player.SteamTF2DataLoaded = 'IN_PROGRESS';
    }

    if (typeof player.SteamBanDataLoaded === 'undefined') {
      if (!steamBanUpdatePlayerList.includes(player.SteamID)) {
        steamBanUpdatePlayerList.push(player.SteamID);
      }
      player.SteamBanDataLoaded = 'IN_PROGRESS';
    }

    if (typeof player.PlayerReputationType === 'undefined') {
      player.PlayerReputationType = 'IN_PROGRESS';
      player.PlayerReputationInfo = '';
    }

    if (process.env.STEAM_APPID === '17580') {
      if (typeof player.DysPoints === 'undefined') {
        if (!dysStatsUpdatePlayerList.includes(player.SteamID)) {
          console.log(
            `[app.ts] Adding player ${player.Name} (${player.SteamID}) to Dys stats update queue`,
          );
          dysStatsUpdatePlayerList.push(player.SteamID);
        }
        player.DysStatsLoaded = 'IN_PROGRESS';
      }
    }
  });
};

const updatePlayerWarns = () => {
  currentPlayerCollection.forEach((player) => {
    getPlayerReputations().forEach((playerReputation) => {
      if (player.SteamID === playerReputation.steamid) {
        player.PlayerReputationInfo = playerReputation.reason;
        player.PlayerReputationType = playerReputation.type;
      }
    });
  });
};

const updateTF2ClassInfo = () => {
  currentPlayerCollection.forEach((player) => {
    playerTF2Classes.forEach((playerTF2Class) => {
      if (player.SteamID === playerTF2Class.steamid) {
        player.TF2Class = playerTF2Class.tf2class;
      }
    });
  });
};

// Setup RCON Manager event handlers
const setupRconManagerEvents = () => {
  if (!rconManager) return;

  rconManager.on('started', () => {
    console.log('[app.ts] RCON Manager started');
    setIsRconConnected(true);
  });

  rconManager.on('stopped', () => {
    console.log('[app.ts] RCON Manager stopped');
    setIsRconConnected(false);
  });

  rconManager.on('error', (err: Error) => {
    console.error('[app.ts] RCON Manager error:', err);
    setIsRconConnected(false);
  });

  rconManager.on('player-update', (players: any[]) => {
    // Clean up stale cache entries
    const currentSteamIds = new Set(players.map((p: any) => p.SteamID));
    const cleanCacheArray = (cacheArray: PlayerInfo[]) => {
      return cacheArray.filter((cachedPlayer) =>
        currentSteamIds.has(cachedPlayer.SteamID),
      );
    };

    currentPlayerCollection = players;

    const cleanedProfileInfo = cleanCacheArray(currentSteamProfileInformation);
    currentSteamProfileInformation.length = 0;
    currentSteamProfileInformation.push(...cleanedProfileInfo);

    const cleanedTF2Info = cleanCacheArray(currentSteamTF2Information);
    currentSteamTF2Information.length = 0;
    currentSteamTF2Information.push(...cleanedTF2Info);

    const cleanedBanInfo = cleanCacheArray(currentSteamBanInformation);
    currentSteamBanInformation.length = 0;
    currentSteamBanInformation.push(...cleanedBanInfo);

    const cleanedPlaytimeInfo = cleanCacheArray(currentSteamPlaytimeInformation);
    currentSteamPlaytimeInformation.length = 0;
    currentSteamPlaytimeInformation.push(...cleanedPlaytimeInfo);

    const cleanedDysInfo = cleanCacheArray(currentDysStatsInformation);
    currentDysStatsInformation.length = 0;
    currentDysStatsInformation.push(...cleanedDysInfo);

    updateSteamInfo();
    updatePlayerWarns();
    if (process.env.STEAM_APPID === '440') {
      updateTF2ClassInfo();
    }
    sendPlayerData(currentPlayerCollection);
  });

  rconManager.on('frag', (fragInfo: RconFragInfo) => {
    const uniqueKey = () => {
      const randomPart = Math.random().toString(36).substr(2, 9);
      const timestampPart = new Date().getTime();
      return `${randomPart}-${timestampPart}`;
    };

    const fragEntry: RconAppFragEntry = {
      Timestamp: Date.now(),
      KillerName: fragInfo.KillerName,
      VictimName: fragInfo.VictimName,
      KillerSteamID: fragInfo.KillerSteamID,
      VictimSteamID: fragInfo.VictimSteamID,
      Weapon: fragInfo.Weapon,
      Crit: fragInfo.Crit,
      Key: uniqueKey(),
      KillerClass: '',
    };

    sendApplicationFragData(fragEntry);
  });
};

// Start the RCON Manager
const startRconManager = async () => {
  try {
    rconManager = new RconManager();
    setupRconManagerEvents();
    await rconManager.start();
  } catch (err) {
    console.error('[app.ts] Failed to start RCON Manager:', err);
    // Retry after 5 seconds
    setTimeout(startRconManager, 5000);
  }
};

const startSteamProfileUpdater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-data.');
    return;
  }

  steamProfileUpdateTimer = setInterval(() => {
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    updateSteamProfileDataForPlayers(steam, steamProfileUpdatePlayerList);
    steamProfileUpdatePlayerList = [];
  }, 10000);
};

const startSteamTF2Updater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-tf2-data.');
    return;
  }

  steamTF2UpdateTimer = setInterval(() => {
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    steamTF2UpdatePlayerList.forEach((playerSteamID) => {
      updateSteamTF2DataForPlayer(steam, playerSteamID);
    });
    steamTF2UpdatePlayerList = [];
  }, 10000);
};

const startSteamBanUpdater = () => {
  if (typeof process.env.STEAM_KEY === 'undefined') {
    console.log('Env *STEAM_KEY* not configured, not updating steam-ban-data.');
    return;
  }

  steamBanUpdateTimer = setInterval(() => {
    const steam = new SteamApi({
      apiKey: process.env.STEAM_KEY,
      format: 'json',
    });
    updateSteamBanDataForPlayers(steam, steamBanUpdatePlayerList);
    steamBanUpdatePlayerList = [];
  }, 10000);
};

const startSteamPlaytimeUpdater = () => {
  steamPlaytimeUpdateTimer = setInterval(() => {
    steamPlaytimeUpdatePlayerList.forEach((playerSteamID) => {
      // Process one at a time via queue
      const currentAppId = Number(process.env.STEAM_APPID) || 0;
      getSteamGamePlaytime(playerSteamID, currentAppId, (playtime) => {
        const playerIndex = currentPlayerCollection.findIndex(
          (p) => p.SteamID === playerSteamID,
        );
        if (playerIndex !== -1) {
          currentPlayerCollection[playerIndex].SteamPlaytime =
            playtime.toString();
        }
      });
    });
    steamPlaytimeUpdatePlayerList = [];
  }, 10000);
};

const startDysStatsUpdater = () => {
  if (!process.env.DYSTATS_API_URL) {
    console.log('Env *DYSTATS_API_URL* not configured, not updating Dys stats.');
    return;
  }

  dysStatsUpdateTimer = setInterval(async () => {
    dysStatsUpdatePlayerList.forEach(async (playerSteamID) => {
      const stats = await getDysStats(playerSteamID);
      const playerIndex = currentPlayerCollection.findIndex(
        (p) => p.SteamID === playerSteamID,
      );

      if (playerIndex !== -1) {
        if (stats) {
          currentPlayerCollection[playerIndex].DysRank = stats.rank;
          currentPlayerCollection[playerIndex].DysPoints = stats.points;
          currentPlayerCollection[playerIndex].DysAssist = stats.assist;
          currentPlayerCollection[playerIndex].DysCyberdamage = stats.cyberdamage;
          currentPlayerCollection[playerIndex].DysCyberfrag = stats.cyberfrag;
          currentPlayerCollection[playerIndex].DysDamage = stats.damage;
          currentPlayerCollection[playerIndex].DysFrag = stats.frag;
          currentPlayerCollection[playerIndex].DysHack = stats.hack;
          currentPlayerCollection[playerIndex].DysHealing = stats.healing;
          currentPlayerCollection[playerIndex].DysObjective = stats.objective;
          currentPlayerCollection[playerIndex].DysSecondary = stats.secondary;
          currentPlayerCollection[playerIndex].DysTacscan = stats.tacscan;
          currentPlayerCollection[playerIndex].DysStatsLoaded = 'COMPLETED';

          const existingCacheIndex = currentDysStatsInformation.findIndex(
            (p) => p.SteamID === playerSteamID,
          );
          if (existingCacheIndex !== -1) {
            Object.assign(currentDysStatsInformation[existingCacheIndex], {
              ...currentPlayerCollection[playerIndex],
            });
          } else {
            const cachePlayer = { ...currentPlayerCollection[playerIndex] };
            currentDysStatsInformation.push(cachePlayer);
          }
        } else {
          // Set defaults for players with no stats
          currentPlayerCollection[playerIndex].DysRank = 0;
          currentPlayerCollection[playerIndex].DysPoints = 0;
          currentPlayerCollection[playerIndex].DysAssist = 0;
          currentPlayerCollection[playerIndex].DysCyberdamage = 0;
          currentPlayerCollection[playerIndex].DysCyberfrag = 0;
          currentPlayerCollection[playerIndex].DysDamage = 0;
          currentPlayerCollection[playerIndex].DysFrag = 0;
          currentPlayerCollection[playerIndex].DysHack = 0;
          currentPlayerCollection[playerIndex].DysHealing = 0;
          currentPlayerCollection[playerIndex].DysObjective = 0;
          currentPlayerCollection[playerIndex].DysSecondary = 0;
          currentPlayerCollection[playerIndex].DysTacscan = 0;
          currentPlayerCollection[playerIndex].DysStatsLoaded = 'COMPLETED';

          const cachePlayer = { ...currentPlayerCollection[playerIndex] };
          const existingCacheIndex = currentDysStatsInformation.findIndex(
            (p) => p.SteamID === playerSteamID,
          );
          if (existingCacheIndex !== -1) {
            Object.assign(currentDysStatsInformation[existingCacheIndex], cachePlayer);
          } else {
            currentDysStatsInformation.push(cachePlayer);
          }
        }
      }
    });
    dysStatsUpdatePlayerList = [];
  }, 10000);
};

/** Handle creating/removing shortcuts on Windows when installing/uninstalling. */
if (require('electron-squirrel-startup')) {
  app.quit();
}

const onAppExit = () => {
  console.log('[event] onAppExit!');
  if (rconManager) {
    rconManager.stop();
  }
};

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 */
app.on('ready', () => {
  console.log('[event] ready!');

  process.on('SIGTERM', () => handleExit(onAppExit));
  process.on('SIGHUP', () => handleExit(onAppExit));
  process.on('SIGQUIT', () => handleExit(onAppExit));
  process.on('SIGINT', () => handleExit(onAppExit));

  // Start the built-in RCON manager (replaces tf2-rcon.exe)
  startRconManager();

  startSteamProfileUpdater();
  if (process.env.STEAM_APPID === '440') {
    startSteamTF2Updater();
  }
  startSteamPlaytimeUpdater();
  startSteamBanUpdater();
  startPlayerReputationUpdateTimer();
  if (process.env.STEAM_APPID === '17580') {
    startDysStatsUpdater();
  }

  createAppWindow();
  installAppConfigHandler();

  setGetCurrentPlayerCollection(() => currentPlayerCollection);
  ipcMain.on('add-player-reputation', handleAddPlayerReputation);
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[event] before-quit!');

  if (rconManager) {
    rconManager.stop();
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

  if (dysStatsUpdateTimer) {
    clearInterval(dysStatsUpdateTimer);
    dysStatsUpdateTimer = null;
  }
});
