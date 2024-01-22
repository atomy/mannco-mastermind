import { PlayerInfo } from './PlayerInfo';

export interface PlayerUpdate {
  Type: string;
  CurrentPlayers: PlayerInfo[];
}
