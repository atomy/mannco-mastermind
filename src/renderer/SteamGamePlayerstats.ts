import { SteamGamePlayerDetailedStats } from './SteamGamePlayerDetailedStats';

export interface SteamGamePlayerstats {
  steamID: string;
  gameName: string;
  stats: SteamGamePlayerDetailedStats[];
}
