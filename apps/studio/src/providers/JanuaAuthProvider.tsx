/**
 * Janua Authentication Provider for BrepFlow Studio
 *
 * Integrates with MADFAM's centralized identity system (Janua)
 * for single sign-on across the Solarpunk ecosystem.
 */

import * as React from 'react';
import { JanuaProvider, useJanua, useAuth } from '@janua/react-sdk';
import type { JanuaConfig } from '@janua/react-sdk';

interface JanuaAuthProviderProps {
  children: React.ReactNode;
}

// Janua configuration - uses environment variables
const januaConfig: JanuaConfig = {
  baseURL: import.meta.env.VITE_JANUA_API_URL || 'http://localhost:3001',
  apiKey: import.meta.env.VITE_JANUA_API_KEY || '',
  environment: import.meta.env.PROD ? 'production' : 'development',
  debug: !import.meta.env.PROD,
};

export function JanuaAuthProvider({ children }: JanuaAuthProviderProps) {
  return <JanuaProvider config={januaConfig}>{children}</JanuaProvider>;
}

// Re-export hooks for convenience
export { useJanua, useAuth };
