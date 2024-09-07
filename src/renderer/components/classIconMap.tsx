import Demoman from '@assets/icons/classes/demoman.png';
import Scout from '@assets/icons/classes/scout.png';
import Soldier from '@assets/icons/classes/soldier.png';
import Pyro from '@assets/icons/classes/pyro.png';
import Heavy from '@assets/icons/classes/heavy.png';
import Engineer from '@assets/icons/classes/engineer.png';
import Medic from '@assets/icons/classes/medic.png';
import Sniper from '@assets/icons/classes/sniper.png';
import Spy from '@assets/icons/classes/spy.png';

const classIconMap: Record<string, string> = {
  demoman: Demoman,
  scout: Scout,
  soldier: Soldier,
  pyro: Pyro,
  heavy: Heavy,
  engineer: Engineer,
  medic: Medic,
  sniper: Sniper,
  spy: Spy,
};

// Define the keys of the classIconMap
export type ClassNames = keyof typeof classIconMap;

export default classIconMap;
