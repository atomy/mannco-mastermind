import React from 'react';
import { useTeamClassContext } from '@components/context/TeamClassContext';

function BottomBoxTeamClassFeedback() {
  const teamClassFeedback = useTeamClassContext();

  // This will map the team class names to display names and state keys
  const classData = [
    { name: 'Pyro', countKey: 'PyroCount' },
    { name: 'Soldier', countKey: 'SoldierCount' },
    { name: 'Heavy', countKey: 'HeavyCount' },
    { name: 'Spy', countKey: 'SpyCount' },
    { name: 'Sniper', countKey: 'SniperCount' },
    { name: 'Scout', countKey: 'ScoutCount' },
    { name: 'Demoman', countKey: 'DemomanCount' },
    { name: 'Engineer', countKey: 'EngineerCount' },
    { name: 'Medic', countKey: 'MedicCount' },
  ];

  // Create the list of issues (classes with 0 players or more than 2 players)
  const issues = classData
    .filter(
      (teamClass) =>
        teamClassFeedback[teamClass.countKey] === 0 ||
        teamClassFeedback[teamClass.countKey] > 3,
    )
    .map((teamClass) => {
      const count = teamClassFeedback[teamClass.countKey];
      if (count === 0) {
        return (
          <span key={teamClass.name}>
            <strong>{teamClass.name}</strong> has no players
          </span>
        );
      }
      return (
        <span key={teamClass.name}>
          <strong>{teamClass.name}</strong> has too many players ({count})
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
      {teamClassFeedback ? (
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
                const count = teamClassFeedback[teamClass.countKey];
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
                  <li key={String(issue)} style={{ marginBottom: '5px' }}>
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
        <p>- No team feedback has been calculated yet! -</p>
      )}
    </div>
  );
}

export default BottomBoxTeamClassFeedback;
