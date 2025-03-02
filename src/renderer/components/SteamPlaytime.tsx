import React from 'react';

export default function SteamPlaytime(props: {
  hours: number;
  tf2Minutes: number;
}) {
  const { hours, tf2Minutes } = props;

  if (typeof tf2Minutes !== 'undefined') {
    return (
      <div>
        <div>{hours} hours</div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>
          TF2: {Math.floor(tf2Minutes / 3600)} hours
        </div>
      </div>
    );
  }

  if (typeof hours === 'undefined' || hours === -1) {
    return <span style={{ color: 'red' }}>N/A</span>;
  }

  return <span>{hours} hours</span>;
}
