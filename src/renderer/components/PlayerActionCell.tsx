import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';
import PlayerAction from '@components/PlayerAction';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

interface PlayerActionCellProps {
  row: PlayerInfo;
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
}

export default function PlayerActionCell({
  row,
  handleAddBlacklistSave,
}: PlayerActionCellProps) {
  return (
    <StyledTableCell align="right">
      <PlayerAction
        player={row}
        handleAddBlacklistSave={handleAddBlacklistSave}
      />
    </StyledTableCell>
  );
}

