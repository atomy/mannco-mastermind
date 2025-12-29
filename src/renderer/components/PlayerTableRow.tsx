import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/system';
import SteamAccountAge from '@components/SteamAccountAge';
import { PlayerInfo } from '@components/PlayerInfo';
import { AppConfig } from '@components/AppConfig';
import { getPlayerTableRowStyle } from '@components/getPlayerTableRowStyle';
import DystopiaStatsCell from '@components/DystopiaStatsCell';
import PlayerReputationCell from '@components/PlayerReputationCell';
import PlayerNameCell from '@components/PlayerNameCell';
import SteamProfileCell from '@components/SteamProfileCell';
import PlayerPingCell from '@components/PlayerPingCell';
import SteamPlaytimeCell from '@components/SteamPlaytimeCell';
import PlayerActionCell from '@components/PlayerActionCell';

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
  
  console.log('out (' + row.SteamID + '): ', JSON.stringify(row));

  // @ts-ignore
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} style={getPlayerTableRowStyle(row)}>
      <PlayerNameCell row={row} appConfig={appConfig} />
      <SteamProfileCell row={row} />
      <PlayerPingCell row={row} />
      <SteamPlaytimeCell row={row} appConfig={appConfig} />
      <StyledTableCell align="right">
        <SteamAccountAge steamCreatedTimestamp={row.SteamCreatedTimestamp} />
      </StyledTableCell>
      {/* Stats column only for Dystopia (appid 17580) */}
      {appConfig?.SteamAppId === '17580' && (
        <DystopiaStatsCell row={row} appConfig={appConfig} />
      )}
      <PlayerReputationCell row={row} appConfig={appConfig} />
      <PlayerActionCell
        row={row}
        handleAddBlacklistSave={handleAddBlacklistSave}
      />
    </TableRow>
  );
}
