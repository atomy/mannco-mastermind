import React from 'react';
import { PlayerInfo } from './PlayerInfo';
import Vac from '../../assets/icons/vac.png';

export default function PlayerWarning(props: { player: PlayerInfo }) {
  const { player } = props;

  return (
    player.SteamBanDaysSinceLastBan > 0 && (
      <img
        width="20px"
        title={`Days since last ban: ${player.SteamBanDaysSinceLastBan}`}
        src={Vac}
        alt={`Days since last ban: ${player.SteamBanDaysSinceLastBan}`}
      />
    )
  );
}
