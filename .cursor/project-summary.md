# MannCo Mastermind - Project Summary

## Project Type
**Electron Desktop Application** - A frontend application for TF2-RCON-MISC CLI tool that displays real-time player information from Team Fortress 2 (and other Source engine games) with enhanced Steam profile data.

## Purpose
The application provides a real-time dashboard for game server administrators to monitor players, view Steam profiles, track player reputations, analyze class balance, and manage player data during active game sessions.

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                         │
├─────────────────────────────────────────────────────────┤
│  Main Process (Node.js)          │  Renderer (React)   │
│  - Game server communication     │  - UI Components     │
│  - Steam API integration         │  - Player tables    │
│  - Player data management        │  - Class analysis    │
│  - WebSocket client              │  - Status displays   │
│  - IPC handlers                  │                      │
└─────────────────────────────────────────────────────────┘
         │                              │
         └────────── IPC ───────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    TF2-RCON.exe          Steam Web API
    (WebSocket)            (REST)
```

### Process Separation
- **Main Process** (`src/main/`): Node.js backend handling game server communication, Steam API calls, data processing, and IPC
- **Renderer Process** (`src/renderer/`): React frontend for UI rendering and user interaction

## Technology Stack

### Core Technologies
- **Electron** (v31.2.1): Desktop application framework
- **React** (v18.3.1): UI framework with TypeScript
- **TypeScript**: Primary language
- **Webpack**: Module bundling (via Electron Forge)
- **Electron Forge**: Build and packaging tool

### Key Dependencies
- **Material-UI** (@mui/material, @mui/icons-material): UI component library
- **React Router DOM**: Client-side routing
- **steam-web**: Steam Web API client (custom fork)
- **ws**: WebSocket client for game server communication
- **Firebase Remote Config**: Dynamic configuration management
- **Emotion**: CSS-in-JS styling

### Build Tools
- **Electron Forge**: Build, package, and distribution
- **Webpack**: Code bundling with separate configs for main and renderer
- **TypeScript**: Type checking and compilation
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Directory Structure

```
src/
├── main/                    # Main process (Node.js backend)
│   ├── app.ts              # Main entry point, orchestrates all services
│   ├── appIpc.ts           # IPC communication helpers
│   ├── appWindow.ts        # Window creation and management
│   ├── playerReputationHandler.ts  # Player reputation management
│   ├── dysStatsHandler.ts  # Dystopia game stats handler
│   ├── tf2PlayerStats.ts   # TF2 player statistics parser
│   └── window/             # Window-related utilities
│       ├── windowPreload.ts  # Preload script exposing IPC to renderer
│       └── listenerInterfaces.ts  # TypeScript interfaces for IPC
│
└── renderer/                # Renderer process (React frontend)
    ├── appRenderer.tsx     # React app entry point
    ├── app.html            # HTML template
    ├── components/         # React components
    │   ├── Application.tsx  # Main application component
    │   ├── PlayerTableComponent.tsx  # Player data table
    │   ├── footer/         # Bottom navigation and views
    │   ├── context/        # React contexts
    │   └── hooks/          # Custom React hooks
    └── styles/             # SCSS stylesheets
        ├── app.scss        # Main styles
        ├── dark_theme.scss # Dark theme
        └── light_theme.scss # Light theme
```

## Key Components & Responsibilities

### Main Process (`src/main/app.ts`)

**Core Responsibilities:**
1. **Game Server Communication**
   - Manages `tf2-rcon.exe` child process (downloads if missing)
   - Establishes WebSocket connection to game server (ws://127.0.0.1:27689)
   - Handles player updates, frag events, and log messages

2. **Steam API Integration**
   - Fetches player profiles (avatars, country, account age)
   - Retrieves TF2-specific stats and playtime
   - Checks VAC ban status
   - Rate-limited playtime API calls (2-second intervals)

3. **Player Data Management**
   - Maintains `currentPlayerCollection` array
   - Caches Steam data to prevent redundant API calls
   - Tracks player classes based on weapon usage
   - Manages player reputation data

4. **Background Timers**
   - Steam profile updater (10s interval)
   - Steam TF2 stats updater (10s interval, TF2 only)
   - Steam ban checker (10s interval)
   - Playtime updater (10s interval)
   - Player reputation updater (5s interval)
   - Dys stats updater (10s interval, Dystopia only)

5. **IPC Communication**
   - Sends player data to renderer
   - Sends log entries and frag events
   - Handles reputation updates from renderer
   - Provides app configuration

### Renderer Process (`src/renderer/`)

**Core Responsibilities:**
1. **UI Rendering**
   - Player table with Steam avatars, names, stats
   - Class balance analysis (TF2 only)
   - Frag log viewer
   - Console log viewer
   - Navigation between views

2. **Data Processing**
   - Weapon-to-class mapping using Firebase Remote Config
   - Class balance calculations
   - Player filtering and sorting

3. **User Interactions**
   - Player reputation management (mark as bot, hacker, warning, +rep)
   - Navigation between different views
   - Status indicators

## Data Flow

### Player Data Flow
```
TF2-RCON.exe (WebSocket)
    ↓
Main Process (app.ts)
    ↓ (processes, enriches with Steam data)
    ↓
IPC: 'player-data' event
    ↓
Renderer Process (Application.tsx)
    ↓
PlayerTableComponent
    ↓
PlayerTableRow (individual player display)
```

### Steam Data Enrichment Flow
```
Player joins game
    ↓
Main Process detects new player
    ↓
Queues for Steam API calls:
  - Profile data (avatar, country, etc.)
  - TF2 stats (if appid 440)
  - Ban status
  - Playtime (rate-limited)
  - Dys stats (if appid 17580)
    ↓
