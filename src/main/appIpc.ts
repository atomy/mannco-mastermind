import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { PlayerInfo } from '@components/PlayerInfo';
import { RconAppLogEntry } from '@components/RconAppLogEntry';
import { Tf2ClassResultCallback } from './tf2ClassResultCallback';
import { logEntityNameToFile } from './util';
import { RconAppBackendData } from '@main/rconAppBackendData';

export const sendPlayerData = (currentPlayerCollection: PlayerInfo[]) => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('player-data', currentPlayerCollection);
  });
};

export const sendApplicationLogData = (logMessage: RconAppLogEntry) => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('rcon-applog', logMessage);
  });
};

export const mapWeaponEntityToTFClass = (
  weaponEntityName: string,
  killerSteamID: string,
  tf2ClassResultCallback: Tf2ClassResultCallback,
) => {
  const windows = BrowserWindow.getAllWindows();

  // Send request to renderer
  // console.log(
  //   `mapWeaponEntityToTFClass() sending request *get-tf2-class* to frontend with weaponEntityName ${weaponEntityName}`,
  // );
  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('get-tf2-class', weaponEntityName, killerSteamID);
  });

  // Set up one-time listener for the response
  ipcMain.once('tf2-class-response', (event: IpcMainEvent, result: any) => {
    // console.log(`*tf2-class-response* result is: ${JSON.stringify(result)}`);

    if (result.error) {
      tf2ClassResultCallback(true, [], '', '');
      console.log(
        `*tf2-class-response* error while trying to resolve entity-name: ${weaponEntityName}`,
      );
      logEntityNameToFile(weaponEntityName);
    } else {
      // console.log(`callback: ${result.classNames}, ${result.weaponEntityName}, ${result.killerSteamID}`)
      tf2ClassResultCallback(
        false,
        result.classNames,
        result.weaponEntityName,
        result.killerSteamID,
      );
    }
  });
};

export const sendBackendData = (backendData: RconAppBackendData) => {
  // Get all window instances
  const windows = BrowserWindow.getAllWindows();

  // Send data to each window
  windows.forEach((w) => {
    w.webContents.send('backend-data', backendData);
  });
};
