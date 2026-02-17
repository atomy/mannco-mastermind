/**
 * RCON Client for Source Engine games (TF2, etc.)
 * Implements the Source RCON protocol
 */

import * as net from 'net';
import { EventEmitter } from 'events';

const SERVERDATA_AUTH = 3;
const SERVERDATA_AUTH_RESPONSE = 2;
const SERVERDATA_EXECCOMMAND = 2;
const SERVERDATA_RESPONSE_VALUE = 0;

interface RconPacket {
  size: number;
  id: number;
  type: number;
  body: string;
}

export class RconClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private host: string;
  private port: number;
  private password: string;
  private connected = false;
  private authenticated = false;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    { resolve: (value: string) => void; reject: (reason: Error) => void }
  >();

  constructor(host: string, port: number, password: string) {
    super();
    this.host = host;
    this.port = port;
    this.password = password;
  }

  /**
   * Connect to the RCON server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();

      this.socket.on('connect', async () => {
        console.log(`[RCON] Connected to ${this.host}:${this.port}`);
        this.connected = true;
        this.emit('connect');

        try {
          await this.authenticate();
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      this.socket.on('data', (data) => {
        this.handleData(data);
      });

      this.socket.on('error', (err) => {
        console.error('[RCON] Socket error:', err);
        this.emit('error', err);
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('[RCON] Connection closed');
        this.connected = false;
        this.authenticated = false;
        this.emit('disconnect');
      });

      this.socket.connect(this.port, this.host);
    });
  }

  /**
   * Authenticate with the RCON server
   */
  private async authenticate(): Promise<void> {
    const id = this.getRequestId();
    const authPacket = this.createPacket(id, SERVERDATA_AUTH, this.password);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: (response: string) => {
          this.authenticated = true;
          console.log('[RCON] Authenticated successfully');
          resolve();
        },
        reject,
      });

      if (this.socket) {
        this.socket.write(authPacket);
      } else {
        reject(new Error('Socket not connected'));
      }

      // Timeout after 5 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Authentication timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Execute a command on the RCON server
   */
  async execute(command: string): Promise<string> {
    if (!this.connected || !this.authenticated) {
      throw new Error('Not connected or authenticated');
    }

    const id = this.getRequestId();
    const commandPacket = this.createPacket(
      id,
      SERVERDATA_EXECCOMMAND,
      command,
    );

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      if (this.socket) {
        this.socket.write(commandPacket);
      } else {
        reject(new Error('Socket not connected'));
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Command timeout: ${command}`));
        }
      }, 10000);
    });
  }

  /**
   * Disconnect from the RCON server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    this.authenticated = false;
  }

  /**
   * Check if connected and authenticated
   */
  isReady(): boolean {
    return this.connected && this.authenticated;
  }

  /**
   * Create an RCON packet
   */
  private createPacket(id: number, type: number, body: string): Buffer {
    const bodyBuffer = Buffer.from(body, 'ascii');
    const size = bodyBuffer.length + 10; // 4 (id) + 4 (type) + body + 1 (null) + 1 (null)

    const packet = Buffer.alloc(size + 4); // +4 for size field
    packet.writeInt32LE(size, 0);
    packet.writeInt32LE(id, 4);
    packet.writeInt32LE(type, 8);
    bodyBuffer.copy(packet, 12);
    packet.writeUInt8(0, 12 + bodyBuffer.length); // Null terminator
    packet.writeUInt8(0, 12 + bodyBuffer.length + 1); // Another null terminator

    return packet;
  }

  /**
   * Handle incoming data
   */
  private handleData(data: Buffer): void {
    let offset = 0;

    while (offset < data.length) {
      if (data.length - offset < 4) {
        break; // Not enough data for size field
      }

      const size = data.readInt32LE(offset);
      const packetLength = size + 4;

      if (data.length - offset < packetLength) {
        break; // Not enough data for full packet
      }

      const id = data.readInt32LE(offset + 4);
      const type = data.readInt32LE(offset + 8);
      const bodyLength = size - 10;
      const body = data
        .subarray(offset + 12, offset + 12 + bodyLength)
        .toString('ascii');

      offset += packetLength;

      this.handlePacket({ size, id, type, body });
    }
  }

  /**
   * Handle a parsed packet
   */
  private handlePacket(packet: RconPacket): void {
    const pending = this.pendingRequests.get(packet.id);

    if (packet.type === SERVERDATA_AUTH_RESPONSE) {
      if (packet.id === -1) {
        if (pending) {
          pending.reject(new Error('Authentication failed'));
          this.pendingRequests.delete(packet.id);
        }
      } else if (pending) {
        pending.resolve('');
        this.pendingRequests.delete(packet.id);
      }
    } else if (packet.type === SERVERDATA_RESPONSE_VALUE) {
      if (pending) {
        pending.resolve(packet.body);
        this.pendingRequests.delete(packet.id);
      }
    }
  }

  /**
   * Get a unique request ID
   */
  private getRequestId(): number {
    this.requestId = (this.requestId + 1) % 1000000;
    return this.requestId;
  }
}
