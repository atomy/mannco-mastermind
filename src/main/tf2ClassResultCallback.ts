export type Tf2ClassResultCallback = (
  error: boolean,
  className: string[],
  weaponEntityName: string,
  killerSteamID: string,
) => void;
