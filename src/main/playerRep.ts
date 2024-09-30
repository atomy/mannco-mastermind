// Using the fs module to read JSON file
import fs from 'fs';

// Define an interface for the structure of your player data
export interface PlayerReputation {
  steamid: string;
  reason: string;
  type: string;
}

export interface PlayerTF2ClassInfo {
  steamid: string;
  tf2class: string;
}

// Define the structure for the JSON data in playerRepDatabase.json
interface PlayersData {
  players: PlayerReputation[];
}

// Define the callback type
type Callback = (err: Error | null, players?: PlayerReputation[]) => void;

// Load player reputation from file.
export const loadPlayerRep = (filepath: string, callback: Callback): void => {
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      callback(err);
      return;
    }

    try {
      const result: PlayersData = JSON.parse(data); // Parse the JSON data
      callback(null, result.players); // Pass the players array to the callback
    } catch (error) {
      console.error('Error parsing JSON:', error);
      callback(error as Error);
    }
  });
};
