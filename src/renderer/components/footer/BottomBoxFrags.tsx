import React from 'react';
import { RconAppFragEntry } from '../RconAppFragEntry';

function BottomBoxFrags({ frags }: { frags: RconAppFragEntry[] }) {
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp); // Use timestamp directly as milliseconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
  };

  // Helper function to pad names to 64 characters
  const padName = (name: string, len: number) => name.padEnd(len, ' ');

  return (
    <div style={{ paddingLeft: '10px' }}>
      {frags.length > 0 ? (
        <ul
          style={{
            paddingLeft: '0',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
          }}
        >
          {frags.map((fragEntry) => (
            <li key={fragEntry.Key}>
              {formatTimestamp(fragEntry.Timestamp)}{' '}
              {padName(fragEntry.KillerName, 50)} ⚔{' '}
              {padName(fragEntry.VictimName, 50)}{' '}
              {padName(fragEntry.Weapon, 32)} {fragEntry.Crit ? '★★★' : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p>- No frag entries have been received yet -</p>
      )}
    </div>
  );
}

export default BottomBoxFrags;
