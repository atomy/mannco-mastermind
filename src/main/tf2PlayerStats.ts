import { PlayerInfo } from '@components/PlayerInfo';
import { SteamGamePlayerstats } from '@main/steamGamePlayerstats';

/**
 * Parse TF2 player statistics and calculate total playtime across all classes
 * @param player - The player information object
 * @param playerStats - The Steam game player statistics
 * @returns The updated player object with SteamTF2Playtime set
 */
export const parseTF2PlayerStats = (
  player: PlayerInfo,
  playerStats: SteamGamePlayerstats,
): PlayerInfo => {
  let totalPlayTime = 0;
  const classes = [
    'Scout',
    'Soldier',
    'Medic',
    'Engineer',
    'Heavy',
    'Sniper',
    'Spy',
    'Pyro',
    'Demoman',
  ];

  // When playerStats are unavailable, skip.
  if (typeof playerStats.stats === 'undefined') {
    console.log(
      `Failed to acquire tf2-playtime for SteamID '${player.SteamID}'!`,
    );

    return player;
  }

  playerStats.stats.forEach((stat) => {
    const classMatch = classes.some((className) =>
      stat.name.startsWith(className),
    );
    if (classMatch && stat.name.endsWith('.accum.iPlayTime')) {
      totalPlayTime += stat.value;
    }
  });

  // console.log(`SteamID '${player.SteamID}' totalPlayTime: ${totalPlayTime}`);

  player.SteamTF2Playtime = totalPlayTime;

  return player;
};
