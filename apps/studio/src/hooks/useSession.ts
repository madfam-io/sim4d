/**
 * Session Management Hook
 *
 * Manages session lifecycle: create, load, save, share
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { GraphInstance } from '@sim4d/types';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'useSession' });

export interface SessionHookResult {
  sessionId: string | null;
  graph: GraphInstance | null;
  loading: boolean;
  error: Error | null;
  createNewSession: () => Promise<void>;
  updateSession: (graph: GraphInstance) => Promise<void>;
  getShareUrl: () => string | null;
  deleteSession: () => Promise<void>;
}

// In production, if no API URL is configured, use empty string to skip collaboration features
// In development, default to localhost:8080
const API_BASE_URL =
  import.meta.env['VITE_API_BASE_URL'] || (import.meta.env['PROD'] ? '' : 'http://localhost:8080');

/**
 * Create empty graph template
 */
function createEmptyGraph(): GraphInstance {
  return {
    nodes: [],
    edges: [],
    version: '0.1.0',
    units: 'mm',
    tolerance: 0.01,
  };
}

/**
 * Session management hook
 */
export function useSession(): SessionHookResult {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();

  const [graph, setGraph] = useState<GraphInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load session from server
   */
  const loadSession = useCallback(
    async (id: string) => {
      // Skip API call if no collaboration server is configured - use local session
      if (!API_BASE_URL) {
        logger.info('Collaboration server not configured, using local session', {
          environment: import.meta.env['PROD'] ? 'production' : 'development',
        });
        const emptyGraph = createEmptyGraph();
        setGraph(emptyGraph);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/sessions/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Session not found or expired');
          }
          throw new Error(`Failed to load session: ${response.statusText}`);
        }

        const data = await response.json();
        setGraph(data.graph);
      } catch (err) {
        logger.error('Failed to load session', {
          error: err instanceof Error ? err.message : String(err),
          sessionId: id,
          apiBaseUrl: API_BASE_URL,
        });
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // Redirect to home on error
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Create new session
   */
  const createNewSession = useCallback(async () => {
    // Skip API call if no collaboration server is configured
    if (!API_BASE_URL) {
      logger.info('Collaboration server not configured, using local session', {
        environment: import.meta.env['PROD'] ? 'production' : 'development',
      });
      const localSessionId = crypto.randomUUID();
      const emptyGraph = createEmptyGraph();
      setGraph(emptyGraph);
      navigate(`/session/${localSessionId}`, { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const emptyGraph = createEmptyGraph();
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graph: emptyGraph }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      navigate(`/session/${data.sessionId}`, { replace: true });
    } catch (err) {
      logger.error('Failed to create new session', {
        error: err instanceof Error ? err.message : String(err),
        apiBaseUrl: API_BASE_URL,
      });
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Update session graph
   */
  const updateSession = useCallback(
    async (updatedGraph: GraphInstance) => {
      if (!sessionId) {
        logger.warn('Cannot update session: no session ID', {
          graphNodeCount: updatedGraph.nodes.length,
        });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ graph: updatedGraph }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update session: ${response.statusText}`);
        }

        setGraph(updatedGraph);
      } catch (err) {
        logger.error('Failed to update session', {
          error: err instanceof Error ? err.message : String(err),
          sessionId,
          graphNodeCount: updatedGraph.nodes.length,
        });
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [sessionId]
  );

  /**
   * Delete session
   */
  const deleteSession = useCallback(async () => {
    if (!sessionId) {
      logger.warn('Cannot delete session: no session ID');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }

      navigate('/', { replace: true });
    } catch (err) {
      logger.error('Failed to delete session', {
        error: err instanceof Error ? err.message : String(err),
        sessionId,
      });
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [sessionId, navigate]);

  /**
   * Get shareable URL
   */
  const getShareUrl = useCallback((): string | null => {
    if (!sessionId) {
      return null;
    }
    return `${window.location.origin}/session/${sessionId}`;
  }, [sessionId]);

  /**
   * Effect: Load or create session on mount
   */
  useEffect(() => {
    // Skip if no sessionId from route params
    if (!sessionId) {
      return;
    }

    // If sessionId is "new", create a new session
    if (sessionId === 'new') {
      createNewSession();
      return;
    }

    // Load existing session
    loadSession(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadSession is intentionally excluded from deps to prevent infinite re-renders when session state changes
  }, [sessionId]);

  return {
    sessionId: sessionId || null,
    graph,
    loading,
    error,
    createNewSession,
    updateSession,
    getShareUrl,
    deleteSession,
  };
}
