import React from 'react';
import { PlayerInfo } from './PlayerInfo';
import VacRed from '../../assets/icons/vac-red.png';
import VacGrey from '../../assets/icons/vac-grey.png';
import Blacklist from '../../assets/icons/blacklist.png';

export default function PlayerWarning(props: { player: PlayerInfo }) {
  const { player } = props;

  return (
    (player.SteamBanDaysSinceLastBan > 0 &&
      player.SteamBanDaysSinceLastBan < 1000 && (
        <img
          width="20px"
          title={`Days since last ban: ${player.SteamBanDaysSinceLastBan}`}
          src={VacRed}
          alt={`Days since last ban: ${player.SteamBanDaysSinceLastBan}`}
        />
      )) ||
    (player.SteamBanDaysSinceLastBan >= 1000 && (
      <img
        width="20px"
        title={`Days since last ban: ${player.SteamBanDaysSinceLastBan}`}
        src={VacGrey}
        alt={`Days since last ban: ${player.SteamBanDaysSinceLastBan}`}
      />
    )) ||
    (typeof player.PlayerWarningReason !== 'undefined' && (
      <img
        width="20px"
        title={`Reason: ${player.PlayerWarningReason}`}
        src={Blacklist}
        alt={`Reason: ${player.PlayerWarningReason}`}
      />
    ))
  );
}
