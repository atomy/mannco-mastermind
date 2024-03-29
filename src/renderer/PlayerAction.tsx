import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { PlayerInfo } from './PlayerInfo';
import PlayerAddBlacklistAction from './PlayerAddBlacklistAction';

export default function PlayerAction(props: {
  player: PlayerInfo;
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
}) {
  const { player, handleAddBlacklistSave } = props;

  const [playerAddBlacklistActionOpen, setPlayerAddBlacklistActionOpen] =
    useState(false);

  const handlePlayerAddBlacklistActionOpen = () =>
    setPlayerAddBlacklistActionOpen(true);

  const handlePlayerAddBlacklistActionClose = () =>
    setPlayerAddBlacklistActionOpen(false);

  // Determine the color based on whether player.PlayerWarningType is not undefined
  const iconColor =
    player.PlayerWarningType !== undefined ? '#6b6a65' : '#913a1e';

  // Enable the IconButton only if PlayerWarningType is undefined
  const isDisabled = player.PlayerWarningType !== undefined;

  return (
    <>
      <IconButton
        disabled={isDisabled}
        aria-label="delete"
        size="small"
        onClick={handlePlayerAddBlacklistActionOpen}
      >
        <AddCircleIcon sx={{ color: iconColor }} />
      </IconButton>
      <PlayerAddBlacklistAction
        player={player}
        open={playerAddBlacklistActionOpen}
        handleClose={handlePlayerAddBlacklistActionClose}
        handleSave={handleAddBlacklistSave}
      />
    </>
  );
}
