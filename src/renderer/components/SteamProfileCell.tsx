import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Link from '@mui/material/Link';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

interface SteamProfileCellProps {
  row: PlayerInfo;
}

export default function SteamProfileCell({ row }: SteamProfileCellProps) {
  return (
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
  );
}

