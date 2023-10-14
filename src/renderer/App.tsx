import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
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
    <div>
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
      <h1>Current Players</h1>
      <PlayerTableComponent players={players} />
      <h1>Debug</h1>
      <h2>Websocket</h2>
      <WebsocketComponent
        refreshPlayers={refreshPlayers}
        refreshReadyState={refreshReadyState}
      />
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
