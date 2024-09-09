import React from 'react';
import AnimatedImage from './AnimatedImage';
import { PlayerInfo } from '@components/PlayerInfo';
import classIconMap, { ClassNames } from '@components/helper/classIconMap';
import AllClass from '@assets/icons/classes/allclass.png';

// Defining properties for this component
interface ClassIconProps {
  player: PlayerInfo;
}

// Component *ClassIcon* showing tf2 class icon the player is currently using.
export default function ClassIcon({ player }: ClassIconProps) {
  const getClassIcon = (className: string): string => {
    const classLowerCaseName = className.toLowerCase() as ClassNames;

    if (!classIconMap[classLowerCaseName]) {
      console.error(
        `Unable to locate class '${classLowerCaseName}' in classIconMap!`,
      );
    }
    return classIconMap[classLowerCaseName] || '';
  };

  // For the TF2 class icon logic
  const classIconSrc = player.TF2Class && player.TF2Class !== 'Unknown'
    ? getClassIcon(player.TF2Class)
    : AllClass;

  return (
    <AnimatedImage
      src={classIconSrc}
      alt="Class"
      width="26px"
      style={{ paddingLeft: '6px', paddingRight: '6px' }}
    />
  );
};
