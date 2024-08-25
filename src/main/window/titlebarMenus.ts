/**
 * Copyright (c) 2021, Guasam
 *
 * This software is provided "as-is", without any express or implied warranty. In no event
 * will the authors be held liable for any damages arising from the use of this software.
 * Read the LICENSE file for more details.
 *
 * @author  : guasam
 * @project : Electron Window
 * @package : Titlebar Menu Items
 */

export type TitlebarMenuItem = {
  name: string;
  action?: string;
  shortcut?: string;
  value?: string | number;
  items?: TitlebarMenuItem[];
};

export type TitlebarMenu = {
  name: string;
  items: TitlebarMenuItem[];
};

const titlebarMenus: TitlebarMenu[] = [
  {
    name: 'File',
    items: [
      {
        name: 'Exit',
        action: 'exit',
      },
    ],
  },
  {
    name: 'View',
    items: [
      {
        name: 'Reload',
        action: 'reload',
        shortcut: 'Ctrl+R',
      },
      {
        name: 'Force Reload',
        action: 'force_reload',
        shortcut: 'Ctrl+Shift+R',
      },
      {
        name: 'Toogle Developer Tools',
        action: 'toggle_devtools',
        shortcut: 'Ctrl+Shift+I',
      },
      {
        name: '__',
      },
      {
        name: 'Actual Size',
        action: 'actual_size',
        shortcut: 'Ctrl+0',
      },
      {
        name: 'Zoom In',
        action: 'zoom_in',
        shortcut: 'Ctrl++',
      },
      {
        name: 'Zoom Out',
        action: 'zoom_out',
        shortcut: 'Ctrl+-',
      },
      {
        name: '__',
      },
      {
        name: 'Toggle Fullscreen',
        action: 'toggle_fullscreen',
        shortcut: 'F11',
      },
    ],
  },
  {
    name: 'Window',
    items: [
      {
        name: 'Maximize',
        action: 'toggle_maximize',
        shortcut: 'Toggle',
      },
      {
        name: 'Minimize',
        action: 'minimize',
        shortcut: 'Ctrl+M',
      },
      {
        name: 'Close',
        action: 'exit',
        shortcut: 'Ctrl+W',
      },
    ],
  },
];

export default titlebarMenus;
