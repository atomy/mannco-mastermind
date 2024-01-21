import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import PlayerTableComponent from './PlayerTableComponent';
import WebsocketComponent from './WebsocketComponent';
import WebsocketsReadyState from './WebsocketsReadyState';
import { PlayerInfo } from './PlayerInfo';

function Main() {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [readyState, setReadyState] = useState(ReadyState.UNINSTANTIATED);

  const refreshPlayers = (jsonPlayers: string) => {
    const playerCollection: PlayerInfo[] = JSON.parse(jsonPlayers);
    // Get current Unix timestamp in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Filter out PlayerInfo objects with LastSeen greater than 60 seconds ago
    const filteredPlayerCollection = playerCollection.filter((playerInfo) => {
      return currentTime - playerInfo.LastSeen <= 60;
    });

    filteredPlayerCollection.forEach((player) => {
      //console.log(`Setting player: ${JSON.stringify(player)}`);
    });

    setPlayers(filteredPlayerCollection);
  };

  const refreshReadyState = (updatedReadyState: ReadyState) => {
    setReadyState(updatedReadyState);
  };

  return (
    <div className="content">
      <div className="connection-status">
        <h1>Status</h1>
        <div>
          <span>
            Connection to backend: <WebsocketsReadyState value={readyState} />
          </span>
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
        <h1>Debug</h1>
        <h2>Websocket</h2>
        <WebsocketComponent
          refreshPlayers={refreshPlayers}
          refreshReadyState={refreshReadyState}
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
