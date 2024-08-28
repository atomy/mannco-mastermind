import { SteamGamePlayerDetailedStats } from './steamGamePlayerDetailedStats';

export interface SteamGamePlayerstats {
  steamID: string;
  gameName: string;
  stats: SteamGamePlayerDetailedStats[];
}
