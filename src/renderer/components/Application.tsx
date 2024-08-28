import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import PlayerTableComponent from './PlayerTableComponent';
import { PlayerInfo } from './PlayerInfo';
import { RconAppLogEntry } from './RconAppLogEntry';
import BottomBox from './footer/BottomBox';
import { RconAppFragEntry } from './RconAppFragEntry';
import useRemoteConfigHook from './hooks/useRemoteConfigHook';
import '@styles/app.scss';
import { ipcRenderer } from 'electron';

function Main() {
  const { weaponsDbConfig, isWeaponsDbConfigLoading, weaponDbConfigError } =
    useRemoteConfigHook();
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [rconClientLogs, setRconClientLogs] = useState<RconAppLogEntry[]>([]);
  const [rconClientFrags, setRconClientFrags] = useState<RconAppFragEntry[]>(
    [],
  );

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
      console.error(`Error: Unknown weaponEntityName '${weaponEntityName}'`);
      return ['Unknown'];
    }

    return matchingClasses;
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
        // %TODO
        // window.electron.ipcRenderer.sendBlacklist({
        //   steamid,
        //   type,
        //   reason,
        // });
      }
    },
    [players],
  );

  const playerDataListener = (event: Electron.IpcRendererEvent, playerInfoCollection: PlayerInfo[]) => {
    refreshPlayers(playerInfoCollection);
  }

  const rconAppLogListener = (logMessage: RconAppLogEntry) => {
    addRconClientLogMessage(logMessage);
  };

  const rconAppFragListener = (fragMessage: RconAppFragEntry) => {
    // console.log(
    //   `rconAppFragListener() received: ${JSON.stringify(fragMessage)}`,
    // );
    addRconClientFragMessage(fragMessage);
  };

  useEffect(() => {
    // window.electron.ipcRenderer.on('player-data', playerDataListener); // %TODO, fix this
    // ipcRenderer.onApplicationLogMessage(
    //   'rcon-applog',
    //   rconAppLogListener,
    // );
    // window.electron.ipcRenderer.onApplicationFragMessage(
    //   'rcon-appfrag',
    //   rconAppFragListener,
    // );

    // Cleanup when the component is unmounted
    return () => {
      // %TODO
      // ipcRenderer.removeListener(
      //   'player-data',
      //   playerDataListener,
      // );
      // window.electron.ipcRenderer.removeListener(
      //   'rcon-applog',
      //   rconAppLogListener,
      // );
      // window.electron.ipcRenderer.removeListener(
      //   'rcon-appfrag',
      //   rconAppFragListener,
      // );
    };
  }, [refreshPlayers, addRconClientLogMessage, addRconClientFragMessage]); // Add dependencies to ensure proper behavior

  useEffect(() => {
    if (isWeaponsDbConfigLoading) {
      return;
    }

    const handleTf2ClassRequest = (weaponEntityName: string) => {
      // console.log(
      //   `handleTf2ClassRequest() in: ${weaponEntityName} - isWeaponsDbConfigLoading: ${isWeaponsDbConfigLoading} - weaponDbConfigError: ${weaponDbConfigError}`,
      // );

      if (isWeaponsDbConfigLoading || weaponDbConfigError) {
        // %TODO
        // window.electron.ipcRenderer.sendTf2ClassResponse({
        //   error: true,
        //   classNames: [],
        //   errorMessage: weaponDbConfigError,
        // });
      } else {
        const weaponsData = JSON.parse(weaponsDbConfig);
        const classNames = determineClassesFromWeaponEntityName(
          weaponEntityName,
          weaponsData,
        );
        // console.log(
        //   `Determined className ${JSON.stringify(classNames)} for weaponEntityName ${weaponEntityName}`,
        // );
        // %TODO
        // window.electron.ipcRenderer.sendTf2ClassResponse({
        //   error: false,
        //   classNames,
        // });
      }
    };

    // Set up IPC listener
    // %TODO
    // window.electron.ipcRenderer.onTf2ClassRequest(
    //   'get-tf2-class',
    //   handleTf2ClassRequest,
    // );

    // Cleanup function to remove the listener when component unmounts
    // eslint-disable-next-line consistent-return
    return () => {
      console.log('remove all listeners on *get-tf2-class*');
      // %TODO
      // window.electron.ipcRenderer.removeAllListeners('get-tf2-class');
    };
  }, [isWeaponsDbConfigLoading, weaponDbConfigError, weaponsDbConfig]); // Add dependencies to ensure proper behavior

  return (
    <div id="content">
      <div className="player-list">
        <h1 style={{ paddingLeft: '10px' }}>Current Players</h1>
        <PlayerTableComponent
          players={players}
          handleAddBlacklistSave={handleAddBlacklistSave}
        />
        <BottomBox
          consoleContent={rconClientLogs}
          chatContent={rconClientLogs}
          fragContent={rconClientFrags}
        />
      </div>
    </div>
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
