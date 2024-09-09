import { PlayerInfo } from '@components/PlayerInfo';
import { RconAppLogEntry } from '@components/RconAppLogEntry';
import { RconAppFragEntry } from '@components/RconAppFragEntry';

export interface PlayerDataListener {
  (playerInfoCollection: PlayerInfo[]): void;
}

// Define the interface for the RCON app log listener function
export interface RconAppLogListener {
  (logMessage: RconAppLogEntry): void;
}

// Define the interface for the RCON app frag listener function
export interface RconAppFragListener {
  (fragMessage: RconAppFragEntry): void;
}

// Define the interface for the tf2 class request listener function
export interface Tf2ClassRequestListener {
  (weaponEntityName: string, killerSteamID: string): void;
}
