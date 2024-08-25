import * as React from 'react';

export default function SteamAccountAge(props: {
  steamCreatedTimestamp: number;
}) {
  const { steamCreatedTimestamp } = props;

  if (typeof steamCreatedTimestamp === 'undefined') {
    return <span style={{ color: 'red' }}>N/A</span>;
  }

  // Convert Unix timestamp to Date (assuming timestamp is in seconds)
  const creationDate = new Date(steamCreatedTimestamp * 1000);
  const currentDate = new Date();

  // Calculate difference in years and months
  let yearDiff = currentDate.getFullYear() - creationDate.getFullYear();
  let monthDiff = currentDate.getMonth() - creationDate.getMonth();
  let dayDiff = currentDate.getDate() - creationDate.getDate();

  // Adjust for month and day overflow
  if (dayDiff < 0) {
    monthDiff -= 1;
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      creationDate.getDate(),
    );
    dayDiff =
      (currentDate.getTime() - previousMonth.getTime()) / (1000 * 3600 * 24);
  }

  if (monthDiff < 0) {
    yearDiff -= 1;
    monthDiff += 12;
  }

  let ageString: string;
  let style = {};

  if (yearDiff > 0) {
    // No special color for more than a year
    ageString = `${yearDiff}y${monthDiff}m`;
  } else {
    ageString = `${monthDiff}m${Math.floor(dayDiff)}d`;
    style = monthDiff < 6 ? { color: 'red' } : { color: 'orange' }; // Red if under 6 months, otherwise orange
  }

  return <span style={style}>{ageString}</span>;
}
