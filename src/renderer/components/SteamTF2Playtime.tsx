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

// Steam TF2 Playtime component
export default function SteamTF2Playtime({ hours }: { hours: string }) {
  let steamPlaytimeDisplay;
  if (hours === 'IN_PROGRESS') {
    steamPlaytimeDisplay = <LoadingSpinner />;
  } else if (!Number.isNaN(Number(hours)) && Number(hours) >= 0) {
    steamPlaytimeDisplay = `${hours} hours`;
  } else {
    steamPlaytimeDisplay = 'N/A';
  }

  return <div>Steam-TF2: {steamPlaytimeDisplay}</div>;
}
