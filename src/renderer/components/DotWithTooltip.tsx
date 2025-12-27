import React, { useState } from 'react';
import { PlayerInfo } from '@components/PlayerInfo';

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

import Link from '@mui/material/Link';
import { AppConfig } from './AppConfig';

export default function DotWithTooltip(props: {
  player: PlayerInfo;
  color: string;
  appConfig?: AppConfig;
}) {
  const { player, color, appConfig } = props;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={
          appConfig?.ReputationWwwUrl
            ? `${appConfig.ReputationWwwUrl.replace(/\/$/, '')}/id/${player.SteamID}`
            : '#'
        }
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'inline-block' }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          width="20px"
          height="20px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <circle cx="10" cy="10" r="10" fill={color} />
        </svg>
      </Link>

      {isHovered && (
        <div
          style={{
            visibility: 'visible',
            width: 'auto',
            backgroundColor: 'black',
            color: '#fff',
            textAlign: 'center',
            borderRadius: '5px',
            padding: '5px',
            position: 'absolute',
            zIndex: '1',
            bottom: '125%' /* Tooltip above the dot */,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          [
          {player.PlayerReputationType === 'IN_PROGRESS' ? (
            <LoadingSpinner />
          ) : (
            player.PlayerReputationType
          )}
          ] {player.PlayerReputationInfo}
        </div>
      )}
    </div>
  );
}
