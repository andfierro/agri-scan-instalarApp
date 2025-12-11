import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // We use a simple relative path here. The browser resolves './sw.js' 
    // relative to the current page automatically, avoiding manual URL construction errors.
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registered successfully:', registration.scope);
      })
      .catch(registrationError => {
        console.warn('SW registration failed:', registrationError);
      });
  });
}