import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const logFilePath = path.join(__dirname, 'weapon_mapping_failures.log');

export const logEntityNameToFile = (weaponEntityName: string) => {
  try {
    fs.appendFileSync(logFilePath, `${weaponEntityName}\n`, 'utf8');
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
};

// computeFileSHA1Sync function to compute SHA1 hash of a file
export const computeFileSHA1Sync = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha1');
  hashSum.update(fileBuffer.toString());

  return hashSum.digest('hex');
};