Background timers process queues
    ↓
Data merged into currentPlayerCollection
    ↓
Sent to renderer via IPC
```

### Reputation Flow
```
User marks player in UI
    ↓
IPC: 'add-player-reputation'
    ↓
Main Process (playerReputationHandler.ts)
    ↓
Saves to local JSON or API
    ↓
Updates currentPlayerCollection
    ↓
Sent to renderer via IPC
```

## Environment Variables

The application is heavily configured via environment variables (as per user preference):

### Required
- `TF2_LOGPATH`: Path to TF2 console.log file

### Optional (Steam Integration)
- `STEAM_KEY`: Steam Web API key
- `STEAM_APPID`: Game app ID (440 for TF2, 17580 for Dystopia)
- `STEAM_GAME_SHORTNAME`: Game short name
- `STEAM_PLAYTIME_API_URL`: Custom playtime API endpoint

### Optional (Reputation System)
- `PLAYER_REPUATION_API_URL`: API endpoint for reputation data
- `PLAYER_REPUATION_API_KEY`: API key for reputation service
- `REPUTATION_WWW_URL`: Web URL for reputation system

### Optional (Game-Specific)
- `DYSTATS_API_URL`: Dystopia stats API (for appid 17580)

### Optional (Development)
- `ENVIRONMENT`: Set to "development" to use local tf2-rcon copy
- `TF2_RCON_AUTOSTART`: Set to "0" to disable auto-start
- `AUTO_OPEN_DEVTOOLS`: Set to "1" to auto-open DevTools
- `TF2RCON_SHOW_LOG`: Set to "false" to hide tf2-rcon logs

## IPC Communication

### Main → Renderer (via `window.webContents.send`)
- `player-data`: Player collection updates
- `rcon-applog`: Application log entries
- `rcon-appfrag`: Frag/kill events
- `app-config`: Application configuration
- `backend-data`: Backend connection status
- `get-tf2-class`: Request for weapon-to-class mapping

### Renderer → Main (via `ipcRenderer.send`)
- `get-appconfig`: Request application configuration
- `add-player-reputation`: Add/update player reputation
- `tf2-class-response`: Response to weapon-to-class mapping request

### IPC Bridge
- Exposed via `windowPreload.ts` using `contextBridge`
- Accessible in renderer as `window.electronAPI`

## Key Features

1. **Real-time Player Monitoring**
   - Live player list with connection stats (ping, loss)
   - Steam profile integration (avatars, links, account age)
   - VAC ban detection

2. **Class Intelligence (TF2)**
   - Automatic class detection from weapon usage
   - Team class balance analysis
   - Visual feedback on class distribution

3. **Player Reputation System**
   - Local JSON database (`playerRepDatabase.json`)
   - Optional API integration
   - Mark players as: bot, hacker, warning, or +rep
   - Persistent across sessions

4. **Game Support**
   - Primary: Team Fortress 2 (appid 440)
   - Secondary: Dystopia (appid 17580) with custom stats
   - Extensible for other Source engine games

5. **Frag Log**
   - Real-time kill feed
   - Weapon and class information
   - Critical hit indicators

## Build & Development

### Development
```bash
npm start  # Starts Electron with hot reload
```

### Building
```bash
npm run make  # Creates distributable packages
```

### Project Setup
- Uses `svc-setup` bash alias (per user rules)
- Uses `svc-up` bash alias to start (per user rules)

### Important Notes
- **Windows-specific**: Uses Windows paths and batch files
- **Child Process Management**: tf2-rcon.exe must be properly terminated (don't use Ctrl+C)
- **WebSocket Reconnection**: Automatic reconnection on connection loss
- **Rate Limiting**: Playtime API calls are rate-limited to 2-second intervals

## Code Style & Conventions

- **TypeScript**: Strict typing with `noImplicitAny: true`
- **ESLint**: ERB config with React and TypeScript rules
- **Prettier**: Single quotes, JSON parser for config files
- **PHP-style**: Uses `protected` over `private` (per user rules, though this is a TS/JS project)
- **Environment Variables**: All configuration via env vars (per user rules)

## File Path Aliases

Configured in `tsconfig.json` and `webpack.aliases.js`:
- `@assets/*` → `./assets/*`
- `@components/*` → `./src/renderer/components/*`
- `@main/*` → `./src/main/*`
- `@renderer/*` → `./src/renderer/*`
- `@styles/*` → `./src/renderer/styles/*`

## External Dependencies

1. **tf2-rcon.exe**: Downloaded automatically if missing (SHA1 hash verified)
   - Source: GitHub releases
   - Communicates via WebSocket on localhost:27689

2. **Firebase Remote Config**: Weapon-to-class mapping database
   - Loaded via `useRemoteConfigHook`
   - Used for determining player classes from weapon entities

## Common Tasks

### Adding a New Feature
1. Determine if it belongs in main or renderer process
2. If main: Add to `app.ts` or create new handler file
3. If renderer: Add component in `src/renderer/components/`
4. Add IPC communication if needed (update `appIpc.ts` and `windowPreload.ts`)
5. Update types in `listenerInterfaces.ts` if needed

### Debugging
- Main process: Console logs appear in terminal
- Renderer process: Use DevTools (auto-opens if `AUTO_OPEN_DEVTOOLS=1`)
- IPC: Check `appIpc.ts` and `windowPreload.ts` for event names

### Adding Support for New Game
1. Set `STEAM_APPID` environment variable
2. Add game-specific handlers if needed (like `dysStatsHandler.ts` for Dystopia)
3. Update UI components to handle game-specific features
4. Add game-specific stats to `PlayerInfo` interface if needed

