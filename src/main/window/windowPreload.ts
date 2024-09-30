import { contextBridge, ipcRenderer } from 'electron';
import { PlayerInfo } from '@components/PlayerInfo';
import {
  PlayerDataListener,
  RconAppFragListener,
  RconAppLogListener,
  Tf2ClassRequestListener,
} from '@main/window/listenerInterfaces';
import { RconAppFragEntry } from '@components/RconAppFragEntry';
import { RconAppLogEntry } from '@components/RconAppLogEntry';
import titlebarContext from './titlebarContext';

contextBridge.exposeInMainWorld('electron_window', {
  titlebar: titlebarContext,
});

// export ipc communication to renderer world
contextBridge.exposeInMainWorld('electronAPI', {
  on: (channel: string, func: any) => {
    ipcRenderer.on(channel, (...args) => func(...args));
  },
  onPlayerData: (func: PlayerDataListener) => {
    ipcRenderer.on(
      'player-data',
      // eslint-disable-next-line no-undef
      (event: Electron.Event, players: PlayerInfo[]) => {
        func(players);
      },
    );
  },
  onRconAppLog: (func: RconAppLogListener) => {
    ipcRenderer.on(
      'rcon-applog',
      // eslint-disable-next-line no-undef
      (event: Electron.Event, logEntry: RconAppLogEntry) => {
        func(logEntry);
      },
    );
  },
  onRconAppFrag: (func: RconAppFragListener) => {
    ipcRenderer.on(
      'rcon-appfrag',
      // eslint-disable-next-line no-undef
      (event: Electron.Event, fragEntry: RconAppFragEntry) => {
        func(fragEntry);
      },
    );
  },
  onTf2ClassRequest: (func: Tf2ClassRequestListener) => {
    ipcRenderer.on(
      'get-tf2-class',
      // eslint-disable-next-line no-undef
      (
        event: Electron.Event,
        weaponEntityName: string,
        killerSteamID: string,
      ) => {
        func(weaponEntityName, killerSteamID);
      },
    );
  },
  sendTf2ClassResponse: (data: string) => {
    ipcRenderer.send('tf2-class-response', data);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  sendBlacklist: (steamid: string, type: string, reason: string) => {
    ipcRenderer.send('add-player-reputation', steamid, type, reason);
  },
});
