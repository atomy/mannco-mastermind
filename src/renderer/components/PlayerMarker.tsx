import React from 'react';
import DotWithTooltip from '@components/DotWithTooltip';
import VacBanned from './VacBanned';
import LoadingDot from './LoadingDot';
import { PlayerInfo } from './PlayerInfo';
import { AppConfig } from './AppConfig';

// Reputation type constants
const REPUTATION_TYPES = {
  CHEAT: 'cheat',
  BOT: 'bot',
  WARN: 'warn',
  SPY: 'spy',
  SNIPER: 'sniper',
  MINUS_REP: 'minusrep',
  PLUS_REP: 'plusrep',
  SKILL_PLUS: 'skillplus',
  SKILL_NEUTRAL: 'skillneutral',
  SKILL_MINUS: 'skillminus',
  IN_PROGRESS: 'IN_PROGRESS',
};

export default function PlayerMarker(props: {
  player: PlayerInfo;
  appConfig?: AppConfig;
}) {
  const { player, appConfig } = props;

  // Reputation type to color mapping
  const REPUTATION_COLOR_MAP = {
    [REPUTATION_TYPES.CHEAT]: 'red',
    [REPUTATION_TYPES.BOT]: 'red',
    [REPUTATION_TYPES.WARN]: 'yellow',
    [REPUTATION_TYPES.SPY]: 'yellow',
    [REPUTATION_TYPES.SNIPER]: 'yellow',
    [REPUTATION_TYPES.MINUS_REP]: 'yellow',
    [REPUTATION_TYPES.PLUS_REP]: 'green',
    [REPUTATION_TYPES.SKILL_PLUS]: 'purple',
    [REPUTATION_TYPES.SKILL_NEUTRAL]: 'grey',
    [REPUTATION_TYPES.SKILL_MINUS]: 'black',
  } as const;

  // Determine the color based on PlayerReputationType
  const getDotColor = (reputationType: string | undefined) => {
    const type = reputationType ?? '';
    return (
      REPUTATION_COLOR_MAP[type as keyof typeof REPUTATION_COLOR_MAP] || null
    );
  };

  const dotColor = getDotColor(player.PlayerReputationType);

  // Check for VAC ban first
  if (player.SteamBanDaysSinceLastBan > 0) {
    return (
      <VacBanned
        strongWarning={player.SteamBanDaysSinceLastBan < 365}
        number={player.SteamBanDaysSinceLastBan}
      />
    );
  }

  // Check for loading state
  if (player.PlayerReputationType === REPUTATION_TYPES.IN_PROGRESS) {
    return <LoadingDot player={player} />;
  }

  // Check for reputation color
  if (dotColor) {
    return <DotWithTooltip player={player} color={dotColor} appConfig={appConfig} />;
  }

  return null;
}
