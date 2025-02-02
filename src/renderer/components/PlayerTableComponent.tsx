import * as React from 'react';
import { Grid } from '@mui/material';
import PlayerTableComponentProps from '@components/PlayerTableComponentProps';
import { PlayerInfo } from '@components/PlayerInfo';
import PlayerTeamTable from '@components/PlayerTeamTable';

// Component *PlayerTableComponent* describing the whole player scoreboard
export default function PlayerTableComponent({
  players,
  handleAddBlacklistSave,
  onTeamsAvailable,
}: PlayerTableComponentProps) {
  const getTeamPlayers = (ownTeam: boolean): PlayerInfo[] => {
    const mePlayer = players.find((element) => element.IsMe);

    if (mePlayer) {
      onTeamsAvailable(true);

      if (mePlayer.Team) {
        // Normal behavior: split based on Team property
        if (ownTeam) {
          return players.filter((element) => element.Team === mePlayer.Team);
        }

        return players.filter((element) => element.Team !== mePlayer.Team);
      }

      onTeamsAvailable(false);
      // Team is empty: split players 50/50 by index
      const half = Math.ceil(players.length / 2);
      const firstHalf = players.slice(0, half);
      const secondHalf = players.slice(half);

      return ownTeam ? firstHalf : secondHalf;
    }

    return [];
  };

  return (
    <Grid container spacing={2}>
      <PlayerTeamTable
        players={getTeamPlayers(true)}
        handleAddBlacklistSave={handleAddBlacklistSave}
      />
      <PlayerTeamTable
        players={getTeamPlayers(false)}
        handleAddBlacklistSave={handleAddBlacklistSave}
      />
    </Grid>
  );
}
