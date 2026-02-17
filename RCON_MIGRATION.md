# RCON Client Migration

## Summary

This branch (`rcon-client`) migrates the TF2-RCON-MISC Go dependency into a native Node.js/TypeScript RCON client integrated directly into the Electron app.

## What Changed

### Removed
- **TF2-RCON-MISC dependency**: No longer downloads or spawns `tf2-rcon.exe` as a subprocess
- **WebSocket IPC**: Removed the WebSocket connection between Electron and the Go process
- **MongoDB dependency**: Not needed anymore (Go app used it, Electron app never did)
- **Download/hash verification code**: `tf2RconConfig.ts`, `tf2RconDownloadCallback.ts`
- **Child process management**: No more process spawning, restart logic, or port conflicts

### Added
- **`src/main/rcon/RconClient.ts`**: Pure Node.js implementation of the Source RCON protocol
- **`src/main/rcon/LogParser.ts`**: Regex-based parser for TF2 console logs (converted from Grok patterns)
- **`src/main/rcon/LogWatcher.ts`**: File tail implementation for watching `console.log` in real-time
- **`src/main/rcon/RconManager.ts`**: Main coordinator that ties everything together

### Modified
- **`src/main/app.ts`**: Completely refactored to use `RconManager` instead of WebSocket/child process
- All player update logic remains the same (Steam API enrichment, reputation, etc.)
- Event flow changed from WebSocket messages → direct EventEmitter events

## Architecture

### Before
```
TF2 console.log → tf2-rcon.exe (Go) → MongoDB
                                    ↓
                              WebSocket (JSON)
                                    ↓
                  Electron app → Steam API → UI
```

### After
```
TF2 console.log → LogWatcher (Node) → RconManager
                                           ↓
                                    EventEmitter
                                           ↓
                      Electron app → Steam API → UI
```

## Features Preserved

All functionality from the Go client has been migrated:

✅ **RCON Communication**: Connect to TF2's RCON server (port 27015)  
✅ **Log Parsing**: Parse player info, chat, kills, lobby debug output  
✅ **Player Tracking**: Track connected players with 20-second expiration  
✅ **Automatic Updates**: Execute `status` and `tf_lobby_debug` commands when needed  
✅ **Team Detection**: Parse lobby data to determine player teams  
✅ **Kill Feed**: Parse and emit frag events with weapon info  
✅ **Chat Detection**: Parse chat messages and commands  
✅ **Auto-Reconnection**: Detect and reconnect when RCON connection drops  

## New Features

🎉 **No External Dependencies**: Everything runs in the same process  
🎉 **Better Error Handling**: Direct access to errors instead of subprocess logs  
🎉 **Faster Startup**: No download, no subprocess spawn delay  
🎉 **Simpler Deployment**: Single executable, no need to bundle tf2-rcon.exe  
🎉 **Better Debugging**: All logs in one place, easier to trace issues  

## Configuration

Environment variables remain the same:

```bash
TF2_LOGPATH=C:\Path\To\console.log   # Optional, auto-detected if not set
STEAM_APPID=440                       # 440 for TF2, 17580 for Dystopia
STEAM_KEY=your_steam_api_key          # For Steam API enrichment
```

## Testing Checklist

- [ ] App starts without errors
- [ ] RCON connects to TF2 (check for "RCON Manager started" log)
- [ ] Player list populates when joining a server
- [ ] Steam avatars and info load correctly
- [ ] Kill feed shows weapon kills with correct player names
- [ ] Player reputation system works
- [ ] Class detection works (TF2 only)
- [ ] Players expire after leaving
- [ ] Reconnection works after TF2 disconnect

## Known Issues

None yet. Please report any issues during testing.

## Rollback

If you need to rollback to the Go client:

```bash
git checkout main
```

The backup of the original `app.ts` is saved as `app.ts.backup` in this branch.

## Next Steps

1. **Test thoroughly** with TF2
2. **Test with Dystopia** (appid 17580) if applicable
3. **Remove old files** once confirmed working:
   - `src/main/tf2RconConfig.ts`
   - `src/main/tf2RconDownloadCallback.ts`
   - Any references to `tf2-rcon.exe`

## Implementation Details

### RCON Protocol

The Source RCON protocol is a simple TCP-based protocol with the following packet structure:

```
[4 bytes: size] [4 bytes: id] [4 bytes: type] [n bytes: body] [2 null bytes]
```

**Packet Types:**
- `SERVERDATA_AUTH (3)`: Authentication request
- `SERVERDATA_AUTH_RESPONSE (2)`: Authentication response
- `SERVERDATA_EXECCOMMAND (2)`: Execute command
- `SERVERDATA_RESPONSE_VALUE (0)`: Command response

### Log Parsing

All log patterns from the Go Grok implementation have been converted to standard JavaScript regex:

- **Player info**: `# 123 "PlayerName" [U:1:12345] 00:12 50 0 active`
- **Chat**: `PlayerName : message text`
- **Kills**: `Killer killed Victim with weapon_name. (crit)?`
- **Lobby debug**: `MEMBER[0] [U:1:12345] team = Red type = MATCH`

### File Watching

The log watcher uses a polling mechanism (100ms interval) to detect new lines. This is more reliable than `fs.watch()` for rapidly-changing files.

## Credits

Original Go implementation: https://github.com/algo7/tf2_rcon_misc  
Migration by: Marcel Lamm (atomy)
