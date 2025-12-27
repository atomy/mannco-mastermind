import React from 'react';

// Loading spinner component
function LoadingSpinner() {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <span
        style={{
          display: 'inline-block',
          animation: 'spin 1s linear infinite',
        }}
      >
        ⏳
      </span>
    </>
  );
}

// Steam Playtime component - displays both Steam playtime and TF2 playtime
export default function PlayTimeForGame({
  hours,
  tf2Minutes,
}: {
  hours: string;
  tf2Minutes: number;
}) {
  let steamPlaytimeDisplay;
  if (hours === 'IN_PROGRESS') {
    steamPlaytimeDisplay = <LoadingSpinner />;
  } else if (!Number.isNaN(Number(hours)) && Number(hours) >= 0) {
    steamPlaytimeDisplay = `${hours} hours`;
  } else {
    steamPlaytimeDisplay = 'N/A';
  }

  return (
    <div>
      <div>Steam: {steamPlaytimeDisplay}</div>
      <div> hours={tf2Minutes.toString()} />
    </div>
  );
}
