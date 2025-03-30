import { AppConfig } from '@components/AppConfig';
import React, { useState } from 'react';
import NavigationButton from './NavigationButton';

const navigationBarStyle = {
  backgroundColor: '#9d312f',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  width: '100%',
} as React.CSSProperties;

// Define the prop types, including children
type NavigationBarProps = {
  onSelectChange: (buttonName: string) => void;
  initialSelected: string;
  appConfig: AppConfig;
};

// Use a function declaration for the component
function NavigationBar({
  onSelectChange,
  initialSelected,
  appConfig,
}: NavigationBarProps) {
  const [selectedButton, setSelectedButton] = useState<string>(initialSelected);

  const handleNavigationClick = (buttonName: string) => {
    setSelectedButton(buttonName);
    onSelectChange(buttonName);
  };

  return (
    <div style={navigationBarStyle}>
      <NavigationButton
        onClick={() => handleNavigationClick('ALL')}
        selected={selectedButton === 'ALL'}
      >
        ALL
      </NavigationButton>
      <NavigationButton
        onClick={() => handleNavigationClick('CONSOLE')}
        selected={selectedButton === 'CONSOLE'}
      >
        CONSOLE
      </NavigationButton>
      <NavigationButton
        onClick={() => handleNavigationClick('CHAT')}
        selected={selectedButton === 'CHAT'}
      >
        CHAT
      </NavigationButton>
      <NavigationButton
        onClick={() => handleNavigationClick('FRAGS')}
        selected={selectedButton === 'FRAGS'}
      >
        FRAGS
      </NavigationButton>
      {appConfig && appConfig.AppId === '440' && (
        <>
          <NavigationButton
            onClick={() => handleNavigationClick('CLASSES-MINE')}
            selected={selectedButton === 'CLASSES-MINE'}
          >
            CLASSES-MINE
          </NavigationButton>
          <NavigationButton
            onClick={() => handleNavigationClick('CLASSES-OTHER')}
            selected={selectedButton === 'CLASSES-OTHER'}
          >
            CLASSES-OTHER
          </NavigationButton>
        </>
      )}
      <NavigationButton
        onClick={() => handleNavigationClick('NONE')}
        selected={selectedButton === 'NONE'}
      >
        NONE
      </NavigationButton>
    </div>
  );
}

export default NavigationBar;
