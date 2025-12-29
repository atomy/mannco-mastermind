import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Link from '@mui/material/Link';
import { styled } from '@mui/system';
import { PlayerInfo } from '@components/PlayerInfo';
import { AppConfig } from '@components/AppConfig';
import PlayerMarker from '@components/PlayerMarker';

const StyledTableCell = styled(TableCell)({
  paddingTop: '4px',
  paddingBottom: '4px',
});

const VALID_REPUTATION_TYPES = [
  'cheat',
  'bot',
  'warn',
  'spy',
  'sniper',
  'minusrep',
  'plusrep',
  'skillplus',
  'skillneutral',
  'skillminus',
] as const;

interface PlayerReputationCellProps {
  row: PlayerInfo;
  appConfig: AppConfig;
}

function hasValidReputationType(reputationType: string | undefined): boolean {
  if (!reputationType || reputationType === '') {
    return false;
  }
  return VALID_REPUTATION_TYPES.includes(
    reputationType as typeof VALID_REPUTATION_TYPES[number],
  );
}

export default function PlayerReputationCell({
  row,
  appConfig,
}: PlayerReputationCellProps) {
  const hasSteamBan = row.SteamBanDaysSinceLastBan > 0;
  const isReputationLoading = row.PlayerReputationType === 'IN_PROGRESS';
  const hasValidReputation = hasValidReputationType(row.PlayerReputationType);

  const hasReputation = hasSteamBan || isReputationLoading || hasValidReputation;

  const reputationUrl = appConfig?.ReputationWwwUrl
    ? `${appConfig.ReputationWwwUrl.replace(/\/$/, '')}/id/${row.SteamID}`
    : '#';

  return (
    <StyledTableCell align="right">
      <Link
        href={reputationUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {hasReputation ? (
          <PlayerMarker player={row} appConfig={appConfig} />
        ) : (
          '-'
        )}
      </Link>
    </StyledTableCell>
  );
}

