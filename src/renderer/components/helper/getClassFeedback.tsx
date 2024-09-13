import { PlayerInfo } from '@components/PlayerInfo';
import { TeamClassFeedback } from '@components/TeamClassFeedback';

// getClassFeedback, calculate class-feedback by input parameters
const getClassFeedback = (players: PlayerInfo[]): TeamClassFeedback => {
  const feedback: TeamClassFeedback = {
    PyroCount: 0,
    SoldierCount: 0,
    HeavyCount: 0,
    SpyCount: 0,
    SniperCount: 0,
    ScoutCount: 0,
    DemomanCount: 0,
    EngineerCount: 0,
    MedicCount: 0,
    Summary: '',
  };

  let myTeam = 'TF_GC_TEAM_INVADERS';

  players.forEach((player) => {
    if (player.IsMe) {
      myTeam = player.Team;
    }
  });

  players.forEach((player) => {
    if (player.Team === myTeam) {
      switch (player.TF2Class) {
        case 'Pyro':
          feedback.PyroCount += 1;
          break;
        case 'Soldier':
          feedback.SoldierCount += 1;
          break;
        case 'Heavy':
          feedback.HeavyCount += 1;
          break;
        case 'Spy':
          feedback.SpyCount += 1;
          break;
        case 'Sniper':
          feedback.SniperCount += 1;
          break;
        case 'Scout':
          feedback.ScoutCount += 1;
          break;
        case 'Demoman':
          feedback.DemomanCount += 1;
          break;
        case 'Engineer':
          feedback.EngineerCount += 1;
          break;
        case 'Medic':
          feedback.MedicCount += 1;
          break;
        default:
          break;
      }
    }
  });

  // Correct template string for summary
  feedback.Summary = `Pyro: ${feedback.PyroCount}, Soldier: ${feedback.SoldierCount}, Heavy: ${feedback.HeavyCount}, Spy: ${feedback.SpyCount}, Sniper: ${feedback.SniperCount}, Scout: ${feedback.ScoutCount}, Demoman: ${feedback.DemomanCount}, Engineer: ${feedback.EngineerCount}, Medic: ${feedback.MedicCount}`;

  return feedback;
};

export default getClassFeedback;
