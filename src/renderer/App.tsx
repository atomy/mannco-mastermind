import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import PlayerTableComponent from './PlayerTableComponent';
import { PlayerInfo } from './PlayerInfo';

function Main() {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);

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
    window.electron.ipcRenderer.on(
      'player-data',
      (playerInfoCollection: PlayerInfo[]) => {
        refreshPlayers(playerInfoCollection);
      },
    );
  }, []);

  return (
    <div className="content">
      <div className="player-list">
        <h1>Current Players</h1>
        <PlayerTableComponent
          players={players}
          handleAddBlacklistSave={handleAddBlacklistSave}
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
