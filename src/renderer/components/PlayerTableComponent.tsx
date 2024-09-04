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
import { styled } from '@mui/system';
import Demoman from '@assets/icons/classes/demoman.png';
import Scout from '@assets/icons/classes/scout.png';
import Soldier from '@assets/icons/classes/soldier.png';
import Pyro from '@assets/icons/classes/pyro.png';
import Heavy from '@assets/icons/classes/heavy.png';
import Engineer from '@assets/icons/classes/engineer.png';
import Medic from '@assets/icons/classes/medic.png';
import Sniper from '@assets/icons/classes/sniper.png';
import Spy from '@assets/icons/classes/spy.png';
import AllClass from '@assets/icons/classes/allclass.png';
import Playtime from './Playtime';
import SteamAccountAge from './SteamAccountAge';
import PlayerWarning from './PlayerWarning';
import PlayerAction from './PlayerAction';
import { PlayerInfo } from './PlayerInfo';

const classIconMap = {
  demoman: Demoman,
  scout: Scout,
  soldier: Soldier,
  pyro: Pyro,
  heavy: Heavy,
  engineer: Engineer,
  medic: Medic,
  sniper: Sniper,
  spy: Spy,
};

// Define the keys of the classIconMap
type ClassNames = keyof typeof classIconMap;

interface PlayerTableComponentProps {
  players: PlayerInfo[];
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
}

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

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

    if (['plusrep'].includes(row.PlayerWarningType)) {
      return '#008000';
    }

    return 'transparent';
  };

  const getClassIcon = (className: string): string => {
    const classLowerCaseName = className.toLowerCase() as ClassNames;

    if (!classIconMap[classLowerCaseName]) {
      console.error(
        `Unable to locate class '${classLowerCaseName}' in classIconMap!`,
      );
    }
    return classIconMap[classLowerCaseName] || '';
  };

  // @ts-ignore
  return (
    <TableRow
      sx={{ '& > *': { borderBottom: 'unset' } }}
      style={{ backgroundColor: rowBackgroundColor() }}
    >
      <StyledTableCell component="th" scope="row">
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
        {row.TF2Class && row.TF2Class !== 'Unknown' && (
          <img
            width="26px"
            style={{ paddingLeft: '6px', paddingRight: '6px' }}
            src={getClassIcon(row.TF2Class)}
            alt="Class"
          />
        )}
        {(!row.TF2Class || row.TF2Class === 'Unknown') && (
          <img
            width="26px"
            style={{ paddingLeft: '6px', paddingRight: '6px' }}
            src={AllClass}
            alt="Class"
          />
        )}
        {row.SteamAvatarSmall && (
          <img src={row.SteamAvatarSmall} alt="Avatar" />
        )}
        <span style={{ paddingLeft: '10px' }}>{row.Name}</span>
      </StyledTableCell>
      <StyledTableCell align="right">
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
      </StyledTableCell>
      <StyledTableCell align="right">
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
      </StyledTableCell>
      <StyledTableCell align="right">
        <Playtime seconds={row.SteamTF2Playtime} /> |{' '}
        <SteamAccountAge steamCreatedTimestamp={row.SteamCreatedTimestamp} />
      </StyledTableCell>
      <StyledTableCell align="right">
        <PlayerWarning player={row} />
      </StyledTableCell>
      <StyledTableCell align="right">
        <PlayerAction
          player={row}
          handleAddBlacklistSave={handleAddBlacklistSave}
        />
      </StyledTableCell>
    </TableRow>
  );
}

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
      <Grid item sm={6}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell align="right">Steam</StyledTableCell>
              <StyledTableCell align="right">
                P/L
                <Tooltip title="Ping in ms / Packetloss">
                  <InfoIcon color="primary" fontSize="small" />
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="right">
                Playtime | AccountAge
              </StyledTableCell>
              <StyledTableCell align="right">Warnings</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
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
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell align="right">Steam</StyledTableCell>
              <StyledTableCell align="right">
                P/L
                <Tooltip title="Ping in ms / Packetloss">
                  <InfoIcon color="primary" fontSize="small" />
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="right">
                Playtime | AccountAge
              </StyledTableCell>
              <StyledTableCell align="right">Warnings</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
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
