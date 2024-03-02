# Overview

Frontend for [TF2-RCON-MISC](https://github.com/algo7/tf2_rcon_misc) CLI-Tool, showing players with additional steam-profile-information.

![App overview](https://github.com/atomy/mannco-mastermind/blob/main/doc/app.png)

Work in progress. If you are a dev, you may be able to get it running, there's no release-pack available for now.

## Requirements
- NodeJS (I got 18.18.1)

## Run it
1) Tweak environment vars in `run.bat` to fit your setup.
2) Run `run.bat`, this should do the trick, better use console to see if it works or if there are issues.

Note: This program is using a sub-module called "tf2-rcon.exe", if it is not present, it will automatically download it from github.

# Development

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
You have to first close the electron window and then you can CTL+C.

### Team Fortress 2 Color Palette

https://lospec.com/palette-list/team-fortress-2-official

### Using TF2-RCON-Dev-Instance

You may want to look at usage of env var *ENVIRONMENT* (value: development) for direct usage of a tf2-rcon-copy. Otherwise a static release will be downloaded on start.
