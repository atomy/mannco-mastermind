// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { PlayerInfo } from '../renderer/PlayerInfo';
import { RconAppLogEntry } from '../renderer/RconAppLogEntry';

export type PlayerDataChannel = 'player-data';
export type RconAppLogChannel = 'rcon-applog';

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
    // Add your custom removeListener functionality
    removeListener(channel: string, func: (args: any) => void) {
      ipcRenderer.removeListener(channel, func);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
