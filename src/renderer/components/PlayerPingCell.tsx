import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

interface PlayerPingCellProps {
  row: PlayerInfo;
}

export default function PlayerPingCell({ row }: PlayerPingCellProps) {
  return (
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
  );
}

