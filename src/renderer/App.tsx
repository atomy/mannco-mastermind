import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import PlayerTableComponent from './PlayerTableComponent';
import { PlayerInfo } from './PlayerInfo';
import { RconAppLogEntry } from './RconAppLogEntry';
import RconClientLogs from './RconClientLogs';

function Main() {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [rconClientLogs, setRconClientLogs] = useState<RconAppLogEntry[]>([]);

  const refreshPlayers = (playerCollection: PlayerInfo[]) => {
    // Get current Unix timestamp in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Filter out PlayerInfo objects with LastSeen greater than 60 seconds ago
    const filteredPlayerCollection = playerCollection.filter((playerInfo) => {
      return currentTime - playerInfo.LastSeen <= 60;
    });

    let foundMe = false;

    filteredPlayerCollection.forEach((player) => {
      // console.log(`Setting player: ${JSON.stringify(player)}`);
      if (player.IsMe) {
        foundMe = true;
      }
    });

    setPlayers(filteredPlayerCollection);
  };

  const addRconClientLogMessage = (logEntry: RconAppLogEntry) => {
    const updatedLogs = [...rconClientLogs, logEntry];

    // Sort the array by logEntry.Timestamp in descending order
    updatedLogs.sort((a, b) => b.Timestamp - a.Timestamp);

    // Ensure the array length does not exceed 1000
    if (updatedLogs.length > 1000) {
      updatedLogs.splice(1000);
    }

    setRconClientLogs(updatedLogs);
  };

  const handleAddBlacklistSave = (
    steamid: string,
    type: string,
    reason: string,
  ) => {
    const blacklistedPlayer = players.find((pl) => {
      return pl.SteamID === steamid;
    });

    if (blacklistedPlayer) {
      console.log(`Blacklisting ${steamid} -- ${type} -- ${reason}`);
      window.electron.ipcRenderer.sendBlacklist({
        steamid,
        type,
        reason,
      });
    }
  };

  useEffect(() => {
    const playerDataListener = (playerInfoCollection: PlayerInfo[]) => {
      refreshPlayers(playerInfoCollection);
    };

    const rconAppLogListener = (logMessage: RconAppLogEntry) => {
      addRconClientLogMessage(logMessage);
    };

    window.electron.ipcRenderer.on('player-data', playerDataListener);
    window.electron.ipcRenderer.onApplicationLogMessage(
      'rcon-applog',
      rconAppLogListener,
    );
  }); // Empty dependency array means this effect will run once, similar to componentDidMount

  return (
    <div className="content">
      <div className="player-list">
        <h1>Current Players</h1>
        <PlayerTableComponent
          players={players}
          handleAddBlacklistSave={handleAddBlacklistSave}
        />
        <RconClientLogs logs={rconClientLogs} />
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
