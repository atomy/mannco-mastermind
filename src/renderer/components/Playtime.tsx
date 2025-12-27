import React from 'react';
import { AppConfig } from './AppConfig';

// Loading spinner component
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

// Playtime component
export default function Playtime({
  hours,
  appConfig,
}: {
  hours: string;
  appConfig: AppConfig;
}) {
  let steamPlaytimeDisplay;
  if (hours === 'IN_PROGRESS') {
    steamPlaytimeDisplay = <LoadingSpinner />;
  } else if (!Number.isNaN(Number(hours)) && Number(hours) >= 0) {
    steamPlaytimeDisplay = `${hours} hours`;
  } else {
    steamPlaytimeDisplay = 'N/A';
  }

  const gameShortname = appConfig.SteamGameShortname || 'TF2';
  const isTF2 = appConfig.SteamAppId === '440';

  return (
    <div>
      {isTF2 ? `Steam-${gameShortname}: ` : ''}
      {steamPlaytimeDisplay}
    </div>
  );
}
