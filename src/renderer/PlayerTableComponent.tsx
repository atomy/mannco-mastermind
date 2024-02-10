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
import { Grid } from '@mui/material';
import { PlayerInfo } from './PlayerInfo';
import PlayerWarning from './PlayerWarning';
import SteamAccountAge from './SteamAccountAge';
import Playtime from './Playtime';

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
        {row.SteamCountryCode ? (
          <img
            width="30px"
            src={`https://flagcdn.com/h40/${row.SteamCountryCode.toLowerCase()}.png`}
            style={{ paddingRight: '4px' }}
            alt={`Players Country: ${row.SteamCountryCode}`}
          />
        ) : (
          <img
            width="30px"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Flag_of_None.svg/2560px-Flag_of_None.svg.png"
            style={{ paddingRight: '4px' }}
            alt="Players country: Unknown"
          />
        )}
        {row.SteamAvatarSmall && (
          <img src={row.SteamAvatarSmall} alt="Avatar" />
        )}
        <span style={{ paddingLeft: '10px' }}>{row.Name}</span>
      </TableCell>
      <TableCell align="right">
        <Link
          target="_blank"
          rel="noreferrer"
          href={`https://steamcommunity.com/profiles/${row.SteamID}`}
          style={{
            color: row.SteamVisible < 3 ? 'red' : '',
            backgroundColor: row.SteamConfigured > 1 ? 'red' : 'transparent',
          }}
          title={row.SteamVisible < 3 ? 'Steam-Profile is private' : ''}
        >
          Profile
        </Link>
      </TableCell>
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
      <TableCell align="right">
        <Playtime seconds={row.SteamTF2Playtime} /> |{' '}
        <SteamAccountAge steamCreatedTimestamp={row.SteamCreatedTimestamp} />
      </TableCell>
      <TableCell align="right">
        <PlayerWarning player={row} />
      </TableCell>
    </TableRow>
  );
}

export default function PlayerTableComponent({
  players,
}: PlayerTableComponentProps) {
  const getTeamPlayers = (ownTeam: boolean): PlayerInfo[] => {
    const mePlayer = players.find((element) => {
      console.log("me is: " + element.IsMe + " type: " + typeof element.IsMe + " name: " + element.Name);
      if (element.IsMe) {
        return element;
      }
    });
// console.log("me is: " + mePlayer);

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
      <Grid item sm={6}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Namev</TableCell>
              <TableCell align="right">Steam</TableCell>
              <TableCell align="right">
                P/L
                <Tooltip title="Ping in ms / Packetloss">
                  <InfoIcon color="primary" fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="right">AccountAge</TableCell>
              <TableCell align="right">Warnings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTeamPlayers(true).map((player) => (
              <Row key={player.SteamID.toString()} row={player} />
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid item sm={6}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Namev</TableCell>
              <TableCell align="right">Steam</TableCell>
              <TableCell align="right">
                P/L
                <Tooltip title="Ping in ms / Packetloss">
                  <InfoIcon color="primary" fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="right">AccountAge</TableCell>
              <TableCell align="right">Warnings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTeamPlayers(false).map((player) => (
              <Row key={player.SteamID.toString()} row={player} />
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}
