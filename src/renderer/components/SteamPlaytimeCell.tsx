import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';
import { AppConfig } from '@components/AppConfig';
import SteamPlaytime from '@components/SteamPlaytime';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

interface SteamPlaytimeCellProps {
  row: PlayerInfo;
  appConfig: AppConfig;
}

export default function SteamPlaytimeCell({
  row,
  appConfig,
}: SteamPlaytimeCellProps) {
  return (
    <StyledTableCell align="right">
      {row.SteamPlaytime &&
      (row.SteamPlaytime === 'IN_PROGRESS' ||
        (!Number.isNaN(Number(row.SteamPlaytime)) &&
          Number(row.SteamPlaytime) >= 0)) ? (
        <SteamPlaytime
          hours={row.SteamPlaytime}
          tf2Minutes={row.SteamTF2Playtime}
          appConfig={appConfig}
        />
      ) : (
        '-'
      )}
    </StyledTableCell>
  );
}

