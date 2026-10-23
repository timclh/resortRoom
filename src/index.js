import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { RoomProvider } from './context';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <RoomProvider>
      <Router>
        <App />
      </Router>
    </RoomProvider>
  </React.StrictMode>
);

// Log Core Web Vitals while developing. The condition is resolved at build
// time, so web-vitals is left out of the production bundle.
if (process.env.NODE_ENV === 'development') {
  import('./reportWebVitals').then(({ default: reportWebVitals }) =>
    reportWebVitals(console.log)
  );
}
