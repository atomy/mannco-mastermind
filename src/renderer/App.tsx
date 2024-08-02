import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState, useCallback } from 'react';
import PlayerTableComponent from './PlayerTableComponent';
import { PlayerInfo } from './PlayerInfo';
import { RconAppLogEntry } from './RconAppLogEntry';
import BottomBox from './BottomBox/BottomBox';
import { RconAppFragEntry } from './RconAppFragEntry';

function Main() {
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
        window.electron.ipcRenderer.sendBlacklist({
          steamid,
          type,
          reason,
        });
      }
    },
    [players],
  );

  useEffect(() => {
    const playerDataListener = (playerInfoCollection: PlayerInfo[]) => {
      refreshPlayers(playerInfoCollection);
    };

    const rconAppLogListener = (logMessage: RconAppLogEntry) => {
      addRconClientLogMessage(logMessage);
    };

    const rconAppFragListener = (fragMessage: RconAppFragEntry) => {
      // console.log(
      //   `rconAppFragListener() received: ${JSON.stringify(fragMessage)}`,
      // );
      addRconClientFragMessage(fragMessage);
    };

    window.electron.ipcRenderer.on('player-data', playerDataListener);
    window.electron.ipcRenderer.onApplicationLogMessage(
      'rcon-applog',
      rconAppLogListener,
    );
    window.electron.ipcRenderer.onApplicationFragMessage(
      'rcon-appfrag',
      rconAppFragListener,
    );

    // Cleanup when the component is unmounted
    return () => {
      window.electron.ipcRenderer.removeListener(
        'player-data',
        playerDataListener,
      );
      window.electron.ipcRenderer.removeListener(
        'rcon-applog',
        rconAppLogListener,
      );
      window.electron.ipcRenderer.removeListener(
        'rcon-appfrag',
        rconAppFragListener,
      );
    };
  }, [refreshPlayers, addRconClientLogMessage, addRconClientFragMessage]); // Add dependencies to ensure proper behavior

  return (
    <div className="content">
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
