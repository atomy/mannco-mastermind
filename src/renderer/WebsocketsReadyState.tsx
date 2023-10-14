import { ReadyState } from 'react-use-websocket';

import React from 'react';

interface WebsocketsReadyStateProps {
  value: ReadyState;
}

export default function WebsocketsReadyState({
  value,
}: WebsocketsReadyStateProps) {
  const connectionStatus = {
    [ReadyState.CONNECTING]: '⚠️',
    [ReadyState.OPEN]: '✅',
    [ReadyState.CLOSING]: '❌',
    [ReadyState.CLOSED]: '❌',
    [ReadyState.UNINSTANTIATED]: '❌',
  };

  return <span>{connectionStatus[value]}</span>;
}
