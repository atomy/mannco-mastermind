import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { FormControl, Select } from '@mui/material';
import { PlayerInfo } from './PlayerInfo';

interface PlayerAddBlacklistActionProps {
  player: PlayerInfo;
  open: boolean;
  handleClose: () => void; // This denotes a function that doesn't take any arguments and doesn't return anything
  handleSave: (steamid: string, type: string, reason: string) => void;
}

export default function PlayerAddBlacklistAction({
  player,
  open,
  handleClose,
  handleSave,
}: PlayerAddBlacklistActionProps) {
  const [reason, setReason] = useState('');
  const [type, setType] = useState('');

  const handleSaveClose = () => {
    // Placeholder for saving data
    handleClose(); // Close the modal after saving
    handleSave(player.SteamID, type, reason);
  };

  // Modal style
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    outline: 'none',
    color: '#f08149',
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add marker to player `{player.Name}`
        </Typography>
        <Typography component="h4">(Steam: {player.SteamID})</Typography>
        <FormControl fullWidth>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{ mt: 2, mb: 1 }}
          >
            <MenuItem value="" disabled>
              Select Type
            </MenuItem>
            <MenuItem value="bot">Bot</MenuItem>
            <MenuItem value="cheat">Cheat</MenuItem>
            <MenuItem value="warn">Warn</MenuItem>
            <MenuItem value="minusrep">-Rep</MenuItem>
            <MenuItem value="sniper">-SniperAllDay</MenuItem>
            <MenuItem value="spy">-SpyAllDay</MenuItem>
            <MenuItem value="plusrep">+Rep</MenuItem>
          </Select>
          <TextField
            label="Reason"
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={handleClose} sx={{ mr: 1 }}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveClose}
              disabled={!type}
            >
              Save
            </Button>
          </Box>
        </FormControl>
      </Box>
    </Modal>
  );
}
