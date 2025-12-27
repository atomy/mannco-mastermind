import https from 'https';

export interface DysStats {
  rank: number;
  points: number;
  assist: number;
  cyberdamage: number;
  cyberfrag: number;
  damage: number;
  frag: number;
  hack: number;
  healing: number;
  objective: number;
  secondary: number;
  tacscan: number;
}

// Fetch Dys stats from API for a player
export const getDysStats = (
  playerSteamId: string,
  callback: (stats: DysStats | null) => void,
) => {
  const apiUrl = process.env.DYSTATS_API_URL;
  if (!apiUrl) {
    console.log(
      `[dysStatsHandler.ts] DYSTATS_API_URL not configured, skipping fetch for ${playerSteamId}`,
    );
    callback(null);
    return;
  }

  // Construct URL: base URL + /data/player/ + SteamID
  // Remove trailing slash from base URL if present
  const baseUrl = apiUrl.replace(/\/$/, '');
  const url = `${baseUrl}/data/player/${playerSteamId}`;
  
  console.log(
    `[dysStatsHandler.ts] Fetching Dys stats for ${playerSteamId} from ${url}`,
  );

  https
    .get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 404) {
            console.log(
              `[dysStatsHandler.ts] No Dys stats data found for ${playerSteamId} (404 Not Found)`,
            );
            callback(null);
            return;
          }

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const jsonResponse = JSON.parse(data);

            if (jsonResponse.general && jsonResponse.pointtype) {
              const stats: DysStats = {
                rank: jsonResponse.general.grank || 0,
                points: jsonResponse.general.points || 0,
                assist: jsonResponse.pointtype.assist || 0,
                cyberdamage: jsonResponse.pointtype.cyberdamage || 0,
                cyberfrag: jsonResponse.pointtype.cyberfrag || 0,
                damage: jsonResponse.pointtype.damage || 0,
                frag: jsonResponse.pointtype.frag || 0,
                hack: jsonResponse.pointtype.hack || 0,
                healing: jsonResponse.pointtype.healing || 0,
                objective: jsonResponse.pointtype.objective || 0,
                secondary: jsonResponse.pointtype.secondary || 0,
                tacscan: jsonResponse.pointtype.tacscan || 0,
              };
              console.log(
                `[dysStatsHandler.ts] Successfully fetched Dys stats for ${playerSteamId}: rank=${stats.rank}, points=${stats.points}, frag=${stats.frag}, damage=${stats.damage}`,
              );
              callback(stats);
            } else {
              console.log(
                `[dysStatsHandler.ts] Invalid Dys stats response structure for ${playerSteamId} - missing general or pointtype fields`,
              );
              callback(null);
            }
          } else {
            console.log(
              `[dysStatsHandler.ts] HTTP error fetching Dys stats for ${playerSteamId}: status ${res.statusCode}`,
            );
            callback(null);
          }
        } catch (error) {
          console.log(
            `[dysStatsHandler.ts] Error parsing Dys stats data for ${playerSteamId}: ${error} - response-data length: ${data.length} chars`,
          );
          callback(null);
        }
      });
    })
    .on('error', (error) => {
      console.log(
        `[dysStatsHandler.ts] Network error fetching Dys stats for ${playerSteamId}: ${error}`,
      );
      callback(null);
    });
};

