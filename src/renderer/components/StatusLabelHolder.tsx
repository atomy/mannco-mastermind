import React from 'react';
import StatusLabel, { StatusLabelProps } from './StatusLabel';

export interface StatusLabelHolderProps {
  teamsAvailable: boolean;
  isRconConnected: boolean;
  className?: string;
}

const StatusLabelHolder: React.FC<StatusLabelHolderProps> = ({
  teamsAvailable,
  isRconConnected,
  className = '',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}
      className={className}
    >
      <StatusLabel
        text="No Team Information available!"
        type="error"
        show={isRconConnected && !teamsAvailable}
      />
      <StatusLabel
        text="Team Information available!"
        type="success"
        show={isRconConnected && teamsAvailable}
      />
      <StatusLabel
        text="RCON Connected"
        type="success"
        show={isRconConnected}
      />
      <StatusLabel
        text="RCON Disconnected"
        type="error"
        show={!isRconConnected}
      />
      {/* Add more status labels here as needed */}
      {/* Example:
      <StatusLabel
        text="High Latency"
        type="warning"
        show={hasHighLatency}
      />
      */}
    </div>
  );
};

export default StatusLabelHolder;
