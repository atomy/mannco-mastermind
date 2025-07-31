/**
 * Interface for playtime request queue items
 */
export interface PlaytimeRequest {
  playerSteamId: string;
  appId: number;
  callback: (playtime: number) => void;
}
