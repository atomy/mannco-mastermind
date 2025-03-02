import React, { ReactNode } from 'react';
import Button from '@mui/material/Button';

const baseStyle = {
  backgroundColor: '#000000',
  color: '#f5e7de',
  borderRadius: 0,
} as React.CSSProperties;

const selectedStyle = {
  backgroundColor: '#5b7a8c',
} as React.CSSProperties;

// Define the prop types, including children
type NavigationButtonProps = {
  onClick: () => void;
  selected: boolean;
  children: ReactNode;
  disabled?: boolean;
};

// Use a function declaration for the component
function NavigationButton({
  onClick,
  selected,
  children,
  disabled = false,
}: NavigationButtonProps) {
  const buttonStyle = selected ? { ...baseStyle, ...selectedStyle } : baseStyle;

  return (
    <Button style={buttonStyle} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

export default NavigationButton;
