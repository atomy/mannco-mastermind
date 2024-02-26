import React from 'react';
import { RconAppLogEntry } from './RconAppLogEntry';

const containerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '97vw',
  height: '200px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  overflowY: 'scroll', // Add this to enable scrolling if the content exceeds the box height
  color: 'black',
  paddingLeft: '10px',
} as React.CSSProperties;

export default function RconClientLogs(props: { logs: RconAppLogEntry[] }) {
  const { logs } = props;

  return (
    <div style={containerStyle}>
      {logs.length > 0 ? (
        <ul style={{ paddingLeft: '10px' }}>
          {logs.map((logEntry) => (
            <li key={logEntry.Timestamp}>{logEntry.Message}</li>
          ))}
        </ul>
      ) : (
        <p>- No logs have been received yet -</p>
      )}
    </div>
  );
}
