import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import Link from '@mui/material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import { Grid } from '@mui/material';
import { PlayerInfo } from './PlayerInfo';
import PlayerAction from './PlayerAction';
import PlayerWarning from './PlayerWarning';
import SteamAccountAge from './SteamAccountAge';
import Playtime from './Playtime';
import { loadPlayerWarnings } from '../main/playerWarnings';

interface PlayerTableComponentProps {
  players: PlayerInfo[];
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
}

function Row(props: {
  row: PlayerInfo;
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
}) {
  const { row, handleAddBlacklistSave } = props;

  // Determine background-color of row based on various player attributes.
  const rowBackgroundColor = (): string => {
    if (row.IsMe) {
      return '#768a88';
    }

    if (['bot', 'cheat'].includes(row.PlayerWarningType)) {
      return '#bd3b3b';
    }

    if (['warn'].includes(row.PlayerWarningType)) {
      return '#ef9849';
    }

    return 'transparent';
  };

  // @ts-ignore
  return (
    <TableRow
      sx={{ '& > *': { borderBottom: 'unset' } }}
      style={{ backgroundColor: rowBackgroundColor() }}
    >
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
            color: row.SteamVisible < 3 ? '#34302d' : '',
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
      <TableCell align="right">
        <PlayerAction
          player={row}
          handleAddBlacklistSave={handleAddBlacklistSave}
        />
      </TableCell>
    </TableRow>
  );
}

export default function PlayerTableComponent({
  players,
  handleAddBlacklistSave,
}: PlayerTableComponentProps) {
  const getTeamPlayers = (ownTeam: boolean): PlayerInfo[] => {
    const mePlayer = players.find((element) => {
      if (element.IsMe) {
        return element;
      }

      return undefined;
    });

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
              <TableCell>Name</TableCell>
              <TableCell align="right">Steam</TableCell>
              <TableCell align="right">
                P/L
                <Tooltip title="Ping in ms / Packetloss">
                  <InfoIcon color="primary" fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="right">Playtime | AccountAge</TableCell>
              <TableCell align="right">Warnings</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTeamPlayers(true).map((player) => (
              <Row
                key={player.SteamID.toString()}
                row={player}
                handleAddBlacklistSave={handleAddBlacklistSave}
              />
            ))}
          </TableBody>
        </Table>
      </Grid>
      <Grid item sm={6}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Steam</TableCell>
              <TableCell align="right">
                P/L
                <Tooltip title="Ping in ms / Packetloss">
                  <InfoIcon color="primary" fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell align="right">Playtime | AccountAge</TableCell>
              <TableCell align="right">Warnings</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTeamPlayers(false).map((player) => (
              <Row
                key={player.SteamID.toString()}
                row={player}
                handleAddBlacklistSave={handleAddBlacklistSave}
              />
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}
