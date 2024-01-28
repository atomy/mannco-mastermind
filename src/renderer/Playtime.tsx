import React from 'react';

export default function Playtime(props: { seconds: number }) {
  const { seconds } = props;

  if (typeof seconds === 'undefined') {
    return <span style={{ color: 'red' }}>N/A</span>;
  }

  const hours = Math.floor(seconds / 3600);

  return <span>{hours} hours</span>;
}
