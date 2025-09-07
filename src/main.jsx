// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Register SW only in production to avoid dev/HMR loops
if (import.meta.env.PROD) {
  import('./sw-register.js').then(m => m.registerServiceWorker());
}
