import * as React from 'react';
import { Grid } from '@mui/material';
import PlayerTableComponentProps from '@components/PlayerTableComponentProps';
import { PlayerInfo } from '@components/PlayerInfo';
import PlayerTeamTable from '@components/PlayerTeamTable';

// Component *PlayerTableComponent* describing the whole player scoreboard
export default function PlayerTableComponent({
  players,
  handleAddBlacklistSave,
}: PlayerTableComponentProps) {
  const getTeamPlayers = (ownTeam: boolean): PlayerInfo[] => {
    const mePlayer = players.find((element) => element.IsMe);

    if (mePlayer) {
      if (ownTeam) {
        return players.filter((element) => element.Team === mePlayer.Team);
      }

      return players.filter((element) => element.Team !== mePlayer.Team);
    }

    return [];
  };

  return (
    <Grid container spacing={2}>
      <PlayerTeamTable players={getTeamPlayers(true)} handleAddBlacklistSave={handleAddBlacklistSave}></PlayerTeamTable>
      <PlayerTeamTable players={getTeamPlayers(false)} handleAddBlacklistSave={handleAddBlacklistSave}></PlayerTeamTable>
    </Grid>
  );
}
