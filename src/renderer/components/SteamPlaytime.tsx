import React from 'react';
import Playtime from './Playtime';
import TF2APIPlaytime from './TF2APIPlaytime';
import { AppConfig } from './AppConfig';

export default function SteamPlaytime(props: {
  hours: string;
  tf2Minutes: number;
  appConfig: AppConfig;
}) {
  const { hours, tf2Minutes, appConfig } = props;

  return (
    <div>
      <Playtime hours={hours} appConfig={appConfig} />
      {appConfig.SteamAppId === '440' && (
        <TF2APIPlaytime tf2Minutes={tf2Minutes} />
      )}
    </div>
  );
}
