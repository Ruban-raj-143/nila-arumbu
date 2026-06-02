import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Clear stale IndexedDB cache on every app load so server data always wins
if (typeof indexedDB !== 'undefined') {
  indexedDB.deleteDatabase('NilaArumbuDB');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
