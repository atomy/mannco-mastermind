import React, { useState } from 'react';
import NavigationButton from './NavigationButton';

const navigationBarStyle = {
  backgroundColor: '#9d312f',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
} as React.CSSProperties;

// Define the prop types, including children
type NavigationBarProps = {
  onSelectChange: (buttonName: string) => void;
  initialSelected: string;
};

// Use a function declaration for the component
function NavigationBar({
  onSelectChange,
  initialSelected,
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
      <NavigationButton
        onClick={() => handleNavigationClick('TEAMCLASSES')}
        selected={selectedButton === 'TEAMCLASSES'}
      >
        TEAMCLASSES
      </NavigationButton>
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
