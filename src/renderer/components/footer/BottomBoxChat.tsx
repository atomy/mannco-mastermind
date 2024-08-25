import React from 'react';
import { RconAppLogEntry } from '../RconAppLogEntry';

function BottomBoxChat({ logs }: { logs: RconAppLogEntry[] }) {
  return (
    <div style={{ paddingLeft: '10px' }}>
      {logs.length > 0 ? (
        <ul style={{ paddingLeft: '0' }}>
          {logs.map((logEntry) => (
            <li key={logEntry.Key}>{logEntry.Message}</li>
          ))}
        </ul>
      ) : (
        <p>- No chat entries have been received yet -</p>
      )}
    </div>
  );
}

export default BottomBoxChat;
