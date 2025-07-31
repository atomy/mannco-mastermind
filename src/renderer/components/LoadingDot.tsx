import React from 'react';
import { PlayerInfo } from './PlayerInfo';

// Loading spinner component (same as in SteamTF2Playtime)
function LoadingSpinner() {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <span
        style={{
          display: 'inline-block',
          animation: 'spin 1s linear infinite',
        }}
      >
        ⏳
      </span>
    </>
  );
}

interface LoadingDotProps {
  player: PlayerInfo;
}

const LoadingDot: React.FC<LoadingDotProps> = ({ player }) => {
  return (
    <div
      style={{
        display: 'inline-block',
        margin: '0 2px',
        cursor: 'pointer',
      }}
      title={`${player.Name} - Loading reputation data...`}
    >
      <LoadingSpinner />
    </div>
  );
};

export default LoadingDot;
