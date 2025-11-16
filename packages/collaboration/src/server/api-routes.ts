/**
 * Collaboration API Routes
 * Express/HTTP API endpoints for collaboration server
 */

import type { Request, Response, NextFunction } from 'express';
import type { CollaborationServer } from './collaboration-server';
import * as crypto from 'crypto';

// Type augmentation for express-session
// This allows req.session to be used when express-session middleware is installed
declare global {
  namespace Express {
    interface Request {
      session?: {
        id?: string;
        [key: string]: any;
      };
    }
  }
}

export interface APIRoutesOptions {
  /**
   * Base path for API routes (default: '/api/collaboration')
   */
  basePath?: string;

  /**
   * Enable session management (requires express-session middleware)
   */
  enableSessions?: boolean;

  /**
   * Custom session ID generator
   */
  generateSessionId?: () => string;
}

/**
 * Default session ID generator
 */
function defaultSessionIdGenerator(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Setup API routes for collaboration server
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { CollaborationServer } from '@brepflow/collaboration';
 * import { setupAPIRoutes } from '@brepflow/collaboration/server';
 *
 * const app = express();
 * const server = http.createServer(app);
 * const collabServer = new CollaborationServer(server, {
 *   corsOrigin: ['http://localhost:5173'],
 *   csrfTokenSecret: process.env.CSRF_SECRET,
 * });
 *
 * setupAPIRoutes(app, collabServer);
 * ```
 */
export function setupAPIRoutes(
  app: any, // Express application
  collaborationServer: CollaborationServer,
  options: APIRoutesOptions = {}
): void {
  const {
    basePath = '/api/collaboration',
    enableSessions = true,
    generateSessionId = defaultSessionIdGenerator,
  } = options;

  /**
   * GET /api/collaboration/csrf-token
   * Generate and return a CSRF token for WebSocket authentication
   *
   * Response:
   * {
   *   csrfToken: string;
   *   sessionId: string;
   * }
   */
  app.get(`${basePath}/csrf-token`, (req: Request, res: Response) => {
    try {
      // Get or create session ID
      let sessionId: string;

      if (enableSessions && req.session) {
        // Use express-session if available
        sessionId = req.session.id || generateSessionId();
        if (!req.session.id) {
          req.session.id = sessionId;
        }
      } else {
        // Generate temporary session ID
        sessionId = generateSessionId();
      }

      // Generate CSRF token
      const csrfToken = collaborationServer.generateCSRFToken(sessionId);

      // Return token and session ID
      res.json({
        csrfToken,
        sessionId,
      });
    } catch (error) {
      console.error('[API] Failed to generate CSRF token:', error);
      res.status(500).json({
        error: 'Failed to generate CSRF token',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/collaboration/health
   * Health check endpoint for collaboration server
   *
   * Response:
   * {
   *   status: 'ok' | 'error';
   *   uptime: number;
   *   connections: number;
   * }
   */
  app.get(`${basePath}/health`, (req: Request, res: Response) => {
    try {
      // Get server stats (you may need to add these methods to CollaborationServer)
      const stats = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/collaboration/validate-token
   * Validate a CSRF token (for testing/debugging)
   *
   * Request Body:
   * {
   *   csrfToken: string;
   * }
   *
   * Response:
   * {
   *   valid: boolean;
   * }
   */
  if (process.env.NODE_ENV !== 'production') {
    app.post(`${basePath}/validate-token`, (req: Request, res: Response) => {
      try {
        const { csrfToken } = req.body;

        if (!csrfToken || typeof csrfToken !== 'string') {
          return res.status(400).json({
            error: 'Missing or invalid csrfToken',
          });
        }

        // Validate token using internal method
        // Note: This assumes CollaborationServer has a public validation method
        // You may need to add this to the CollaborationServer class
        const valid = (collaborationServer as any).validateCSRFToken?.(csrfToken) ?? false;

        res.json({ valid });
      } catch (error) {
        res.status(500).json({
          error: 'Token validation failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  console.log(`[API] Collaboration routes mounted at ${basePath}`);
}

/**
 * Middleware to require CSRF token for protected routes
 *
 * @example
 * ```typescript
 * app.post('/api/collaboration/admin',
 *   requireCSRFToken(collabServer),
 *   (req, res) => {
 *     // Protected route handler
 *   }
 * );
 * ```
 */
export function requireCSRFToken(collaborationServer: CollaborationServer) {
  return (req: Request, res: Response, next: NextFunction) => {
    const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;

    if (!csrfToken) {
      return res.status(403).json({
        error: 'CSRF token required',
      });
    }

    // Validate token
    const valid = (collaborationServer as any).validateCSRFToken?.(csrfToken) ?? false;

    if (!valid) {
      return res.status(403).json({
        error: 'Invalid or expired CSRF token',
      });
    }

    next();
  };
}

/**
 * Export types for use in other modules
 */
export type { Request, Response, NextFunction };
