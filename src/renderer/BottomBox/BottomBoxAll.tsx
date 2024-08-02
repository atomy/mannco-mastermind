import React from 'react';
import { RconAppLogEntry } from '../RconAppLogEntry';

function BottomBoxAll({ logs }: { logs: RconAppLogEntry[] }) {
  return logs.length > 0 ? (
    <ul style={{ paddingLeft: '10px' }}>
      {logs.map((logEntry) => (
        <li key={logEntry.Key}>[CONSOLE]{logEntry.Message}</li>
      ))}
    </ul>
  ) : (
    <p>- [ALL] No entries available -</p>
  );
}

export default BottomBoxAll;
