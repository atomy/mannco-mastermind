/**
 * Log Watcher for TF2 console.log
 * Tails the log file and emits events for parsed data
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';
import {
  LogParser,
  PlayerInfo,
  ChatInfo,
  FragInfo,
} from './logParser';

export class LogWatcher extends EventEmitter {
  private logPath: string;
  private fileHandle: fs.FSWatcher | null = null;
  private filePosition = 0;
  private isReading = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(logPath?: string) {
    super();
    this.logPath = logPath || this.detectLogPath();
  }

  /**
   * Auto-detect the log path based on OS
   */
  private detectLogPath(): string {
    const platform = os.platform();
    const envPath = process.env.TF2_LOGPATH;

    if (envPath) {
      console.log('[LogWatcher] Using TF2_LOGPATH:', envPath);
      return envPath;
    }

    let defaultPath = '';

    switch (platform) {
      case 'win32':
        defaultPath =
          'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Team Fortress 2\\tf\\console.log';
        break;
      case 'darwin':
        defaultPath =
          '/Users/Shared/Steam/steamapps/common/Team Fortress 2/tf/console.log';
        break;
      case 'linux':
        const username = os.userInfo().username;
        defaultPath = path.join(
          os.homedir(),
          '.local/share/Steam/steamapps/common/Team Fortress 2/tf/console.log',
        );
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log('[LogWatcher] Default log path:', defaultPath);
    return defaultPath;
  }

  /**
   * Empty (truncate) the log file
   */
  async emptyLog(): Promise<void> {
    try {
      await fs.promises.truncate(this.logPath, 0);
      console.log('[LogWatcher] Log file emptied');
      this.filePosition = 0;
    } catch (err) {
      console.error('[LogWatcher] Failed to empty log:', err);
      throw err;
    }
  }

  /**
   * Start watching the log file
   */
  start(): void {
    console.log('[LogWatcher] Starting to tail:', this.logPath);

    // Check if file exists
    if (!fs.existsSync(this.logPath)) {
      throw new Error(`Log file not found: ${this.logPath}`);
    }

    // Get initial file size
    const stats = fs.statSync(this.logPath);
    this.filePosition = stats.size;

    // Poll the file for changes (more reliable than fs.watch for this use case)
    this.checkInterval = setInterval(() => {
      this.checkForNewLines();
    }, 100); // Check every 100ms

    this.emit('started');
  }

  /**
   * Stop watching the log file
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    if (this.fileHandle) {
      this.fileHandle.close();
      this.fileHandle = null;
    }

    this.emit('stopped');
    console.log('[LogWatcher] Stopped');
  }

  /**
   * Check for new lines in the log file
   */
  private async checkForNewLines(): Promise<void> {
    if (this.isReading) return;

    try {
      this.isReading = true;
      const stats = await fs.promises.stat(this.logPath);

      // File was truncated (game restart, etc.)
      if (stats.size < this.filePosition) {
        console.log('[LogWatcher] Log file was truncated, resetting position');
        this.filePosition = 0;
      }

      // No new data
      if (stats.size === this.filePosition) {
        return;
      }

      // Read new data
      const stream = fs.createReadStream(this.logPath, {
        start: this.filePosition,
        end: stats.size,
        encoding: 'utf8',
      });

      let buffer = '';

      stream.on('data', (chunk: string) => {
        buffer += chunk;
      });

      stream.on('end', () => {
        const lines = buffer.split(/\r?\n/);

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.length > 0) {
            this.processLine(line);
          }
        }

        // Keep incomplete last line for next read
        if (lines.length > 0 && !buffer.endsWith('\n')) {
          // Keep partial line
        } else {
          this.filePosition = stats.size;
        }

        this.isReading = false;
      });

      stream.on('error', (err) => {
        console.error('[LogWatcher] Read error:', err);
        this.isReading = false;
      });
    } catch (err) {
      console.error('[LogWatcher] Check error:', err);
      this.isReading = false;
    }
  }

  /**
   * Process a single log line
   */
  private processLine(line: string): void {
    this.emit('line', line);

    // Check for lobby updates or player connections (trigger for status command)
    if (
      line.includes('Lobby updated') ||
      (line.includes('connected') && !line.includes('uniqueid'))
    ) {
      this.emit('lobby-update', line);
    }

    // Try to parse as player info
    const playerInfo = LogParser.parsePlayerInfo(line);
    if (playerInfo) {
      this.emit('player-info', playerInfo);
      return;
    }

    // Try to parse as chat
    const chatInfo = LogParser.parseChat(line);
    if (chatInfo) {
      this.emit('chat', chatInfo);

      // Check for commands
      const command = LogParser.parseCommand(chatInfo.Message);
      if (command) {
        this.emit('command', {
          ...command,
          playerName: chatInfo.PlayerName,
        });
      }
      return;
    }

    // Try to parse as frag
    const fragInfo = LogParser.parseFrag(line);
    if (fragInfo) {
      this.emit('frag', fragInfo);
      return;
    }
  }

  /**
   * Get the current log path
   */
  getLogPath(): string {
    return this.logPath;
  }
}
