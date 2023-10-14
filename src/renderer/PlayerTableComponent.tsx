import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
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
      <TableRow>
        <TableCell colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Additional data
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
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
            <TableCell />
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
