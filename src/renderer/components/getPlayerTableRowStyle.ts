import * as React from 'react';
import { PlayerInfo } from '@components/PlayerInfo';
import sniperImage from '@assets/banners/sniper.png';
import spyImage from '@assets/banners/spy.png';
import faImage from '@assets/banners/fa.png';
import ownImage from '@assets/banners/own.png';
import warnImage from '@assets/banners/warn.png';
import plusrepImage from '@assets/banners/plusrep.png';
import cheatImage from '@assets/banners/cheat.png';

export function getPlayerTableRowStyle(row: PlayerInfo): React.CSSProperties {
  if (row.IsMe) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${ownImage})`,
      backgroundSize: 'contain',
      backgroundColor: '#768a88',
    };
  }

  if (['bot'].includes(row.PlayerReputationType)) {
    return {
      backgroundColor: '#bd3b3b',
    };
  }

  if (['sniper'].includes(row.PlayerReputationType)) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${sniperImage})`,
      backgroundSize: 'contain',
    };
  }

  if (['cheat'].includes(row.PlayerReputationType)) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${cheatImage})`,
      backgroundSize: 'contain',
    };
  }

  if (['plusrep'].includes(row.PlayerReputationType)) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${plusrepImage})`,
      backgroundSize: 'contain',
    };
  }

  if (['spy'].includes(row.PlayerReputationType)) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${spyImage})`,
      backgroundSize: 'contain',
    };
  }

  if (['minusrep'].includes(row.PlayerReputationType)) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${faImage})`,
      backgroundSize: 'contain',
    };
  }

  if (['warn'].includes(row.PlayerReputationType)) {
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${warnImage})`,
      backgroundSize: 'contain',
    };
  }

  return {
    backgroundColor: 'transparent',
  };
}

