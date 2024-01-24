# Overview

Frontend for [TF2-RCON-MISC](https://github.com/algo7/tf2_rcon_misc) CLI-Tool, showing players with additional steam-profile-information.

Work in progress.

![App overview](https://github.com/atomy/mannco-mastermind/blob/main/doc/app.png)

# Development

## Install

Clone the repo and install dependencies:

```bash
npm install
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

Note: Don't kill the program with CTL+C on windows, cause the sub-process (tf2-rcon) will still be running and not being able to start on next startup cause of blocked listening port.
(https://github.com/electron/electron/issues/5273)
