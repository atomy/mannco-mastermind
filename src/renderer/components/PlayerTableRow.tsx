import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/system';
import getCountryName from '@components/GetCountryName';
import Playtime from './Playtime';
import SteamAccountAge from '@components/SteamAccountAge';
import PlayerWarning from '@components/PlayerWarning';
import PlayerAction from '@components/PlayerAction';
import { PlayerInfo } from '@components/PlayerInfo';
import AnimatedImage from '@components/AnimatedImage';
import SteamAvatar from '@components/SteamAvatar';
import ClassIcon from '@components/ClassIcon';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

// Component *PlayerTableRow* describing one row in the players table showing all of the players information
export default function PlayerTableRow(props: {
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

  const countryFlagSrc = row.SteamCountryCode
    ? `https://flagcdn.com/h40/${row.SteamCountryCode.toLowerCase()}.png`
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Flag_of_None.svg/2560px-Flag_of_None.svg.png';

  const altText = row.SteamCountryCode
    ? `Players Country: ${row.SteamCountryCode}`
    : 'Players country: Unknown';

  const titleText = row.SteamCountryCode
    ? getCountryName(row.SteamCountryCode)
    : 'Country information unavailable';

  // @ts-ignore
  return (
    <TableRow
      sx={{ '& > *': { borderBottom: 'unset' } }}
      style={{ backgroundColor: rowBackgroundColor() }}
    >
      <StyledTableCell component="th" scope="row">
        {/* Animated Country Flag */}
        <AnimatedImage
          src={countryFlagSrc}
          alt={altText}
          title={titleText}
          width="30px"
          style={{ paddingRight: '4px' }}
        />
        <ClassIcon player={row}></ClassIcon>
        <SteamAvatar player={row}></SteamAvatar>
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
