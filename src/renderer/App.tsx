import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import PlayerTableComponent from './PlayerTableComponent';
import WebsocketComponent from './WebsocketComponent';
import WebsocketsReadyState from './WebsocketsReadyState';

function Main() {
  const [players, setPlayers] = useState([]);
  const [readyState, setReadyState] = useState(ReadyState.UNINSTANTIATED);

  const refreshPlayers = (jsonPlayers: string) => {
    setPlayers(JSON.parse(jsonPlayers));
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
