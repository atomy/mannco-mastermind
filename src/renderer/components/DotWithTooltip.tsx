import React, { useState } from 'react';
import { PlayerInfo } from '@components/PlayerInfo';

export default function DotWithTooltip(props: {
  player: PlayerInfo;
  color: string;
}) {
  const { player, color } = props;

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width="20px"
        height="20px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <circle cx="10" cy="10" r="10" fill={color} />
      </svg>

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
          [{player.PlayerReputationType}] {player.PlayerReputationInfo}
        </div>
      )}
    </div>
  );
}
