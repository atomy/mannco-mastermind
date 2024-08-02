import React, { useState } from 'react';
import { RconAppLogEntry } from '../RconAppLogEntry';
import NavigationBar from './NavigationBar';
import BottomBoxConsole from './BottomBoxConsole';
import BottomBoxAll from './BottomBoxAll';
import BottomBoxChat from './BottomBoxChat';
import BottomBoxFrags from './BottomBoxFrags';
import { RconAppFragEntry } from '../RconAppFragEntry';

const containerStyleOpen = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '99vw',
  height: '400px',
  overflowY: 'scroll', // Add this to enable scrolling if the content exceeds the box height
  backgroundColor: '#5b7a8c',
  color: '#f5e7de',
  borderRadius: 0,
  border: 'none',
} as React.CSSProperties;

const containerStyleClose = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '99vw',
  maxHeight: '400px',
  overflowY: 'scroll', // Add this to enable scrolling if the content exceeds the box height
  backgroundColor: '#5b7a8c',
  color: '#f5e7de',
  borderRadius: 0,
  border: 'none',
} as React.CSSProperties;

export default function BottomBox(props: {
  consoleContent: RconAppLogEntry[];
  chatContent: RconAppLogEntry[];
  fragContent: RconAppFragEntry[];
}) {
  const { consoleContent, chatContent, fragContent } = props;
  const [selectedButton, setSelectedButton] = useState<string>('NONE');

  return (
    <div style={selectedButton !== "NONE" ? containerStyleOpen : containerStyleClose}>
      <NavigationBar
        initialSelected={selectedButton}
        onSelectChange={(buttonName) => {
          setSelectedButton(buttonName);
        }}
      />
      {selectedButton === 'CONSOLE' && (
        <BottomBoxConsole logs={consoleContent} />
      )}
      {selectedButton === 'ALL' && <BottomBoxAll logs={consoleContent} />}
      {selectedButton === 'CHAT' && <BottomBoxChat logs={[]} />}
      {selectedButton === 'FRAGS' && <BottomBoxFrags frags={fragContent} />}
    </div>
  );
}
