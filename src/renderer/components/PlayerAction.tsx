import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { PlayerInfo } from './PlayerInfo';
import PlayerSetReputationAction from './PlayerSetReputationAction';

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

  // Determine the color based on whether player.PlayerReputationType is not undefined
  const iconColor = player.IsMe ? '#6b6a65' : '#913a1e';

  return (
    <>
      <IconButton
        disabled={player.IsMe}
        aria-label="delete"
        size="small"
        onClick={handlePlayerAddBlacklistActionOpen}
        sx={{
          minWidth: 24,
        }}
      >
        <EditIcon sx={{ color: iconColor }} />
      </IconButton>
      <PlayerSetReputationAction
        player={player}
        open={playerAddBlacklistActionOpen}
        handleClose={handlePlayerAddBlacklistActionClose}
        handleSave={handleAddBlacklistSave}
      />
    </>
  );
}
