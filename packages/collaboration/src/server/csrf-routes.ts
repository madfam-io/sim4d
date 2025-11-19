/**
 * CSRF Token Routes
 *
 * HTTP endpoints for CSRF token generation for WebSocket authentication
 */

import type { Router, Request, Response } from 'express';
import { createLogger } from '@brepflow/engine-core';

const logger = createLogger('Collaboration');
import type { CollaborationServer } from './collaboration-server';

export interface CSRFRoutesOptions {
  collaborationServer: CollaborationServer;
}

/**
 * Register CSRF token routes on Express router
 */
export function registerCSRFRoutes(router: Router, options: CSRFRoutesOptions): void {
  const { collaborationServer } = options;

  /**
   * GET /api/collaboration/csrf-token
   *
   * Generate and return CSRF token for WebSocket authentication
   * Client must call this before establishing WebSocket connection
   */
  router.get('/csrf-token', (req: Request, res: Response) => {
    try {
      // Generate session-specific CSRF token
      const sessionId = req.query.sessionId as string;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'sessionId query parameter required',
        });
        return;
      }

      // Generate CSRF token
      const csrfToken = collaborationServer.generateCSRFToken(sessionId);

      // Return token with 1-hour expiration info
      res.json({
        success: true,
        token: csrfToken,
        expiresIn: 3600, // 1 hour in seconds
        sessionId,
      });
    } catch (error) {
      logger.error('[CSRF Routes] Token generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate CSRF token',
      });
    }
  });

  /**
   * POST /api/collaboration/csrf-token/refresh
   *
   * Refresh an existing CSRF token
   */
  router.post('/csrf-token/refresh', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'sessionId required in request body',
        });
        return;
      }

      // Generate new token
      const csrfToken = collaborationServer.generateCSRFToken(sessionId);

      res.json({
        success: true,
        token: csrfToken,
        expiresIn: 3600,
        sessionId,
      });
    } catch (error) {
      logger.error('[CSRF Routes] Token refresh failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh CSRF token',
      });
    }
  });
}
