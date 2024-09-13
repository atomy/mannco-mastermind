import React from 'react';
import { PlayerInfo } from '@components/PlayerInfo';

function BottomBoxTeamClasses(props: {
  ownTeam: boolean;
  players: PlayerInfo[];
}) {
  const { ownTeam, players } = props;

  // Find the player who is the current player (IsMe === true)
  const findPlayer = () => {
    return players.find((player) => player.IsMe);
  };

  const currentPlayer = findPlayer();
  const myTeam = currentPlayer ? currentPlayer.Team : null; // Assuming 'team' is the team identifier, adjust if necessary

  // Determine which team's players to work with (own team or opponent's)
  const teamPlayers = ownTeam
    ? players.filter((player) => player.Team === myTeam) // Filter players on the same team as the current player
    : players.filter((player) => player.Team !== myTeam && player.Team !== null); // Filter players from the opposing team

  // Define the class data to map and count players in each class
  const classData = [
    { name: 'Pyro', key: 'Pyro' },
    { name: 'Soldier', key: 'Soldier' },
    { name: 'Heavy', key: 'Heavy' },
    { name: 'Spy', key: 'Spy' },
    { name: 'Sniper', key: 'Sniper' },
    { name: 'Scout', key: 'Scout' },
    { name: 'Demoman', key: 'Demoman' },
    { name: 'Engineer', key: 'Engineer' },
    { name: 'Medic', key: 'Medic' },
  ];

  // Define a type for classCounts to avoid the TypeScript error
  type ClassCounts = {
    [key: string]: number;
  };

  // Count the number of players in each class
  const classCounts: ClassCounts = classData.reduce((counts, classInfo) => {
    const count = teamPlayers.filter((player) => player.TF2Class === classInfo.key).length;
    return { ...counts, [classInfo.key]: count };
  }, {} as ClassCounts);

  // Identify issues (classes with 0 or more than 3 players)
  const issues = classData
    .filter(
      (teamClass) =>
        classCounts[teamClass.key] === 0 || classCounts[teamClass.key] > 3,
    )
    .map((teamClass) => {
      const count = classCounts[teamClass.key];
      if (count === 0) {
        return (
          <span key={`no-player-${teamClass.name}`}>
            Missing <strong>{teamClass.name}</strong>
          </span>
        );
      }
      return (
        <span key={`too-many-${teamClass.name}`}>
          Too many <strong>{teamClass.name}</strong> ({count})
        </span>
      );
    });

  const badgeColor = (count: number) => {
    if (count === 0) {
      return '#e74c3c';
    }

    if (count > 3) {
      return '#FFA500';
    }

    return '#333';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {teamPlayers.length > 0 ? (
        <>
          {/* Left Side: Display the team classes with badges in a grid layout */}
          <div style={{ flex: 1, paddingLeft: '10px', paddingTop: '10px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '10px',
                maxWidth: '600px',
              }}
            >
              {classData.map((teamClass) => {
                const count = classCounts[teamClass.key] || 0;
                const textColor = '#fff'; // White text for contrast

                return (
                  <div
                    key={teamClass.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    {/* Class name */}
                    <div style={{ width: '100px', fontSize: '16px' }}>
                      {teamClass.name}
                    </div>

                    {/* Count badge with dynamic color */}
                    <div
                      style={{
                        backgroundColor: badgeColor(count),
                        color: textColor,
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        border: '2px solid #000',
                        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Issues */}
          <div
            style={{
              flex: 1,
              paddingLeft: '20px',
              borderLeft: '1px solid #ccc',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              Issues:
            </div>
            {issues.length > 0 ? (
              <ul style={{ paddingLeft: '20px' }}>
                {issues.map((issue) => (
                  <li key={issue.key} style={{ marginBottom: '5px' }}>
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                No issues detected, all classes have acceptable player counts.
              </div>
            )}
          </div>
        </>
      ) : (
        <p>- No team players have been found! -</p>
      )}
    </div>
  );
}

export default BottomBoxTeamClasses;
