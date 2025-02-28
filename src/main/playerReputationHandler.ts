import https from 'https';
import { PlayerReputation } from './playerRep';

// Array to store player reputations
let playerReputations: PlayerReputation[] = [];

export const getPlayerReputations = () => playerReputations;
export const setPlayerReputations = (reputations: PlayerReputation[]) => {
  playerReputations = reputations;
};

interface ReputationResponse {
  steamId: string;
  reputation: string;
  comment: string;
  added: string;
  lastRequested: string;
}

const fetchPlayerReputation = async (
  steamId: string,
): Promise<PlayerReputation | null> => {
  console.log(`[main.ts] Fetching reputation for player ${steamId}...`);

  const apiUrl = process.env.PLAYER_REPUATION_API_URL;
  if (!apiUrl) {
    console.error(
      '[main.ts] PLAYER_REPUATION_API_URL environment variable is not set',
    );
    return null;
  }

  const apiKey = process.env.PLAYER_REPUATION_API_KEY;
  if (!apiKey) {
    console.error(
      '[main.ts] PLAYER_REPUATION_API_KEY environment variable is not set',
    );
    return null;
  }

  // Parse URL manually and add query parameter
  const [protocol, , host, ...pathParts] = apiUrl.split('/');
  const [hostname, port] = host.split(':');
  const urlPath = `/${pathParts.join('/')}?steam=${steamId}`;

  const options = {
    hostname,
    port: port || (protocol === 'https:' ? 443 : 80),
    path: urlPath,
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
    },
  };

  /* eslint-disable-next-line compat/compat, @typescript-eslint/no-unused-vars */
  return new Promise<PlayerReputation | null>((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 404) {
          resolve(null);
        } else if (
          res.statusCode &&
          res.statusCode >= 200 &&
          res.statusCode < 300
        ) {
          try {
            const data = JSON.parse(responseData) as ReputationResponse;
            const reputation = {
              steamid: data.steamId,
              type: data.reputation,
              reason: data.comment,
            };
            console.log(
              `[main.ts] Received reputation for ${steamId}: ${JSON.stringify(reputation)}`,
            );
            resolve(reputation);
          } catch (error) {
            console.error(
              '[main.ts] Error parsing reputation response:',
              error,
            );
            resolve(null);
          }
        } else {
          console.error(`[main.ts] HTTP error! status: ${res.statusCode}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('[main.ts] Error fetching player reputation:', error);
      resolve(null);
    });

    req.end();
  });
};

export const updatePlayerReputationData = async (steamIds: string[]) => {
  console.log(
    `[main.ts] Updating reputation data for ${steamIds.length} players`,
  );

  // Filter out players who already have a reputation
  const playersToCheck = steamIds.filter(
    (steamId) => !playerReputations.some((rep) => rep.steamid === steamId),
  );

  if (playersToCheck.length === 0) {
    console.log('[main.ts] No new players to check for reputation');
    return;
  }

  console.log(
    `[main.ts] Checking reputation for ${playersToCheck.length} new players`,
  );

  // Set initial NONE reputation for new players
  const newReputations = playersToCheck.map((steamId) => ({
    steamid: steamId,
    type: 'NONE',
    reason: '',
  }));

  // Add new reputations to existing ones
  playerReputations = [...playerReputations, ...newReputations];
  setPlayerReputations(playerReputations);

  const processNext = (index: number) => {
    if (index >= playersToCheck.length) {
      console.log(`[main.ts] Finished checking reputations for new players`);
      return;
    }

    fetchPlayerReputation(playersToCheck[index]).then((reputation) => {
      if (reputation) {
        // Update the existing reputation entry if API returned data
        const existingIndex = playerReputations.findIndex(
          (r) => r.steamid === playersToCheck[index],
        );
        if (existingIndex !== -1) {
          playerReputations[existingIndex] = reputation;
          setPlayerReputations(playerReputations);
        }
      }
      processNext(index + 1);
    });
  };

  processNext(0);
};

// addPlayerReputation add entry for players reputation
const addPlayerReputation = async (
  steamid: string,
  type: string,
  reason: string,
): Promise<void> => {
  console.log(
    `[main.ts] addPlayerReputation() ${steamid} -- ${type} -- ${reason}`,
  );

  const apiUrl = process.env.PLAYER_REPUATION_API_URL;
  if (!apiUrl) {
    console.error(
      '[main.ts] PLAYER_REPUATION_API_URL environment variable is not set',
    );
    return;
  }

  const apiKey = process.env.PLAYER_REPUATION_API_KEY;
  if (!apiKey) {
    console.error(
      '[main.ts] PLAYER_REPUATION_API_KEY environment variable is not set',
    );
    return;
  }

  const data = JSON.stringify({
    steam: steamid,
    reputation: type,
    comment: reason,
  });

  // Parse URL manually
  const [protocol, , host, ...pathParts] = apiUrl.split('/');
  const [hostname, port] = host.split(':');
  const urlPath = `/${pathParts.join('/')}`;

  const options = {
    hostname,
    port: port || (protocol === 'https:' ? 443 : 80),
    path: urlPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-API-KEY': apiKey,
    },
  };

  await new Promise<void>((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log('[main.ts] Successfully added player reputation via API');
          resolve();
        } else {
          console.error(`[main.ts] HTTP error! status: ${res.statusCode}`);
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('[main.ts] Error adding player reputation:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

export const handleAddPlayerReputation = async (
  event: Electron.Event,
  arg: any,
) => {
  console.log(`[main.ts][IPC][*add-player-reputation*] ${JSON.stringify(arg)}`);
  playerReputations.push({
    steamid: arg.steamid,
    reason: arg.reason,
    type: arg.type,
  });

  await addPlayerReputation(arg.steamid, arg.type, arg.reason);
};
