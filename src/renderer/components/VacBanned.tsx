import React, { useEffect, useState } from 'react';
// import { createCanvas, loadImage } from 'canvas';
import VacRed from '@assets/icons/vac-red.png';
import VacGrey from '@assets/icons/vac-grey.png';

// Creates icon with vac-banned image and a supplied number, that number is displayed within the icon.
export default function VacBanned(props: {
  strongWarning: boolean;
  number: number;
}) {
  const { strongWarning, number } = props; // %TODO, canvas stuff
  // const [iconCanvas, setIconCanvas] = useState<HTMLCanvasElement | null>(null);

  // useEffect(() => {
  //   const generateNumberedIcon = async () => {
  //     const image = await loadImage(strongWarning ? VacRed : VacGrey);
  //     const canvas = createCanvas(image.width, image.height);
  //     const ctx = canvas.getContext('2d');
  //
  //     // Draw the original icon
  //     ctx.drawImage(image, 0, 0);
  //
  //     // Customize text properties (font, size, color, etc.)
  //     ctx.font = 'bold 10px Arial';
  //     ctx.textAlign = 'center';
  //
  //     // Draw the number in the center of the icon
  //     ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
  //
  //     // Set the generated canvas in the state
  //     // @ts-ignore
  //     setIconCanvas(canvas);
  //   };
  //
  //   generateNumberedIcon();
  // }, [strongWarning, number]);

  return (
    <div>
      {/*{iconCanvas && (*/}
      {/*  <img*/}
      {/*    src={iconCanvas.toDataURL()}*/}
      {/*    title={`Days since last ban: ${number}`}*/}
      {/*    alt={`Days since last ban: ${number}`}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}
