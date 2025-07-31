import React from 'react';
import SteamTF2Playtime from './SteamTF2Playtime';
import TF2APIPlaytime from './TF2APIPlaytime';

export default function SteamPlaytime(props: {
  hours: string;
  tf2Minutes: number;
}) {
  const { hours, tf2Minutes } = props;

  return (
    <div>
      <SteamTF2Playtime hours={hours} />
      <TF2APIPlaytime tf2Minutes={tf2Minutes} />
    </div>
  );
}
