import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import Link from '@mui/material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import { PlayerInfo } from './PlayerInfo';

interface PlayerTableComponentProps {
  players: PlayerInfo[];
}

function Row(props: { row: PlayerInfo }) {
  interface TeamMapping {
    [key: string]: string;
  }

  const { row } = props;

  // Teams are indeed the other way around.
  const teamMapping: TeamMapping = {
    TF_GC_TEAM_INVADERS: 'Attackers',
    TF_GC_TEAM_DEFENDERS: 'Defenders',
    MEMBER: 'No Team',
  };

  // @ts-ignore
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell component="th" scope="row">
        <img src={row.SteamAvatarSmall} alt="Avatar" />
      </TableCell>
      <TableCell component="th" scope="row">
        {row.Name}
      </TableCell>
      <TableCell align="right">
        <Link
          target="_blank"
          rel="noreferrer"
          href={`https://steamcommunity.com/profiles/${row.SteamID}`}
        >
          Profile
        </Link>
      </TableCell>
      <TableCell align="right">{row.Connected}</TableCell>
      <TableCell align="right">
        {row.Ping > 200 && row.State !== 'spawning' ? (
          <WarningIcon color="warning" fontSize="small" />
        ) : (
          ''
        )}{' '}
        {row.Ping} / {row.Loss}
        {row.Loss > 1 && row.State !== 'spawning' ? (
          <WarningIcon color="warning" fontSize="small" />
        ) : (
          ''
        )}
      </TableCell>
      <TableCell align="right">{row.State}</TableCell>
      <TableCell align="right">{teamMapping[row.Team] || row.Team}</TableCell>
    </TableRow>
  );
}

export default function PlayerTableComponent({
  players,
}: PlayerTableComponentProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Steam</TableCell>
            <TableCell align="right">Connected</TableCell>
            <TableCell align="right">
              P/L
              <Tooltip title="Ping in ms / Packetloss">
                <InfoIcon color="primary" fontSize="small" />
              </Tooltip>
            </TableCell>
            <TableCell align="right">State</TableCell>
            <TableCell align="right">Team</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <Row key={player.SteamID.toString()} row={player} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
