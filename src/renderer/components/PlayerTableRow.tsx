import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/system';
import getCountryName from '@components/GetCountryName';
import SteamAccountAge from '@components/SteamAccountAge';
import PlayerMarker from '@components/PlayerMarker';
import PlayerAction from '@components/PlayerAction';
import { PlayerInfo } from '@components/PlayerInfo';
import AnimatedImage from '@components/AnimatedImage';
import SteamAvatar from '@components/SteamAvatar';
import ClassIcon from '@components/ClassIcon';
import sniperImage from '@assets/banners/sniper.png';
import spyImage from '@assets/banners/spy.png';
import faImage from '@assets/banners/fa.png';
import ownImage from '@assets/banners/own.png';
import warnImage from '@assets/banners/warn.png';
import plusrepImage from '@assets/banners/plusrep.png';
import cheatImage from '@assets/banners/cheat.png';
import getCountryCode from '@components/GetCountryCode';
import SteamPlaytime from '@components/SteamPlaytime';
import { AppConfig } from '@components/AppConfig';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

// Component *PlayerTableRow* describing one row in the players table showing all of the players information
export default function PlayerTableRow(props: {
  row: PlayerInfo;
  handleAddBlacklistSave: (
    steamid: string,
    type: string,
    reason: string,
  ) => void;
  appConfig: AppConfig;
}) {
  const { row, handleAddBlacklistSave, appConfig } = props;

  const rowStyle = (): any => {
    if (row.IsMe) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${ownImage})`,
        backgroundSize: 'contain',
        backgroundColor: '#768a88',
      };
    }

    if (['bot'].includes(row.PlayerReputationType)) {
      return {
        backgroundColor: '#bd3b3b',
      };
    }

    if (['sniper'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${sniperImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['cheat'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${cheatImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['plusrep'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${plusrepImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['spy'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${spyImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['minusrep'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${faImage})`,
        backgroundSize: 'contain',
      };
    }

    if (['warn'].includes(row.PlayerReputationType)) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${warnImage})`,
        backgroundSize: 'contain',
      };
    }

    return {
      backgroundColor: 'transparent',
    };
  };

  const countryFlagSrc = row.SteamCountryCode
    ? `https://flagcdn.com/h40/${getCountryCode(row.SteamCountryCode).toLowerCase()}.png`
    : 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Flag_of_None.svg/2560px-Flag_of_None.svg.png';

  const altText = row.SteamCountryCode
    ? `Players Country: ${getCountryCode(row.SteamCountryCode)}`
    : 'Players country: Unknown';

  const titleText = row.SteamCountryCode
    ? getCountryName(row.SteamCountryCode)
    : 'Country information unavailable';

  // @ts-ignore
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} style={rowStyle()}>
      <StyledTableCell
        component="th"
        scope="row"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '300px',
        }}
      >
        <AnimatedImage
          src={countryFlagSrc}
          alt={altText}
          title={titleText}
          width="30px"
          style={{ paddingRight: '4px' }}
        />
        {appConfig?.AppId === '440' && <ClassIcon player={row} />}
        <SteamAvatar player={row} />
        <span
          style={{
            paddingLeft: '10px',
          }}
        >
          {row.Name}
        </span>
      </StyledTableCell>
      <StyledTableCell align="left">
        <Link
          target="_blank"
          rel="noreferrer"
          href={`https://steamcommunity.com/profiles/${row.SteamID}`}
          style={{
            color: row.SteamVisible < 3 ? 'red' : '',
          }}
          title={row.SteamVisible < 3 ? 'Steam-Profile is private' : ''}
        >
          {row.SteamVisible < 3 ? 'Private' : 'Profile'}
        </Link>
      </StyledTableCell>
      <StyledTableCell align="right">
        {row.Ping > 200 && row.State !== 'spawning' ? (
          <WarningIcon color="warning" fontSize="small" />
        ) : (
          ''
        )}{' '}
        {row.Ping} / {row.Loss}
        {row.Loss > 1 && row.State !== 'spawning' ? (
          <WarningIcon color="warning" fontSize="small" />
        ) : (
          ''
        )}
      </StyledTableCell>
      <StyledTableCell align="right">
        {row.SteamPlaytime &&
        (row.SteamPlaytime === 'IN_PROGRESS' ||
          (!Number.isNaN(Number(row.SteamPlaytime)) && Number(row.SteamPlaytime) >= 0)) ? (
          <SteamPlaytime
            hours={row.SteamPlaytime}
            tf2Minutes={row.SteamTF2Playtime}
            appConfig={appConfig}
          />
        ) : (
          '-'
        )}
      </StyledTableCell>
      <StyledTableCell align="right">
        <SteamAccountAge steamCreatedTimestamp={row.SteamCreatedTimestamp} />
      </StyledTableCell>
      {/* Stats column only for Dystopia (appid 17580) */}
      {appConfig?.SteamAppId === '17580' && (
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
      )}
      <StyledTableCell align="right">
        {row.SteamBanDaysSinceLastBan > 0 ||
        row.PlayerReputationType === 'IN_PROGRESS' ||
        (        row.PlayerReputationType &&
          row.PlayerReputationType !== '' &&
          ['cheat', 'bot', 'warn', 'spy', 'sniper', 'minusrep', 'plusrep', 'skillplus', 'skillneutral', 'skillminus'].includes(
            row.PlayerReputationType,
          )) ? (
          <PlayerMarker player={row} appConfig={appConfig} />
        ) : appConfig?.ReputationWwwUrl ? (
          <Link
            href={`${appConfig.ReputationWwwUrl.replace(/\/$/, '')}/id/${row.SteamID}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            -
          </Link>
        ) : (
          '-'
        )}
      </StyledTableCell>
      <StyledTableCell align="right">
        <PlayerAction
          player={row}
          handleAddBlacklistSave={handleAddBlacklistSave}
        />
      </StyledTableCell>
    </TableRow>
  );
}
