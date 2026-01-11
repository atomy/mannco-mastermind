import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';
import { AppConfig } from '@components/AppConfig';
import AnimatedImage from '@components/AnimatedImage';
import SteamAvatar from '@components/SteamAvatar';
import ClassIcon from '@components/ClassIcon';
import getCountryCode from '@components/GetCountryCode';
import getCountryName from '@components/GetCountryName';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

interface PlayerNameCellProps {
  row: PlayerInfo;
  appConfig: AppConfig;
}

export default function PlayerNameCell({
  row,
  appConfig,
}: PlayerNameCellProps) {
  const countryFlagSrc = row.SteamCountryCode
    ? `https://flagcdn.com/h40/${getCountryCode(row.SteamCountryCode).toLowerCase()}.png`
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Flag_of_None.svg/2560px-Flag_of_None.svg.png';

  const altText = row.SteamCountryCode
    ? `Players Country: ${getCountryCode(row.SteamCountryCode)}`
    : 'Players country: Unknown';

  const titleText = row.SteamCountryCode
    ? getCountryName(row.SteamCountryCode)
    : 'Country information unavailable';

  const playerName = row.Name || '';
  const maxLength = 16;
  const isNameTruncated = playerName.length > maxLength;
  const displayName = isNameTruncated 
    ? playerName.substring(0, maxLength) + '...'
    : playerName;

  return (
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
      {appConfig?.AppId === '440' && <ClassIcon player={row} />}
      <SteamAvatar player={row} />
      {isNameTruncated ? (
        <Tooltip title={playerName} arrow>
          <span
            style={{
              paddingLeft: '10px',
            }}
          >
            {displayName}
          </span>
        </Tooltip>
      ) : (
        <span
          style={{
            paddingLeft: '10px',
          }}
        >
          {displayName}
        </span>
      )}
    </StyledTableCell>
  );
}

