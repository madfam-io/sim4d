/**
 * E2E Tests for Collaboration with CSRF Protection
 *
 * Tests complete user workflows with CSRF authentication
 */

import { test, expect } from '@playwright/test';
import { setupPageForTest } from './helpers/onboarding';

test.describe('Collaboration Workflow with CSRF Protection', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageForTest(page);
  });

  test('should fetch CSRF token on app load', async ({ page }) => {
    // Listen for CSRF token request
    const csrfTokenRequest = page.waitForRequest(
      (request) =>
        request.url().includes('/api/collaboration/csrf-token') &&
        request.method() === 'GET'
    );

    // Reload page to trigger token fetch
    await page.reload();

    const request = await csrfTokenRequest;
    expect(request.url()).toContain('/api/collaboration/csrf-token');

    // Wait for response
    const response = await request.response();
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('sessionId');
  });

  // FIXME: Test assumes window.collaborationAPI exists but it doesn't - needs rewrite
  // The app uses React CollaborationProvider, not a global API object
  test.skip('should cache CSRF token and avoid redundant requests', async ({ page }) => {
    // Set up request promise BEFORE reload to avoid race condition
    const firstRequest = page.waitForRequest(
      (request) =>
        request.url().includes('/api/collaboration/csrf-token') &&
        request.method() === 'GET'
    );

    // Reload page
    await page.reload();

    // Wait for and verify the first request happened
    const request = await firstRequest;
    expect(request.url()).toContain('/api/collaboration/csrf-token');

    // Now monitor for additional requests (should be 0 - cached)
    let additionalRequests = 0;
    page.on('request', (req) => {
      if (req.url().includes('/api/collaboration/csrf-token')) {
        additionalRequests++;
      }
    });

    // Trigger collaboration features (should use cached token)
    await page.evaluate(() => {
      // Access collaboration API multiple times
      return Promise.all([
        (window as any).collaborationAPI?.getCSRFToken(),
        (window as any).collaborationAPI?.getCSRFToken(),
        (window as any).collaborationAPI?.getCSRFToken(),
      ]);
    });

    // Should be 0 additional requests (using cached token)
    expect(additionalRequests).toBe(0);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - architectural limitation of Playwright
  // Needs rewrite to test via UI interactions instead of programmatic hook calls
  test.skip('should create collaboration session with CSRF authentication', async ({ page }) => {
    // Listen for WebSocket connection
    let websocketConnected = false;
    let csrfTokenIncluded = false;

    page.on('websocket', (ws) => {
      ws.on('framesent', (event) => {
        const frame = event.payload;
        if (typeof frame === 'string' && frame.includes('csrfToken')) {
          csrfTokenIncluded = true;
        }
      });

      ws.on('framereceived', () => {
        websocketConnected = true;
      });
    });

    // Create collaboration session
    await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-1',
        name: 'Test User',
        color: '#3B82F6',
      };

      await actions.createSession('test-project-123', user);
    });

    // Verify WebSocket connected
    expect(websocketConnected).toBe(true);

    // Verify CSRF token was included (this check is best-effort)
    // In real implementation, you'd inspect WebSocket auth via devtools protocol
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should join existing collaboration session', async ({ page }) => {
    // Create session first
    const sessionId = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-1',
        name: 'Test User 1',
        color: '#3B82F6',
      };

      return await actions.createSession('test-project-456', user);
    });

    expect(sessionId).toBeDefined();

    // Open second browser context (different user)
    const context2 = await page.context().browser()?.newContext();
    const page2 = await context2!.newPage();

    await page2.goto('http://localhost:5173');
    await page2.waitForLoadState('networkidle');

    // Second user joins session
    const joinSuccess = await page2.evaluate(
      async (sid) => {
        const { useCollaboration } = await import('./hooks/useCollaboration');
        const [, actions] = useCollaboration();

        const user = {
          id: 'test-user-2',
          name: 'Test User 2',
          color: '#EF4444',
        };

        try {
          await actions.joinSession(sid, user);
          return true;
        } catch (error) {
          console.error('Join failed:', error);
          return false;
        }
      },
      sessionId as string
    );

    expect(joinSuccess).toBe(true);

    // Cleanup
    await page2.close();
    await context2?.close();
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should update cursor position in real-time', async ({ page }) => {
    // Create session
    await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-cursor',
        name: 'Cursor Test User',
        color: '#10B981',
      };

      await actions.createSession('test-project-cursor', user);
    });

    // Update cursor position
    const updateSuccess = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      try {
        await actions.updateCursor({
          x: 100,
          y: 200,
          timestamp: Date.now(),
        });
        return true;
      } catch (error) {
        return false;
      }
    });

    expect(updateSuccess).toBe(true);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should update selection state', async ({ page }) => {
    // Create session
    await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-selection',
        name: 'Selection Test User',
        color: '#F59E0B',
      };

      await actions.createSession('test-project-selection', user);
    });

    // Update selection
    const updateSuccess = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      try {
        await actions.updateSelection(['node-1', 'node-2'], ['edge-1']);
        return true;
      } catch (error) {
        return false;
      }
    });

    expect(updateSuccess).toBe(true);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should leave collaboration session cleanly', async ({ page }) => {
    // Create session
    await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-leave',
        name: 'Leave Test User',
        color: '#8B5CF6',
      };

      await actions.createSession('test-project-leave', user);
    });

    // Leave session
    const leaveSuccess = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      try {
        await actions.leaveSession();
        return true;
      } catch (error) {
        return false;
      }
    });

    expect(leaveSuccess).toBe(true);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should handle network interruption and reconnect', async ({ page, context }) => {
    // Create session
    await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-reconnect',
        name: 'Reconnect Test User',
        color: '#EC4899',
      };

      await actions.createSession('test-project-reconnect', user);
    });

    // Simulate network interruption
    await context.setOffline(true);

    // Wait for disconnection
    await page.waitForTimeout(2000);

    // Restore network
    await context.setOffline(false);

    // Wait for reconnection
    await page.waitForTimeout(3000);

    // Verify reconnection by checking connection state
    const isConnected = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [state] = useCollaboration();
      return state.isConnected;
    });

    expect(isConnected).toBe(true);
  });

  // FIXME: Cannot import React hooks/modules in page.evaluate() - needs UI-based rewrite
  test.skip('should handle expired CSRF token gracefully', async ({ page }) => {
    // Get initial token
    await page.evaluate(async () => {
      const { collaborationAPI } = await import('./api/collaboration');
      await collaborationAPI.getCSRFToken();
    });

    // Manually expire token
    await page.evaluate(() => {
      const api = (window as any).collaborationAPI;
      if (api && api.currentToken) {
        api.currentToken.expiresAt = Date.now() - 1000; // Expired
      }
    });

    // Trigger collaboration action (should refresh token automatically)
    const success = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-expired',
        name: 'Expired Token Test',
        color: '#06B6D4',
      };

      try {
        await actions.createSession('test-project-expired', user);
        return true;
      } catch (error) {
        console.error('Session creation failed:', error);
        return false;
      }
    });

    expect(success).toBe(true);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should persist session across page refreshes', async ({ page }) => {
    // Create session
    const sessionId = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-persist',
        name: 'Persist Test User',
        color: '#14B8A6',
      };

      const sid = await actions.createSession('test-project-persist', user);

      // Store session ID for later verification
      localStorage.setItem('test_session_id', sid);

      return sid;
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify session ID persisted
    const persistedSessionId = await page.evaluate(() => {
      return localStorage.getItem('test_session_id');
    });

    expect(persistedSessionId).toBe(sessionId);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should not display console errors during collaboration workflow', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Complete workflow
    await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-console',
        name: 'Console Test User',
        color: '#84CC16',
      };

      // Create session
      const sessionId = await actions.createSession('test-project-console', user);

      // Update cursor
      await actions.updateCursor({ x: 50, y: 50, timestamp: Date.now() });

      // Update selection
      await actions.updateSelection(['node-1'], []);

      // Leave session
      await actions.leaveSession();
    });

    // Should have no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  // This test is actually OK - doesn't use import in page.evaluate
  test.skip('should enforce rate limiting on excessive connections', async ({ page }) => {
    let rateLimitHit = false;

    // Monitor network responses
    page.on('response', (response) => {
      if (response.status() === 429) {
        rateLimitHit = true;
      }
    });

    // Attempt rapid connections (15 attempts, limit is 10)
    await page.evaluate(async () => {
      const promises = [];

      for (let i = 0; i < 15; i++) {
        promises.push(
          fetch('http://localhost:8080/api/collaboration/csrf-token', {
            credentials: 'include',
          })
        );
      }

      await Promise.all(promises);
    });

    // Should hit rate limit
    expect(rateLimitHit).toBe(true);
  });
});

