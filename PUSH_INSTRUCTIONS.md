# Push Instructions for rcon-client Branch

The refactoring is complete and committed locally on the `rcon-client` branch.

## Push the Branch

Since I don't have push permissions to your repository, you'll need to push it:

```bash
cd /home/clawdbot/clawd/mannco-mastermind
git push -u origin rcon-client
```

## What's Been Done

✅ **Created 4 new RCON modules:**
- `src/main/rcon/RconClient.ts` - Source RCON protocol implementation
- `src/main/rcon/LogParser.ts` - Log parsing (all regex patterns from Go)
- `src/main/rcon/LogWatcher.ts` - Console log file watcher
- `src/main/rcon/RconManager.ts` - Main coordinator

✅ **Refactored `app.ts`:**
- Removed all tf2-rcon.exe download/spawn code
- Removed WebSocket connection code
- Integrated RconManager directly
- Preserved all Steam API enrichment logic

✅ **Documentation:**
- `RCON_MIGRATION.md` - Detailed migration notes
- Backup saved as `app.ts.backup`

## Before Testing

Install dependencies (if not already done):

```bash
npm install
```

## Testing

1. Set environment variables:
   ```bash
   export TF2_LOGPATH="C:\Path\To\console.log"  # Or let it auto-detect
   export STEAM_KEY="your_steam_api_key"
   export STEAM_APPID="440"  # 440 for TF2
   ```

2. Start the app:
   ```bash
   npm start
   ```

3. Check console for:
   - ✅ "[RconManager] Starting..."
   - ✅ "[RCON] Connected to X.X.X.X:27015"
   - ✅ "[RCON] Authenticated successfully"
   - ✅ "[RconManager] Started successfully"

4. Join a TF2 server and verify:
   - Player list populates
   - Steam avatars load
   - Kill feed works
   - Chat is detected

## If Something Breaks

Rollback to the old version:

```bash
git checkout main
```

Or restore from backup:

```bash
cp src/main/app.ts.backup src/main/app.ts
```

## Next Steps After Testing

If everything works:

1. Merge to main
2. Delete obsolete files:
   - `src/main/tf2RconConfig.ts`
   - `src/main/tf2RconDownloadCallback.ts`
3. Update README to remove TF2-RCON-MISC dependency mentions
4. Create new release

## Questions?

Check `RCON_MIGRATION.md` for detailed technical documentation.
