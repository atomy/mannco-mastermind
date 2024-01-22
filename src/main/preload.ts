// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { PlayerInfo } from '../renderer/PlayerInfo';

export type Channels = 'player-data';

const electronHandler = {
  ipcRenderer: {
    on(channel: Channels, func: (args: PlayerInfo[]) => void) {
      const subscription = (_event: IpcRendererEvent, args: PlayerInfo[]) =>
        func(args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
