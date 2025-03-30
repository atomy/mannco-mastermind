import React from 'react';
import { PlayerInfo } from '@components/PlayerInfo';
import { Grid } from '@mui/material';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import TableBody from '@mui/material/TableBody';
import PlayerTableRow from '@components/PlayerTableRow';
import { styled } from '@mui/system';
import TableCell from '@mui/material/TableCell';
import { AppConfig } from '@components/AppConfig';

interface PlayerTeamTableProps {
  players: PlayerInfo[];
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
  appConfig: AppConfig;
}

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

// Component *PlayerTeamTable* describing a player-table for a collection of players
export default function PlayerTeamTable({
  players,
  handleAddBlacklistSave,
  appConfig,
}: PlayerTeamTableProps) {
  return (
    <Grid item sm={6}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell align="left">Steam</StyledTableCell>
            <StyledTableCell align="right">
              P/L
              <Tooltip title="Ping in ms / Packetloss">
                <InfoIcon color="primary" fontSize="small" />
              </Tooltip>
            </StyledTableCell>
            <StyledTableCell align="right">Playtime</StyledTableCell>
            <StyledTableCell align="right">Age</StyledTableCell>
            <StyledTableCell align="right">Reputation</StyledTableCell>
            <StyledTableCell align="right">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <PlayerTableRow
              key={player.SteamID.toString()}
              row={player}
              handleAddBlacklistSave={handleAddBlacklistSave}
              appConfig={appConfig}
            />
          ))}
        </TableBody>
      </Table>
    </Grid>
  );
}
