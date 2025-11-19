/**
 * Session API Routes
 *
 * Simple REST endpoints for session management
 */

import type { Request, Response, Router } from 'express';
import { createLogger } from '@brepflow/engine-core';

const logger = createLogger('Collaboration');
import { sessionManager } from '../simple-session';
import type { GraphInstance } from '@brepflow/types';

/**
 * Register session routes on Express router
 */
export function registerSessionRoutes(router: Router): void {
  /**
   * POST /api/sessions
   * Create new session
   */
  router.post('/api/sessions', (req: Request, res: Response) => {
    try {
      const { graph } = req.body as { graph?: GraphInstance };
      const session = sessionManager.createSession(graph);

      res.status(201).json({
        sessionId: session.id,
        created: session.created,
        nodeCount: session.graph.nodes.length,
      });
    } catch (error) {
      logger.error('[SessionRoutes] Error creating session:', error);
      res.status(500).json({
        error: 'Failed to create session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/sessions/:sessionId
   * Get session data
   */
  router.get('/api/sessions/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const session = sessionManager.getSession(sessionId);

      if (!session) {
        res.status(404).json({
          error: 'Session not found',
          sessionId,
        });
        return;
      }

      res.status(200).json({
        sessionId: session.id,
        graph: session.graph,
        created: session.created,
        lastModified: session.lastModified,
      });
    } catch (error) {
      logger.error('[SessionRoutes] Error getting session:', error);
      res.status(500).json({
        error: 'Failed to get session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * PUT /api/sessions/:sessionId
   * Update session graph
   */
  router.put('/api/sessions/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { graph } = req.body as { graph: GraphInstance };

      if (!graph) {
        res.status(400).json({
          error: 'Missing graph data',
        });
        return;
      }

      const success = sessionManager.updateSession(sessionId, graph);

      if (!success) {
        res.status(404).json({
          error: 'Session not found',
          sessionId,
        });
        return;
      }

      res.status(200).json({
        sessionId,
        updated: true,
      });
    } catch (error) {
      logger.error('[SessionRoutes] Error updating session:', error);
      res.status(500).json({
        error: 'Failed to update session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * DELETE /api/sessions/:sessionId
   * Delete session
   */
  router.delete('/api/sessions/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const success = sessionManager.deleteSession(sessionId);

      if (!success) {
        res.status(404).json({
          error: 'Session not found',
          sessionId,
        });
        return;
      }

      res.status(200).json({
        sessionId,
        deleted: true,
      });
    } catch (error) {
      logger.error('[SessionRoutes] Error deleting session:', error);
      res.status(500).json({
        error: 'Failed to delete session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/sessions/:sessionId/export
   * Export session geometry to STEP/STL
   */
  router.post('/api/sessions/:sessionId/export', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { format } = req.body as { format: 'step' | 'stl' };

      if (!format || !['step', 'stl'].includes(format)) {
        res.status(400).json({
          error: 'Invalid or missing format',
          validFormats: ['step', 'stl'],
        });
        return;
      }

      const session = sessionManager.getSession(sessionId);
      if (!session) {
        res.status(404).json({
          error: 'Session not found',
          sessionId,
        });
        return;
      }

      // Use export helper to generate geometry file
      const { exportSessionGeometry } = await import('./export-helper');
      const exportResult = await exportSessionGeometry(session.graph, format);

      // Return file as download
      res.setHeader('Content-Type', format === 'step' ? 'application/step' : 'model/stl');
      res.setHeader('Content-Disposition', `attachment; filename="design.${format}"`);
      res.send(exportResult.content);
    } catch (error) {
      logger.error('[SessionRoutes] Error exporting session:', error);
      res.status(500).json({
        error: 'Failed to export session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/sessions
   * List all sessions (for debugging)
   */
  router.get('/api/sessions', (req: Request, res: Response) => {
    try {
      const sessions = sessionManager.getAllSessions();
      res.status(200).json({
        count: sessions.length,
        sessions,
      });
    } catch (error) {
      logger.error('[SessionRoutes] Error listing sessions:', error);
      res.status(500).json({
        error: 'Failed to list sessions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
