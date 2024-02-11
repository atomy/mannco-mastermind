export interface PlayerInfo {
  Name: string;
  SteamID: string;
  Connected: string;
  Ping: number;
  Loss: number;
  State: string;
  LastSeen: number;
  MemberType: string;
  Type: string;
  Team: string;
  IsMe: boolean;
  SteamProfileDataLoaded: string;
  SteamTF2DataLoaded: string;
  SteamBanDataLoaded: string;
  SteamBanCommunityBanned: boolean;
  SteamBanNumberOfGameBans: number;
  SteamBanEconomyBan: string;
  SteamBanVACBanned: boolean;
  SteamBanVACBans: number;
  SteamBanDaysSinceLastBan: number;
  SteamTF2Playtime: number;
  SteamURL: string;
  SteamAvatarSmall: string;
  SteamAvatarMedium: string;
  SteamAvatarFull: string;
  SteamVisible: number;
  SteamCreatedTimestamp: number;
  SteamCountryCode: string;
  SteamConfigured: number;
  PlayerWarningReason: string;
}
