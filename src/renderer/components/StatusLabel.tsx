import React from 'react';

export interface StatusLabelProps {
  text: string;
  type: 'error' | 'success' | 'warning' | 'info';
  show?: boolean;
}

const StatusLabel: React.FC<StatusLabelProps> = ({
  text,
  type,
  show = true,
}) => {
  if (!show) return null;

  const getLabelStyles = () => {
    const baseStyles = {
      fontSize: '0.8rem',
      padding: '4px 8px',
      borderRadius: '4px',
      border: '1px solid',
    };

    switch (type) {
      case 'error':
        return {
          ...baseStyles,
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          borderColor: '#f44336',
        };
      case 'success':
        return {
          ...baseStyles,
          color: '#2e7d32',
          backgroundColor: '#e8f5e8',
          borderColor: '#4caf50',
        };
      case 'warning':
        return {
          ...baseStyles,
          color: '#ed6c02',
          backgroundColor: '#fff4e5',
          borderColor: '#ff9800',
        };
      case 'info':
        return {
          ...baseStyles,
          color: '#0288d1',
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
        };
      default:
        return baseStyles;
    }
  };

  return <span style={getLabelStyles()}>{text}</span>;
};

export default StatusLabel;
