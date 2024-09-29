import React from 'react';
import Blacklist from '@assets/icons/blacklist.png';
import { PlayerInfo } from './PlayerInfo';

import VacBanned from './VacBanned';

export default function PlayerWarning(props: { player: PlayerInfo }) {
  const { player } = props;

  return (
    (player.SteamBanDaysSinceLastBan > 0 && (
      <VacBanned
        strongWarning={player.SteamBanDaysSinceLastBan < 365 ?? false}
        number={player.SteamBanDaysSinceLastBan}
      />
    )) ||
    (player.PlayerWarningType &&
      ['cheat', 'bot', 'warn', 'spy', 'sniper', 'fa'].includes(
        player.PlayerWarningType,
      ) && (
        <img
          width="20px"
          title={`Type: '${player.PlayerWarningType}' Reason: '${player.PlayerWarningReason}'`}
          src={Blacklist}
          alt={`Type: '${player.PlayerWarningType}' Reason: '${player.PlayerWarningReason}'`}
        />
      ))
  );
}