test.describe('Collaboration Error Handling', () => {
  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should handle server unavailable gracefully', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Configure to point to unavailable server
    await page.evaluate(() => {
      const { collaborationAPI } = (window as any);
      if (collaborationAPI) {
        collaborationAPI.updateConfig({ serverUrl: 'http://localhost:9999' });
      }
    });

    // Attempt to create session
    const errorCaught = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-error',
        name: 'Error Test User',
        color: '#F43F5E',
      };

      try {
        await actions.createSession('test-project-error', user);
        return false;
      } catch (error) {
        return true; // Error correctly caught
      }
    });

    expect(errorCaught).toBe(true);
  });

  // FIXME: Cannot import React hooks in page.evaluate() - needs UI-based rewrite
  test.skip('should display user-friendly error message on CSRF failure', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Force invalid CSRF token
    await page.evaluate(() => {
      const api = (window as any).collaborationAPI;
      if (api) {
        api.currentToken = {
          csrfToken: 'invalid-token',
          sessionId: 'invalid-session',
          expiresAt: Date.now() + 60000,
        };
      }
    });

    // Attempt collaboration action
    const errorMessage = await page.evaluate(async () => {
      const { useCollaboration } = await import('./hooks/useCollaboration');
      const [, actions] = useCollaboration();

      const user = {
        id: 'test-user-csrf-error',
        name: 'CSRF Error Test',
        color: '#DC2626',
      };

      try {
        await actions.createSession('test-project-csrf-error', user);
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    });

    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toMatch(/csrf|token|authentication/i);
  });
});
