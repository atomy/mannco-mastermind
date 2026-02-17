/**
 * RCON Manager - Main coordinator for RCON client and log watcher
 * Replaces the Go TF2-RCON-MISC application
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import * as net from 'net';
import { RconClient } from './RconClient';
import { LogWatcher } from './LogWatcher';
import { LogParser, PlayerInfo, LobbyDebugPlayer } from './LogParser';

export class RconManager extends EventEmitter {
  private rconClient: RconClient | null = null;
  private logWatcher: LogWatcher | null = null;
  private players: PlayerInfo[] = [];
  private currentPlayerName: string | null = null;
  private lastLobbyDebugResponse = '';
  private lastUpdate = 0;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private playerExpirationInterval: NodeJS.Timeout | null = null;

  private readonly RCON_PORT = 27015;
  private readonly RCON_PASSWORD = '123';
  private readonly PLAYER_EXPIRATION_SECONDS = 20;
  private readonly UPDATE_CHECK_INTERVAL = 10000; // 10 seconds
  private readonly PLAYER_EXPIRATION_CHECK = 5000; // 5 seconds

  /**
   * Start the RCON manager
   */
  async start(): Promise<void> {
    console.log('[RconManager] Starting...');

    try {
      // Determine RCON host
      const rconHost = await this.determineRconHost();
      if (!rconHost) {
        throw new Error('Could not determine RCON host');
      }

      console.log(`[RconManager] RCON host determined: ${rconHost}`);

      // Connect to RCON
      this.rconClient = new RconClient(rconHost, this.RCON_PORT, this.RCON_PASSWORD);
      await this.rconClient.connect();

      // Get current player name
      const nameResponse = await this.rconClient.execute('name');
      this.currentPlayerName = LogParser.parsePlayerName(nameResponse);

      if (!this.currentPlayerName) {
        throw new Error('Could not parse player name');
      }

      console.log(`[RconManager] Current player: ${this.currentPlayerName}`);

      // Setup log watcher
      this.logWatcher = new LogWatcher();

      // Empty the log file
      await this.logWatcher.emptyLog();

      // Setup event handlers
      this.setupLogWatcherEvents();

      // Start watching the log
      this.logWatcher.start();

      // Start periodic update checks
      this.startUpdateChecker();

      // Start player expiration checker
      this.startPlayerExpirationChecker();

      // Emit initial status command
      await this.executeStatusCommands();

      this.emit('started');
      console.log('[RconManager] Started successfully');
    } catch (err) {
      console.error('[RconManager] Failed to start:', err);
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Stop the RCON manager
   */
  stop(): void {
    console.log('[RconManager] Stopping...');

    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }

    if (this.playerExpirationInterval) {
      clearInterval(this.playerExpirationInterval);
      this.playerExpirationInterval = null;
    }

    if (this.logWatcher) {
      this.logWatcher.stop();
      this.logWatcher = null;
    }

    if (this.rconClient) {
      this.rconClient.disconnect();
      this.rconClient = null;
    }

    this.emit('stopped');
    console.log('[RconManager] Stopped');
  }

  /**
   * Execute an RCON command
   */
  async executeCommand(command: string): Promise<string> {
    if (!this.rconClient || !this.rconClient.isReady()) {
      throw new Error('RCON not connected');
    }

    return await this.rconClient.execute(command);
  }

  /**
   * Get current players
   */
  getPlayers(): PlayerInfo[] {
    return this.players;
  }

  /**
   * Setup log watcher event handlers
   */
  private setupLogWatcherEvents(): void {
    if (!this.logWatcher) return;

    this.logWatcher.on('lobby-update', async (line: string) => {
      console.log('[RconManager] Lobby update detected:', line);
      await this.executeStatusCommands();
    });

    this.logWatcher.on('player-info', (playerInfo: PlayerInfo) => {
      this.updatePlayer(playerInfo);
      this.emitPlayerUpdate();
    });

    this.logWatcher.on('chat', (chatInfo) => {
      this.emit('chat', chatInfo);
    });

    this.logWatcher.on('command', (commandInfo) => {
      this.emit('command', commandInfo);
    });

    this.logWatcher.on('frag', (fragInfo) => {
      // Enrich frag with SteamIDs
      const killerSteamID = LogParser.getSteamIDFromPlayerName(
        fragInfo.KillerName,
        this.players,
      );
      const victimSteamID = LogParser.getSteamIDFromPlayerName(
        fragInfo.VictimName,
        this.players,
      );

      if (killerSteamID) fragInfo.KillerSteamID = killerSteamID;
      if (victimSteamID) fragInfo.VictimSteamID = victimSteamID;

      this.emit('frag', fragInfo);
    });

    this.logWatcher.on('line', (line: string) => {
      this.emit('log-line', line);
    });
  }

  /**
   * Execute status commands (status + tf_lobby_debug for TF2)
   */
  private async executeStatusCommands(): Promise<void> {
    try {
      if (!this.rconClient) return;

      await this.rconClient.execute('status');

      // Only execute tf_lobby_debug for TF2 (appid 440)
      if (process.env.STEAM_APPID === '440') {
        this.lastLobbyDebugResponse = await this.rconClient.execute(
          'tf_lobby_debug',
        );
      }

      this.lastUpdate = Math.floor(Date.now() / 1000);
    } catch (err) {
      console.error('[RconManager] Error executing status commands:', err);
      // Don't throw, just log - connection might recover
    }
  }

  /**
   * Update or add a player to the collection
   */
  private updatePlayer(playerInfo: PlayerInfo): void {
    // Parse lobby debug data if available
    let lobbyPlayers: LobbyDebugPlayer[] = [];
    if (
      this.lastLobbyDebugResponse &&
      !this.lastLobbyDebugResponse.includes('Failed to find lobby shared object')
    ) {
      lobbyPlayers = LogParser.parseLobbyResponse(this.lastLobbyDebugResponse);
    }

    // Mark if this is the current player
    if (playerInfo.Name === this.currentPlayerName) {
      playerInfo.IsMe = true;
    } else {
      playerInfo.IsMe = false;
    }

    // Enrich with lobby data
    const lobbyPlayer = LogParser.findLobbyPlayerBySteamID(
      lobbyPlayers,
      playerInfo.SteamID,
    );

    if (lobbyPlayer) {
      playerInfo.Team = lobbyPlayer.Team;
      playerInfo.Type = lobbyPlayer.Type;
      playerInfo.MemberType = lobbyPlayer.MemberType;
    }

    // Find existing player
    const existingIndex = this.players.findIndex(
      (p) => p.SteamID === playerInfo.SteamID,
    );

    if (existingIndex !== -1) {
      // Update existing player, preserving lobby fields if new ones are empty
      const existing = this.players[existingIndex];

      if (!playerInfo.Team && existing.Team) {
        playerInfo.Team = existing.Team;
      }
      if (!playerInfo.Type && existing.Type) {
        playerInfo.Type = existing.Type;
      }
      if (!playerInfo.MemberType && existing.MemberType) {
        playerInfo.MemberType = existing.MemberType;
      }

      this.players[existingIndex] = playerInfo;
    } else {
      // Add new player
      this.players.push(playerInfo);
    }

    this.lastUpdate = Math.floor(Date.now() / 1000);
  }

  /**
   * Expire players that haven't been seen recently
   */
  private expirePlayers(): void {
    const currentTime = Math.floor(Date.now() / 1000);
    const beforeCount = this.players.length;

    this.players = this.players.filter(
      (p) => p.LastSeen + this.PLAYER_EXPIRATION_SECONDS >= currentTime,
    );

    const afterCount = this.players.length;
    if (beforeCount !== afterCount) {
      console.log(
        `[RconManager] Expired ${beforeCount - afterCount} player(s)`,
      );
      this.emitPlayerUpdate();
    }
  }

  /**
   * Emit player update event
   */
  private emitPlayerUpdate(): void {
    this.emit('player-update', this.players);
  }

  /**
   * Start periodic update checker
   */
  private startUpdateChecker(): void {
    this.updateCheckInterval = setInterval(async () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceLastUpdate = currentTime - this.lastUpdate;

      if (timeSinceLastUpdate >= 10) {
        console.log(
          `[RconManager] No updates for ${timeSinceLastUpdate}s, executing status commands`,
        );
        await this.executeStatusCommands();
      }
    }, this.UPDATE_CHECK_INTERVAL);
  }

  /**
   * Start player expiration checker
   */
  private startPlayerExpirationChecker(): void {
    this.playerExpirationInterval = setInterval(() => {
      this.expirePlayers();
    }, this.PLAYER_EXPIRATION_CHECK);
  }

  /**
   * Determine the RCON host by scanning local IPs
   */
  private async determineRconHost(): Promise<string | null> {
    const hostIPs = this.getHostIPs();
    console.log('[RconManager] Scanning IPs for RCON:', hostIPs);

    for (const ip of hostIPs) {
      const isOpen = await this.scanPort(ip, this.RCON_PORT);
      if (isOpen) {
        console.log(`[RconManager] Found RCON at ${ip}:${this.RCON_PORT}`);
        return ip;
      }
    }

    return null;
  }

  /**
   * Get local IP addresses
   */
  private getHostIPs(): string[] {
    const interfaces = os.networkInterfaces();
    const ips: string[] = [];

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const addr of iface) {
        if (addr.family === 'IPv4' && !addr.internal) {
          ips.push(addr.address);
        }
      }
    }

    // Also try localhost
    ips.push('127.0.0.1');

    return ips;
  }

  /**
   * Scan a port to check if it's open
   */
  private async scanPort(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 2000;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        resolve(false);
      });

      socket.connect(port, host);
    });
  }
}
