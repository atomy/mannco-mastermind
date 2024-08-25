import React from 'react';
import { createRoot } from 'react-dom/client';
import WindowFrame from '@renderer/window/WindowFrame';
import Application from '@components/Application';

// Say something
console.log('[React] : Renderer execution started');

// Application to Render
const app = (
  <WindowFrame title="Mann Co. Mastermind - TF2!" platform="windows">
    <Application />
  </WindowFrame>
);

// Render application in DOM
createRoot(document.getElementById('app')).render(app);
