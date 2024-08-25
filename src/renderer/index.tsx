import { createRoot } from 'react-dom/client';
import App from './App';
import { RemoteConfigProvider } from './RemoteConfigContext';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <RemoteConfigProvider>
    <App />
  </RemoteConfigProvider>,
);
