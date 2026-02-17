/**
 * Log Parser for TF2 console logs
 * Parses player info, chat, kills, etc. from console.log
 */

export interface PlayerInfo {
  SteamID: string;
  Name: string;
  UserID: number;
  SteamAccType: string;
  SteamUniverse: number;
  Connected: string;
  Ping: number;
  Loss: number;
  State: string;
  LastSeen: number;
  Team?: string;
  MemberType?: string;
  Type?: string;
  IsMe?: boolean;
}

export interface ChatInfo {
  PlayerName: string;
  Message: string;
}

export interface FragInfo {
  KillerName: string;
  VictimName: string;
  KillerSteamID: string;
  VictimSteamID: string;
  Weapon: string;
  Crit: boolean;
}

export interface LobbyDebugPlayer {
  MemberType: string;
  SteamID: string;
  Team: string;
  Type: string;
}

export class LogParser {
  // Regex patterns (converted from Grok patterns in Go code)
  private static readonly PLAYER_PATTERN =
    /^# +(\d+) "(.+?)" +\[([A-Z]+):(\d+):(\d+)\] +([0-9:]+) +(\d+) +(\d+) +(\w+)$/;

  private static readonly PLAYER_NAME_PATTERN =
    /"(.+?)"\s+=\s+"(.+?)"\s+\(\s+def\.\s+"(.+?)"\s+\)/;

  private static readonly CHAT_PATTERN =
    /^(?:(?:\*DEAD\*(?:\(TEAM\))?)|(?:\(TEAM\)))?(?:\s)?(.+?)\s+:\s{2}(.+?)$/;

  private static readonly FRAG_PATTERN =
    /^(.+?) killed (.+?) with (.+?)\.\s*(\(crit\))?$/;

  private static readonly LOBBY_PATTERN =
    /^\s+(\w+)\[\d+\]\s+\[([A-Z]+):(\d+):(\d+)\]\s+team = (\w+)\s+type = (\w+)$/;

  private static readonly COMMAND_PATTERN = /^!(\w+)\s*(.*)$/;

  /**
   * Parse player info from status output
   */
  static parsePlayerInfo(line: string): PlayerInfo | null {
    const match = line.match(this.PLAYER_PATTERN);
    if (!match) {
      return null;
    }

    const [
      ,
      userId,
      userName,
      steamAccType,
      steamUniverse,
      steamID32,
      connectedTime,
      ping,
      loss,
      state,
    ] = match;

    const steamID64 = this.steam3IDToSteam64(parseInt(steamID32, 10));

    return {
      SteamID: steamID64,
      Name: userName,
      UserID: parseInt(userId, 10),
      SteamAccType: steamAccType,
      SteamUniverse: parseInt(steamUniverse, 10),
      Connected: connectedTime,
      Ping: parseInt(ping, 10),
      Loss: parseInt(loss, 10),
      State: state,
      LastSeen: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Parse player name from 'name' command response
   */
  static parsePlayerName(response: string): string | null {
    const processed = response.replace(/\n/g, '');
    const match = processed.match(this.PLAYER_NAME_PATTERN);
    if (!match) {
      return null;
    }
    return match[2];
  }

  /**
   * Parse chat message
   */
  static parseChat(line: string): ChatInfo | null {
    const match = line.match(this.CHAT_PATTERN);
    if (!match) {
      return null;
    }

    return {
      PlayerName: match[1],
      Message: match[2].trim(),
    };
  }

  /**
   * Parse frag/kill event
   */
  static parseFrag(line: string): Omit<FragInfo, 'KillerSteamID' | 'VictimSteamID'> | null {
    const match = line.match(this.FRAG_PATTERN);
    if (!match) {
      return null;
    }

    return {
      KillerName: match[1],
      VictimName: match[2],
      Weapon: match[3],
      Crit: !!match[4],
      KillerSteamID: '',
      VictimSteamID: '',
    };
  }

  /**
   * Parse lobby debug output
   */
  static parseLobbyDebugLine(line: string): LobbyDebugPlayer | null {
    const match = line.match(this.LOBBY_PATTERN);
    if (!match) {
      return null;
    }

    const [, memberType, steamAccType, steamUniverse, steamID32, team, type] =
      match;

    const steamID64 = this.steam3IDToSteam64(parseInt(steamID32, 10));

    return {
      MemberType: memberType,
      SteamID: steamID64,
      Team: team,
      Type: type,
    };
  }

  /**
   * Parse entire lobby debug response
   */
  static parseLobbyResponse(response: string): LobbyDebugPlayer[] {
    const lines = response.split('\n');
    const players: LobbyDebugPlayer[] = [];

    for (const line of lines) {
      if (line.trim().length === 0) continue;

      const player = this.parseLobbyDebugLine(line);
      if (player) {
        players.push(player);
      }
    }

    return players;
  }

  /**
   * Parse command from chat message
   */
  static parseCommand(message: string): { command: string; args: string } | null {
    const match = message.match(this.COMMAND_PATTERN);
    if (!match) {
      return null;
    }

    return {
      command: match[1],
      args: match[2].trim(),
    };
  }

  /**
   * Find lobby player by SteamID
   */
  static findLobbyPlayerBySteamID(
    lobbyPlayers: LobbyDebugPlayer[],
    steamID: string,
  ): LobbyDebugPlayer | null {
    return lobbyPlayers.find((p) => p.SteamID === steamID) || null;
  }

  /**
   * Convert Steam3 ID to Steam64 ID
   */
  static steam3IDToSteam64(steam3ID: number): string {
    const baseSteamID = BigInt('76561197960265728');
    const steam64 = baseSteamID + BigInt(steam3ID);
    return steam64.toString();
  }

  /**
   * Get SteamID from player name
   */
  static getSteamIDFromPlayerName(
    playerName: string,
    players: PlayerInfo[],
  ): string | null {
    const player = players.find((p) => p.Name === playerName);
    return player ? player.SteamID : null;
  }
}
