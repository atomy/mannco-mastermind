import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import {
  PlayerDataListener,
  RconAppFragListener,
  RconAppLogListener,
  Tf2ClassRequestListener,
  AppConfigListener,
} from '@main/window/listenerInterfaces';
import { TeamClassFeedback } from '@components/TeamClassFeedback';
import TeamClassContext from '@components/context/TeamClassContext';
import getClassFeedback from '@components/helper/getClassFeedback';
import PlayerTableComponent from './PlayerTableComponent';
import { PlayerInfo } from './PlayerInfo';
import { RconAppLogEntry } from './RconAppLogEntry';
import BottomBox from './footer/BottomBox';
import { RconAppFragEntry } from './RconAppFragEntry';
import useRemoteConfigHook from './hooks/useRemoteConfigHook';
import { AppConfig } from './AppConfig';
import '@styles/app.scss';

function Main() {
  const { weaponsDbConfig, isWeaponsDbConfigLoading, weaponDbConfigError } =
    useRemoteConfigHook();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [rconClientLogs, setRconClientLogs] = useState<RconAppLogEntry[]>([]);
  const [rconClientFrags, setRconClientFrags] = useState<RconAppFragEntry[]>(
    [],
  );
  const [teamsAvailable, setTeamsAvailable] = useState<boolean>(false);
  const [teamClassFeedback, setTeamClassFeedback] =
    useState<TeamClassFeedback>(null);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  const refreshPlayers = useCallback((playerCollection: PlayerInfo[]) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const filteredPlayerCollection = playerCollection.filter((playerInfo) => {
      return currentTime - playerInfo.LastSeen <= 60;
    });
    setPlayers(filteredPlayerCollection);
  }, []);

  // Function to determine the TF2 classes based on weapon entity name and Remote Config data
  const determineClassesFromWeaponEntityName = (
    weaponEntityName: string,
    config: any,
  ): string[] => {
    const matchingClasses: string[] = [];

    // Loop through each class in the config
    // eslint-disable-next-line
    for (const weaponClass of config.classes) {
      // Loop through each weapon in the class
      // eslint-disable-next-line
      for (const weapon of weaponClass.weapons) {
        if (weapon.weaponId === weaponEntityName) {
          matchingClasses.push(weaponClass.className);
        }
      }
    }

    // Check if no matching classes were found and log an error
    if (matchingClasses.length === 0) {
      const errorMessage = `Error: Unknown weaponEntityName '${weaponEntityName}'\n`;

      console.error(errorMessage);

      return ['Unknown'];
    }

    return matchingClasses;
  };

  const onTeamsAvailable = (available: boolean) => {
    setTeamsAvailable(available);
  };

  const addRconClientLogMessage = useCallback((logEntry: RconAppLogEntry) => {
    setRconClientLogs((prevLogs) => {
      const updatedLogs = [...prevLogs, logEntry];
      updatedLogs.sort((a, b) => b.Timestamp - a.Timestamp);
      if (updatedLogs.length > 1000) {
        updatedLogs.splice(1000);
      }
      return updatedLogs;
    });
  }, []);

  const addRconClientFragMessage = useCallback(
    (fragEntry: RconAppFragEntry) => {
      setRconClientFrags((prevFrags) => {
        const updatedFrags = [...prevFrags, fragEntry];
        updatedFrags.sort((a, b) => b.Timestamp - a.Timestamp);
        if (updatedFrags.length > 1000) {
          updatedFrags.splice(1000);
        }
        return updatedFrags;
      });
    },
    [],
  );

  const handleAddBlacklistSave = useCallback(
    (steamid: string, type: string, reason: string) => {
      const blacklistedPlayer = players.find((pl) => pl.SteamID === steamid);
      if (blacklistedPlayer) {
        console.log(`Blacklisting ${steamid} -- ${type} -- ${reason}`);
        (window as any).electronAPI.sendBlacklist({
          steamid,
          type,
          reason,
        });
      }
    },
    [players],
  );

  useEffect(() => {
    const playerDataListener: PlayerDataListener = (playerInfoCollection) => {
      refreshPlayers(playerInfoCollection);
    };

    const rconAppLogListener: RconAppLogListener = (logMessage) => {
      addRconClientLogMessage(logMessage);
    };

    const rconAppFragListener: RconAppFragListener = (fragMessage) => {
      addRconClientFragMessage(fragMessage);
    };

    const tf2ClassRequestListener: Tf2ClassRequestListener = (
      weaponEntityName: string,
      killerSteamID: string,
    ) => {
      if (isWeaponsDbConfigLoading || weaponDbConfigError) {
        (window as any).electronAPI.sendTf2ClassResponse({
          error: true,
          classNames: [],
          errorMessage: weaponDbConfigError,
          weaponEntityName: '',
          killerSteamID: '',
        });
      } else {
        const weaponsData = JSON.parse(weaponsDbConfig);
        const classNames = determineClassesFromWeaponEntityName(
          weaponEntityName,
          weaponsData,
        );
        (window as any).electronAPI.sendTf2ClassResponse({
          error: false,
          classNames,
          errorMessage: '',
          weaponEntityName,
          killerSteamID,
        });
      }
    };

    const appConfigListener: AppConfigListener = (config: AppConfig) => {
      console.log('[Application.tsx] Received app config:', {
        AppId: config.AppId,
        Environment: config.Environment,
        SteamKey: config.SteamKey,
        SteamAppId: config.SteamAppId,
        SteamPlaytimeApiUrl: config.SteamPlaytimeApiUrl,
        PlayerReputationApiUrl: config.PlayerReputationApiUrl,
        PlayerReputationApiKey: config.PlayerReputationApiKey,
        Tf2RconAutostart: config.Tf2RconAutostart,
        AutoOpenDevtools: config.AutoOpenDevtools,
        Tf2LogPath: config.Tf2LogPath,
      });
      setAppConfig(config);
    };

    // Register all listeners
    (window as any).electronAPI.onPlayerData(playerDataListener);
    (window as any).electronAPI.onRconAppLog(rconAppLogListener);
    (window as any).electronAPI.onRconAppFrag(rconAppFragListener);
    (window as any).electronAPI.onTf2ClassRequest(tf2ClassRequestListener);
    (window as any).electronAPI.onAppConfig(appConfigListener);

    // Request app config from main process
    console.log('[Application.tsx] Requesting app config from main process');
    (window as any).electronAPI.getAppConfig();

    // Cleanup when the component is unmounted
    return () => {
      (window as any).electronAPI.removeAllListeners('get-tf2-class');
      (window as any).electronAPI.removeAllListeners('player-data');
      (window as any).electronAPI.removeAllListeners('rcon-applog');
      (window as any).electronAPI.removeAllListeners('rcon-appfrag');
      (window as any).electronAPI.removeAllListeners('app-config');
    };
  }, [
    addRconClientFragMessage,
    addRconClientLogMessage,
    isWeaponsDbConfigLoading,
    refreshPlayers,
    weaponDbConfigError,
    weaponsDbConfig,
  ]);

  useEffect(() => {
    setTeamClassFeedback(getClassFeedback(players));
  }, [players]);

  return (
    <TeamClassContext.Provider value={teamClassFeedback}>
      <div id="content">
        <div className="player-list">
          <h1 style={{ paddingLeft: '10px' }}>
            Current Players{' '}
            {!teamsAvailable && (
              <span
                style={{ fontSize: '0.8rem', color: 'red', marginLeft: '10px' }}
              >
                No Team Information available!
              </span>
            )}
          </h1>
          <PlayerTableComponent
            players={players}
            handleAddBlacklistSave={handleAddBlacklistSave}
            onTeamsAvailable={onTeamsAvailable}
            appConfig={appConfig}
          />
          <BottomBox
            consoleContent={rconClientLogs}
            chatContent={rconClientLogs}
            fragContent={rconClientFrags}
            players={players}
            appConfig={appConfig}
          />
        </div>
      </div>
    </TeamClassContext.Provider>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
