import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { RoomProvider } from './context';

// React 18 createRoot API
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RoomProvider>
      <Router>
        <App />
      </Router>
    </RoomProvider>
  </React.StrictMode>
);

// Enable service worker for offline support and faster loading
serviceWorker.register();
