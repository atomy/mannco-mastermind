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

    // filteredPlayerCollection.forEach((player) => {
    //   console.log(`Setting player: ${JSON.stringify(player)}`);
    // });

    setPlayers(filteredPlayerCollection);
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
      <div className="connection-status">
        <h1>Status</h1>
        <div>
          <span>Connection to backend: IPC</span>
        </div>
        <div>
          <span>
            Connection to TF2: <span>✅</span>
          </span>
        </div>
      </div>
      <div className="player-list">
        <h1>Current Players</h1>
        <PlayerTableComponent players={players} />
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
