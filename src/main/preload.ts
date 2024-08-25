// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { PlayerInfo } from '../renderer/PlayerInfo';
import { RconAppLogEntry } from '../renderer/RconAppLogEntry';
import { RconAppFragEntry } from '../renderer/RconAppFragEntry';

export type PlayerDataChannel = 'player-data';
export type RconAppLogChannel = 'rcon-applog';
export type RconAppFragChannel = 'rcon-appfrag';
export type Tf2ClassRequestChannel = 'get-tf2-class';
export type Tf2ClassResponseChannel = 'tf2-class-response';

const electronHandler = {
  ipcRenderer: {
    on(channel: PlayerDataChannel, func: (args: PlayerInfo[]) => void) {
      const subscription = (_event: IpcRendererEvent, args: PlayerInfo[]) =>
        func(args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    sendBlacklist(args: { steamid: string; type: string; reason: string }) {
      ipcRenderer.send('blacklist-player', args);
    },
    // Send TF2 class response
    sendTf2ClassResponse(data: {
      error: boolean;
      classNames: string[];
      errorMessage?: unknown;
    }) {
      ipcRenderer.send('tf2-class-response', data);
    },
    onApplicationLogMessage(
      channel: RconAppLogChannel,
      func: (args: RconAppLogEntry) => void,
    ) {
      const subscription = (_event: IpcRendererEvent, args: RconAppLogEntry) =>
        func(args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    onApplicationFragMessage(
      channel: RconAppFragChannel,
      func: (args: RconAppFragEntry) => void,
    ) {
      const subscription = (_event: IpcRendererEvent, args: RconAppFragEntry) =>
        func(args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    // Listener for TF2 class request
    onTf2ClassRequest(
      channel: Tf2ClassRequestChannel,
      func: (args: string) => void,
    ) {
      const subscription = (_event: IpcRendererEvent, args: string) =>
        func(args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    // Add custom removeListener functionality
    removeListener(channel: string, func: (args: any) => void) {
      ipcRenderer.removeListener(channel, func);
    },
    // Add custom removeListener functionality
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
