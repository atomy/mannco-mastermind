import React from 'react';
import VacRed from '@assets/icons/vac-red.png';
import VacGrey from '@assets/icons/vac-grey.png';

// Creates icon with vac-banned image and a supplied number, that number is displayed within the icon.
export default function VacBanned(props: {
  strongWarning: boolean;
  number: number;
}) {
  const { strongWarning, number } = props;
  const iconSrc = strongWarning ? VacRed : VacGrey;
  const tooltipText = `Days since last ban: ${number}`;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '24px',
        height: '24px',
      }}
      title={tooltipText}
    >
      <img
        src={iconSrc}
        alt={tooltipText}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
          lineHeight: '1',
        }}
      >
        {number}
      </span>
    </div>
  );
}
