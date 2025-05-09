import React from 'react';
import DotWithTooltip from '@components/DotWithTooltip';
import VacBanned from './VacBanned';
import { PlayerInfo } from './PlayerInfo';

export default function PlayerMarker(props: { player: PlayerInfo }) {
  const { player } = props;

  // Determine the color based on PlayerReputationType
  const getDotColor = (reputationType: string | undefined) => {
    if (['cheat', 'bot'].includes(reputationType ?? '')) {
      return 'red';
    }
    if (['warn', 'spy', 'sniper', 'minusrep'].includes(reputationType ?? '')) {
      return 'yellow';
    }
    if (['plusrep'].includes(reputationType ?? '')) {
      return 'green';
    }
    if (['skillplus'].includes(reputationType ?? '')) {
      return 'purple';
    }
    if (['skillneutral'].includes(reputationType ?? '')) {
      return 'grey';
    }
    if (['skillminus'].includes(reputationType ?? '')) {
      return 'black';
    }
    return null;
  };

  const dotColor = getDotColor(player.PlayerReputationType);

  return (
    (player.SteamBanDaysSinceLastBan > 0 && (
      <VacBanned
        strongWarning={player.SteamBanDaysSinceLastBan < 365}
        number={player.SteamBanDaysSinceLastBan}
      />
    )) ||
    (dotColor && <DotWithTooltip player={player} color={dotColor} />)
  );
}
