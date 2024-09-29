import React from 'react';
import DotWithTooltip from '@components/DotWithTooltip';
import VacBanned from './VacBanned';
import { PlayerInfo } from './PlayerInfo';

export default function PlayerWarning(props: { player: PlayerInfo }) {
  const { player } = props;

  // Determine the color based on PlayerWarningType
  const getDotColor = (warningType: string | undefined) => {
    if (['cheat', 'bot'].includes(warningType ?? '')) {
      return 'red';
    }
    if (['warn', 'spy', 'sniper', 'minusrep'].includes(warningType ?? '')) {
      return 'yellow';
    }
    return null;
  };

  const dotColor = getDotColor(player.PlayerWarningType);

  return (
    (player.SteamBanDaysSinceLastBan > 0 && (
      <VacBanned
        strongWarning={player.SteamBanDaysSinceLastBan < 365 ?? false}
        number={player.SteamBanDaysSinceLastBan}
      />
    )) ||
    (dotColor && <DotWithTooltip player={player} color={dotColor} />)
  );
}
