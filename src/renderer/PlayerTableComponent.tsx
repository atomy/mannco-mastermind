import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface PlayerInfo {
  Name: string;
  SteamID: string;
  Connected: string;
  Ping: number;
  Loss: number;
  State: string;
}

interface PlayerTableComponentProps {
  players: PlayerInfo[];
}

function Row(props: { row: PlayerInfo }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell component="th" scope="row">
          {row.Name}
        </TableCell>
        <TableCell align="right">{row.SteamID}</TableCell>
        <TableCell align="right">{row.Connected}</TableCell>
        <TableCell align="right">{row.Ping}</TableCell>
        <TableCell align="right">{row.Loss}</TableCell>
        <TableCell align="right">{row.State}</TableCell>
        <TableCell align="right">x</TableCell>
        <TableCell align="right">x</TableCell>
      </TableRow>
    </>
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
            <TableCell align="right">SteamID</TableCell>
            <TableCell align="right">Connected</TableCell>
            <TableCell align="right">Ping</TableCell>
            <TableCell align="right">Loss</TableCell>
            <TableCell align="right">State</TableCell>
            <TableCell align="right">Team</TableCell>
            <TableCell align="right">Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <Row key={player.SteamID} row={player} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
