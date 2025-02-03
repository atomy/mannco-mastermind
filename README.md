# Overview

Frontend for [TF2-RCON-MISC](https://github.com/algo7/tf2_rcon_misc) CLI-Tool, showing players with additional steam-profile-information.

![App overview](https://github.com/atomy/mannco-mastermind/blob/main/doc/screenshot.png)

Work in progress. There is a release-package available for download and run, it needs a bunch of ENV variables to be set to work.

## Features
- Show all players from current TF2-Session
- Show Team of player
- Display Steam-Avatar of every player
- Provide link to steam-profile of players
- Show connection-stats for player, ping, loss
- Display steam playtime and account age of player
- Player-Reputation-functionality, mark players for good/bad behaviour and display that info next to their name, also detect players having VAC bans
- Reputation system for players, you can mark players as *bots*, *hackers*, *general-warning* or *+reputation* (local database)
- Show country flag of players
- Class balance analysation

### Class intelligence

Showing class proposition and "issues" in class balance for own and other team.

![App overview](https://github.com/atomy/mannco-mastermind/blob/main/doc/screenshot-class-intelligence.png)

# Installation

- Configure your TF2 to enable rcon and output log to console.log (see: https://github.com/algo7/tf2_rcon_misc?tab=readme-ov-file#required-launch-options)
- Download latest release and run installer MannCoMastermind.Setup.x.y.z.exe.
- Get into your Windows environment settings and set the path to your console.log file into the variable *TF2_LOGPATH*
  -- You may also want to acquire a steam web api key from https://steamcommunity.com/dev and set it as variable *STEAM_KEY*
- You may need to relog into windows for environment variables to take effect
- There should be a link to the installed app on your desktop, run it

## Windows env settings
They look like this:
![Windows environment settings](https://github.com/atomy/mannco-mastermind/blob/main/doc/windows-env.png)

# Development

## Requirements
- NodeJS (I got 18.18.1)

## Run it
1) Tweak environment vars in `run.bat` to fit your setup.
2) Run `run.bat`, this should do the trick, better use console to see if it works or if there are issues.

Note: This program is using a submodule called "tf2-rcon.exe", if it is not present, it will automatically download it from github.

## Install

Clone the repo and install dependencies:

```bash
npm install
```

## Starting Development

For

Start the app in the `dev` environment:

```bash
npm start
```

Note: Don't kill the program with CTL+C on windows, cause the sub-process (tf2-rcon) will still be running and not being able to start on next startup cause of blocked listening port.
(https://github.com/electron/electron/issues/5273)
You have to first close the electron window and then you can CTL+C. If you did kill the app by accident and tf2-rcon is still running and you actually need to restart tf2-rcon (which you probably dont even need) use something like TCPView to kill the process.

## Build release build
```
npx electron-forge make
```

### Useful links

[Team Fortress 2 Color Palette](https://lospec.com/palette-list/team-fortress-2-official)
[Weapon kill icons and entity-names](https://wiki.teamfortress.com/wiki/User:Ten19/Event_log)
[Electron React Webpack Boilerplate](https://github.com/codesbiome/electron-react-webpack-typescript-2024)

### Using TF2-RCON-Dev-Instance

You may want to look at usage of env var *ENVIRONMENT* (value: development) for direct usage of a tf2-rcon-copy. Otherwise a static release will be downloaded on start.
