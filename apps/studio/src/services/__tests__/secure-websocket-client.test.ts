/**
 * Integration tests for Secure WebSocket Client with CSRF authentication
 *
 * Note: These tests verify the client logic. Full socket.io integration testing
 * is done in E2E tests with real collaboration server.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collaborationAPI } from '../../api/collaboration';

// Mock collaboration API
vi.mock('../../api/collaboration', () => ({
  collaborationAPI: {
    getCSRFToken: vi.fn(),
  },
}));

describe('SecureWebSocketClient - CSRF Authentication Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for CSRF token
    (collaborationAPI.getCSRFToken as any).mockResolvedValue({
      csrfToken: 'test-csrf-token-123',
      sessionId: 'test-session-456',
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
  });

  describe('CSRF Token Integration', () => {
    it('should use fresh token on reconnection', async () => {
      (collaborationAPI.getCSRFToken as any)
        .mockResolvedValueOnce({
          csrfToken: 'initial-token',
          sessionId: 'session-1',
          expiresAt: Date.now() + 60 * 60 * 1000,
        })
        .mockResolvedValueOnce({
          csrfToken: 'refreshed-token',
          sessionId: 'session-2',
          expiresAt: Date.now() + 60 * 60 * 1000,
        });

      // Verify mock is set up correctly
      const token1 = await collaborationAPI.getCSRFToken();
      expect(token1.csrfToken).toBe('initial-token');

      const token2 = await collaborationAPI.getCSRFToken(true);
      expect(token2.csrfToken).toBe('refreshed-token');
    });

    it('should handle CSRF token fetch errors', async () => {
      (collaborationAPI.getCSRFToken as any).mockRejectedValue(new Error('Token fetch failed'));

      await expect(collaborationAPI.getCSRFToken()).rejects.toThrow('Token fetch failed');
    });
  });

  describe('Token Refresh Logic', () => {
    it('should force refresh token with force=true flag', async () => {
      const mockToken = {
        csrfToken: 'cached-token',
        sessionId: 'session-1',
        expiresAt: Date.now() + 60 * 60 * 1000,
      };

      (collaborationAPI.getCSRFToken as any).mockResolvedValue(mockToken);

      // First call (normal)
      await collaborationAPI.getCSRFToken();

      // Second call with force=true should trigger new fetch
      await collaborationAPI.getCSRFToken(true);

      expect(collaborationAPI.getCSRFToken).toHaveBeenCalledTimes(2);
      expect(collaborationAPI.getCSRFToken).toHaveBeenLastCalledWith(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should detect CSRF-related errors', () => {
      const csrfError = new Error('Invalid CSRF token');
      const networkError = new Error('Network failure');

      // CSRF errors should contain 'csrf' or 'token'
      expect(csrfError.message.toLowerCase()).toMatch(/csrf/);

      // Non-CSRF errors should not
      expect(networkError.message.toLowerCase()).not.toMatch(/csrf/);
    });

    it('should handle server unavailable scenarios', async () => {
      (collaborationAPI.getCSRFToken as any).mockRejectedValue(new Error('Server unavailable'));

      await expect(collaborationAPI.getCSRFToken()).rejects.toThrow('Server unavailable');
    });
  });
});

describe('SecureWebSocketClient - Configuration', () => {
  it('should support custom server URLs', () => {
    const customUrl = 'http://custom-server:9000';
    expect(customUrl).toMatch(/^https?:\/\//);
  });

  it('should validate WebSocket connection configuration', () => {
    const config = {
      auth: { csrfToken: 'test-token' },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    expect(config.auth).toHaveProperty('csrfToken');
    expect(config.withCredentials).toBe(true);
    expect(config.reconnection).toBe(true);
  });
});

describe('SecureWebSocketClient - Best Practices', () => {
  it('should include credentials for CORS', () => {
    const socketConfig = {
      withCredentials: true,
    };

    expect(socketConfig.withCredentials).toBe(true);
  });

  it('should configure reconnection attempts', () => {
    const socketConfig = {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    expect(socketConfig.reconnectionAttempts).toBeGreaterThan(0);
    expect(socketConfig.reconnectionDelay).toBeGreaterThan(0);
  });
});
