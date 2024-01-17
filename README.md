# Overview

Frontend for [TF2-RCON-MISC](https://github.com/algo7/tf2_rcon_misc) CLI-Tool, showing players, allowing actions etc.

Work in progress.

# Development

## Install

Clone the repo and install dependencies:

```bash
npm install
```

**Having issues installing? See our [debugging guide](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400)**

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

Note: Don't kill the program with CTL+C on windows, cause the sub-process (tf2-rcon) will still be running and not being able to start on next startup cause of blocked listening port.
(https://github.com/electron/electron/issues/5273)

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```
