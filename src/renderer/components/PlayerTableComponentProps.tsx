import { PlayerInfo } from '@components/PlayerInfo';

interface PlayerTableComponentProps {
  players: PlayerInfo[];
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
}

export default PlayerTableComponentProps;
