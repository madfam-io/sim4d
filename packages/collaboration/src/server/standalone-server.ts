/**
 * Standalone Collaboration Server
 * 
 * Runs both Socket.IO collaboration server and Express REST API
 * for session management and geometry export
 */

import express, { type Express } from 'express';
import { createServer, type Server as HTTPServer } from 'http';
import cors from 'cors';
import { CollaborationServer } from './collaboration-server';
import { registerSessionRoutes } from './session-routes';
import { registerCSRFRoutes } from './csrf-routes';

const PORT = process.env.PORT || 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Create and start collaboration server
 */
export async function startCollaborationServer(): Promise<{
  app: Express;
  httpServer: HTTPServer;
  collaborationServer: CollaborationServer;
}> {
  // Create Express app
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.IO collaboration server
  const collaborationServer = new CollaborationServer(httpServer, {
    corsOrigin: CORS_ORIGIN,
    csrfTokenSecret: process.env.CSRF_TOKEN_SECRET,
    enableRateLimiting: true,
    maxConnectionsPerIP: 10,
  });

  // Register session routes on Express router
  const router = express.Router();
  registerSessionRoutes(router);
  app.use(router);

  // Register CSRF token routes
  const csrfRouter = express.Router();
  registerCSRFRoutes(csrfRouter, { collaborationServer });
  app.use('/api/collaboration', csrfRouter);

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`[CollaborationServer] Server running on port ${PORT}`);
    console.log(`[CollaborationServer] CORS origin: ${CORS_ORIGIN}`);
    console.log(`[CollaborationServer] Health check: http://localhost:${PORT}/health`);
    console.log(`[CollaborationServer] Session API: http://localhost:${PORT}/api/sessions`);
  });

  return { app, httpServer, collaborationServer };
}

// Start server if run directly
if (require.main === module) {
  startCollaborationServer().catch((error) => {
    console.error('[CollaborationServer] Failed to start:', error);
    process.exit(1);
  });
}
