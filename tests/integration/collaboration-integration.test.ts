/**
 * Integration Tests for Collaboration with Real Server
 *
 * Tests collaboration functionality with actual HTTP requests.
 * No mocking - requires Docker collaboration server to be running.
 *
 * Prerequisites:
 * - docker-compose up --build -d
 * - Collaboration server running on http://localhost:8080
 *
 * Note: WebSocket testing is handled by E2E tests in tests/e2e/collaboration-websocket.test.ts
 * This test suite focuses on HTTP API integration.
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:8080';

describe('Collaboration Integration Tests (Real Server)', () => {
  beforeAll(async () => {
    // Verify server is running
    try {
      const response = await fetch(`${API_URL}/api/collaboration/csrf-token?sessionId=test`);
      if (!response.ok) {
        throw new Error('Collaboration server not running');
      }
    } catch (error) {
      console.error('⚠️  Collaboration server not running. Start with: docker-compose up -d');
      throw error;
    }
  });

  describe('CSRF Token API', () => {
    it('should fetch CSRF token successfully', async () => {
      const response = await fetch(
        `${API_URL}/api/collaboration/csrf-token?sessionId=test-session`,
        {
          credentials: 'include',
        }
      );

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('expiresIn');

      expect(typeof data.token).toBe('string');
      expect(data.token.length).toBeGreaterThan(0);
      expect(typeof data.expiresIn).toBe('number');
      expect(data.expiresIn).toBeGreaterThan(0);
    });

    it('should return different tokens for different sessions', async () => {
      const response1 = await fetch(`${API_URL}/api/collaboration/csrf-token?sessionId=session-1`);
      const data1 = await response1.json();

      const response2 = await fetch(`${API_URL}/api/collaboration/csrf-token?sessionId=session-2`);
      const data2 = await response2.json();

      expect(data1.token).toBeDefined();
      expect(data2.token).toBeDefined();
      // Tokens should be different for different sessions
      expect(data1.token).not.toBe(data2.token);
    });

    it('should require sessionId parameter', async () => {
      const response = await fetch(`${API_URL}/api/collaboration/csrf-token`);
      const data = await response.json();

      // Server requires sessionId parameter
      expect(data.success).toBe(false);
    });
  });

  describe('HTTP Performance', () => {
    it('should handle concurrent CSRF token requests', async () => {
      // Test server can handle multiple simultaneous requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        fetch(`${API_URL}/api/collaboration/csrf-token?sessionId=concurrent-${i}`).then((res) =>
          res.json()
        )
      );

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results).toHaveLength(10);
      results.forEach((data, i) => {
        expect(data.success).toBe(true);
        expect(data.token).toBeDefined();
        expect(typeof data.token).toBe('string');
      });

      // Tokens should all be unique
      const tokens = results.map((r) => r.token);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(10);
    });

    it('should respond quickly to CSRF requests', async () => {
      const start = Date.now();

      const response = await fetch(`${API_URL}/api/collaboration/csrf-token?sessionId=perf-test`);
      const data = await response.json();

      const duration = Date.now() - start;

      expect(data.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should respond in < 1 second
    });
  });
});
