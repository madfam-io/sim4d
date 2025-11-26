// Load Node.js polyfills first
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { JanuaAuthProvider } from './providers/JanuaAuthProvider';
import './design-system/tokens.css';
import './index.css';
import { createChildLogger } from './lib/logging/logger-instance';

const logger = createChildLogger({ module: 'main' });

// Check for SharedArrayBuffer support (required for WASM threads)
if (!crossOriginIsolated) {
  logger.warn(
    'SharedArrayBuffer is not available. WASM threads will be disabled.\n' +
      'Make sure the server sends proper COOP/COEP headers.'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <JanuaAuthProvider>
        <App />
      </JanuaAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
