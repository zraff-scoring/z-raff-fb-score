import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Resilient global listeners to catch and handle WebSocket and Vite HMR connection issues safely
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason && (reason.message || String(reason))) || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('vite') ||
      msg.includes('closed without opened') ||
      msg.includes('HMR')
    ) {
      console.warn('[Handled Promise Rejection Warning]:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('vite') ||
      msg.includes('closed without opened') ||
      msg.includes('HMR')
    ) {
      console.warn('[Handled Error Warning]:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
