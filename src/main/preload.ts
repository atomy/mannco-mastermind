// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { PlayerInfo } from '../renderer/PlayerInfo';

export type PlayerDataChannel = 'player-data';

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
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
