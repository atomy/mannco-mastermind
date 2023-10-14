import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface WebsocketComponentProps {
  refreshPlayers: (jsonPlayers: string) => void;
  refreshReadyState: (readyState: ReadyState) => void;
}

export default function WebsocketComponent({
  refreshPlayers,
  refreshReadyState,
}: WebsocketComponentProps) {
  const jsonString =
    '[  {    "SteamID": 76561198071166330,    "Name": "KyoShred",    "UserID": 235,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198064588264,    "Name": "Thersty",    "UserID": 236,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198061955953,    "Name": "FROG",    "UserID": 239,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198134533794,    "Name": "Germantha",    "UserID": 265,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198018584709,    "Name": "p@T71k [cro]",    "UserID": 270,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198993867076,    "Name": "Koyote Moone TTV",    "UserID": 267,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561197960525500,    "Name": "atomy",    "UserID": 247,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198949050277,    "Name": "DogaGoToMars",    "UserID": 268,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561198071675229,    "Name": "Fourme",    "UserID": 252,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561197993525657,    "Name": "Нафаня",    "UserID": 254,    "SteamAccType": "U",    "SteamUniverse": 1  },  {    "SteamID": 76561199229831036,    "Name": "here\'s some choccy milk !",    "UserID": 259,    "SteamAccType": "U",    "SteamUniverse": 1  }]';

  const [socketUrl] = useState('ws://localhost:27689/websocket');
  const { sendMessage, lastMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl);

  const handleClickSendMessage = () => {
    refreshPlayers(jsonString);
  };

  useEffect(() => {
    if (lastMessage !== null) {
      console.log(`re: ${String(lastMessage.data)}`);
      refreshPlayers(String(lastMessage.data));
    }
  }, [lastMessage]); // eslint-disable-line

  // Close WebSocket connection when the component is unmounted or the page is reloaded
  useEffect(() => {
    refreshReadyState(readyState);
    const handleUnload = () => {
      // This function is called when the page is reloaded

      // Use the close method to close the WebSocket connection
      if (readyState === ReadyState.OPEN) {
        getWebSocket()?.close();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);

      // Use the close method to close the WebSocket connection
      if (readyState === ReadyState.OPEN) {
        getWebSocket()?.close();
      }
    };
  }, [getWebSocket, readyState, sendMessage]); // eslint-disable-line

  return (
    <div>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
        type="button"
      >
        Click Me to send *Hello*
      </button>
    </div>
  );
}
