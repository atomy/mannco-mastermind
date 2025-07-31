import React from 'react';

// TF2 API Playtime component
export default function TF2APIPlaytime({ tf2Minutes }: { tf2Minutes: number }) {
  const tf2Hours = Math.floor(tf2Minutes / 3600);

  return (
    <div style={{ fontSize: '0.9em', color: '#666' }}>
      TF2: {tf2Hours > 0 ? `${tf2Hours} hours` : 'N/A'}
    </div>
  );
}
