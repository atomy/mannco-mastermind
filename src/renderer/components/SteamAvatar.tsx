import React from 'react';
import AnimatedImage from './AnimatedImage';
import { PlayerInfo } from '@components/PlayerInfo';

interface SteamAvatarProps {
  player: PlayerInfo;
}

export default function SteamAvatar({ player }: SteamAvatarProps) {
  // For the Steam Avatar logic
  const avatarSrc = player.SteamAvatarSmall ? player.SteamAvatarSmall : 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

  return (
    <AnimatedImage
      src={avatarSrc}
      alt="Avatar"
      width="32px" // Assuming 32px is the desired size
      style={{ paddingLeft: '6px', paddingRight: '6px' }} // No borderRadius here
    />
  );
};

