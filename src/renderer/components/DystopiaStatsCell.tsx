import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';
import { AppConfig } from '@components/AppConfig';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

interface DystopiaStatsCellProps {
  row: PlayerInfo;
  appConfig: AppConfig;
}

export default function DystopiaStatsCell({
  row,
  appConfig,
}: DystopiaStatsCellProps) {
  return (
    <StyledTableCell align="right">
      {row.DysStatsLoaded === 'IN_PROGRESS' ? (
        <span
          style={{
            display: 'inline-block',
            animation: 'spin 1s linear infinite',
          }}
        >
          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
          ⏳
        </span>
      ) : row.DysPoints !== undefined && row.DysPoints !== null && row.DysPoints > 0 ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {row.DysRank !== undefined && row.DysRank !== null ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              {row.DysPoints} (<Link
                href={
                  appConfig?.DysStatsApiUrl
                    ? `${appConfig.DysStatsApiUrl.replace(/\/$/, '')}/player/${row.SteamID}`
                    : `#`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {row.DysRank}
              </Link>)
            </span>
          ) : (
            row.DysPoints
          )}
          <Tooltip
            title={
              <div>
                {[
                  { name: 'Assist', value: row.DysAssist ?? 0 },
                  { name: 'Cyberdamage', value: row.DysCyberdamage ?? 0 },
                  { name: 'Cyberfrag', value: row.DysCyberfrag ?? 0 },
                  { name: 'Damage', value: row.DysDamage ?? 0 },
                  { name: 'Frag', value: row.DysFrag ?? 0 },
                  { name: 'Hack', value: row.DysHack ?? 0 },
                  { name: 'Healing', value: row.DysHealing ?? 0 },
                  { name: 'Objective', value: row.DysObjective ?? 0 },
                  { name: 'Secondary', value: row.DysSecondary ?? 0 },
                  { name: 'Tacscan', value: row.DysTacscan ?? 0 },
                ]
                  .sort((a, b) => b.value - a.value)
                  .map((stat, index) => {
                    // Color gradient: red (1) -> orange (3-4) -> yellow (5-6) -> blue (10)
                    const totalStats = 10;
                    const rank = index + 1;
                    const ratio = (rank - 1) / (totalStats - 1);
                    let backgroundColor;
                    if (ratio < 0.25) {
                      // Red to orange
                      const t = ratio / 0.25;
                      backgroundColor = `rgb(255, ${Math.round(165 * t)}, 0)`;
                    } else if (ratio < 0.5) {
                      // Orange to yellow
                      const t = (ratio - 0.25) / 0.25;
                      backgroundColor = `rgb(255, ${Math.round(165 + 90 * t)}, 0)`;
                    } else if (ratio < 0.75) {
                      // Yellow to light blue
                      const t = (ratio - 0.5) / 0.25;
                      backgroundColor = `rgb(${Math.round(255 - 200 * t)}, 255, ${Math.round(100 * t)})`;
                    } else {
                      // Light blue to blue
                      const t = (ratio - 0.75) / 0.25;
                      backgroundColor = `rgb(${Math.round(55 - 55 * t)}, ${Math.round(255 - 200 * t)}, ${Math.round(100 + 155 * t)})`;
                    }

                    return (
                      <div
                        key={stat.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor,
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          {rank}
                        </span>
                        <strong>{stat.name}:</strong> {stat.value}
                      </div>
                    );
                  })}
              </div>
            }
          >
            <InfoIcon color="primary" fontSize="small" style={{ cursor: 'help' }} />
          </Tooltip>
        </span>
      ) : (
        '-'
      )}
    </StyledTableCell>
  );
}

