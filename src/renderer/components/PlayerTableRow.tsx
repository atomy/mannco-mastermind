import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/system';
import getCountryName from '@components/GetCountryName';
import SteamAccountAge from '@components/SteamAccountAge';
import PlayerMarker from '@components/PlayerMarker';
import PlayerAction from '@components/PlayerAction';
import { PlayerInfo } from '@components/PlayerInfo';
import AnimatedImage from '@components/AnimatedImage';
import SteamAvatar from '@components/SteamAvatar';
import ClassIcon from '@components/ClassIcon';
import sniperImage from '@assets/banners/sniper.png';
import spyImage from '@assets/banners/spy.png';
import faImage from '@assets/banners/fa.png';
import ownImage from '@assets/banners/own.png';
import warnImage from '@assets/banners/warn.png';
import plusrepImage from '@assets/banners/plusrep.png';
import cheatImage from '@assets/banners/cheat.png';
import getCountryCode from '@components/GetCountryCode';
import SteamPlaytime from '@components/SteamPlaytime';
import { AppConfig } from '@components/AppConfig';

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
  appConfig: AppConfig;
}) {
  const { row, handleAddBlacklistSave, appConfig } = props;

  const rowStyle = (): any => {
    if (row.IsMe) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${ownImage})`,
        backgroundSize: 'contain',
        backgroundColor: '#768a88',
      };
    }

    if (['bot'].includes(row.PlayerReputationType)) {
      return {
        backgroundColor: '#bd3b3b',
      };
    }

    if (['sniper'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${sniperImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['cheat'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${cheatImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['plusrep'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${plusrepImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['spy'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${spyImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['minusrep'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${faImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['warn'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${warnImage})`,
        backgroundSize: 'contain',
      };
    }

    return {
      backgroundColor: 'transparent',
    };
  };

  const countryFlagSrc = row.SteamCountryCode
    ? `https://flagcdn.com/h40/${getCountryCode(row.SteamCountryCode).toLowerCase()}.png`
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Flag_of_None.svg/2560px-Flag_of_None.svg.png';

  const altText = row.SteamCountryCode
    ? `Players Country: ${getCountryCode(row.SteamCountryCode)}`
    : 'Players country: Unknown';

  const titleText = row.SteamCountryCode
    ? getCountryName(row.SteamCountryCode)
    : 'Country information unavailable';

  // @ts-ignore
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} style={rowStyle()}>
      <StyledTableCell
        component="th"
        scope="row"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '300px',
        }}
      >
        <AnimatedImage
          src={countryFlagSrc}
          alt={altText}
          title={titleText}
          width="30px"
          style={{ paddingRight: '4px' }}
        />
        {appConfig.AppId === '440' && <ClassIcon player={row} />}
        <SteamAvatar player={row} />
        <span
          style={{
            paddingLeft: '10px',
          }}
        >
          {row.Name}
        </span>
      </StyledTableCell>
      <StyledTableCell align="left">
        <Link
          target="_blank"
          rel="noreferrer"
          href={`https://steamcommunity.com/profiles/${row.SteamID}`}
          style={{
            color: row.SteamVisible < 3 ? 'red' : '',
          }}
          title={row.SteamVisible < 3 ? 'Steam-Profile is private' : ''}
        >
          {row.SteamVisible < 3 ? 'Private' : 'Profile'}
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
        <SteamPlaytime
          hours={row.SteamPlaytime}
          tf2Minutes={row.SteamTF2Playtime}
        />
      </StyledTableCell>
      <StyledTableCell align="right">
        <SteamAccountAge steamCreatedTimestamp={row.SteamCreatedTimestamp} />
      </StyledTableCell>
      <StyledTableCell align="right">
        <PlayerMarker player={row} />
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
