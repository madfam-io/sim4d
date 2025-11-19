/**
 * React Hook for Collaboration Features
 * Manages real-time collaboration, presence, and synchronization with CSRF protection
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { BrepFlowCollaborationEngine } from '@brepflow/engine-core';
import { SecureWebSocketClient } from '../services/secure-websocket-client';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'useCollaboration' });

// Create secure WebSocket client
const secureWebSocketClient = new SecureWebSocketClient();

// Create collaboration engine with secure WebSocket
const collaborationEngine = new BrepFlowCollaborationEngine(secureWebSocketClient as unknown);
import type {
  CollaborationUser,
  CursorPosition,
  SelectionState,
  Operation,
} from '@brepflow/engine-core';
import { SessionId, UserId, NodeId } from '@brepflow/types';

// Selection type from collaboration engine
type Selection = {
  nodeIds: NodeId[];
  edgeIds: string[];
};

export interface CollaborationState {
  isConnected: boolean;
  sessionId: SessionId | null;
  currentUser: CollaborationUser | null;
  users: Map<UserId, CollaborationUser>;
  cursors: Map<UserId, CursorPosition>;
  selections: Map<UserId, SelectionState>;
  operationCount: number;
}

export interface CollaborationActions {
  // Session management
  createSession: (projectId: string, user: CollaborationUser) => Promise<SessionId>;
  joinSession: (sessionId: SessionId, user: CollaborationUser) => Promise<void>;
  leaveSession: () => Promise<void>;

  // Presence
  updateCursor: (cursor: CursorPosition) => Promise<void>;
  updateSelection: (selectedNodes: string[], selectedEdges: string[]) => Promise<void>;
  updateUser: (updates: Partial<CollaborationUser>) => Promise<void>;

  // Operations
  applyOperation: (operation: Operation) => Promise<void>;
}

export interface UseCollaborationOptions {
  autoConnect?: boolean;
  throttleCursor?: number;
  throttleSelection?: number;
}

export function useCollaboration(
  options: UseCollaborationOptions = {}
): [CollaborationState, CollaborationActions] {
  const {
    autoConnect: _autoConnect = false,
    throttleCursor = 50,
    throttleSelection = 200,
  } = options;

  // State
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    sessionId: null,
    currentUser: null,
    users: new Map(),
    cursors: new Map(),
    selections: new Map(),
    operationCount: 0,
  });

  // Throttling refs
  const cursorThrottleRef = useRef<number>();
  const selectionThrottleRef = useRef<number>();

  // WebSocket connection ref
  const wsConnectedRef = useRef(false);

  // Ensure WebSocket is connected before any collaboration operations
  const ensureWebSocketConnected = useCallback(async () => {
    if (!wsConnectedRef.current) {
      try {
        await secureWebSocketClient.connect();
        wsConnectedRef.current = true;
      } catch (error) {
        logger.error('WebSocket connection failed', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  }, []);

  // Actions
  const actions: CollaborationActions = {
    createSession: useCallback(
      async (projectId: string, user: CollaborationUser): Promise<SessionId> => {
        try {
          // Ensure WebSocket is connected before creating session
          await ensureWebSocketConnected();

          const sessionId = await collaborationEngine.createSession(
            projectId,
            UserId(user.id as string)
          );
          await collaborationEngine.joinSession(sessionId, user);

          setState((prev) => ({
            ...prev,
            isConnected: true,
            sessionId,
            currentUser: user,
          }));

          return sessionId;
        } catch (error) {
          logger.error('Session creation failed', {
            error: error instanceof Error ? error.message : String(error),
            projectId,
          });
          throw error;
        }
      },
      [ensureWebSocketConnected]
    ),

    joinSession: useCallback(
      async (sessionId: SessionId, user: CollaborationUser): Promise<void> => {
        try {
          // Ensure WebSocket is connected before joining session
          await ensureWebSocketConnected();

          await collaborationEngine.joinSession(sessionId, user);

          setState((prev) => ({
            ...prev,
            isConnected: true,
            sessionId,
            currentUser: user,
          }));
        } catch (error) {
          logger.error('Session join failed', {
            error: error instanceof Error ? error.message : String(error),
            sessionId,
          });
          throw error;
        }
      },
      [ensureWebSocketConnected]
    ),

    leaveSession: useCallback(async (): Promise<void> => {
      const sessionId = state.sessionId ? SessionId(state.sessionId as string) : null;
      const currentUser = state.currentUser;

      if (sessionId && currentUser) {
        try {
          await collaborationEngine.leaveSession(sessionId, UserId(currentUser.id as string));

          setState((prev) => ({
            ...prev,
            isConnected: false,
            sessionId: null,
            currentUser: null,
            users: new Map(),
            cursors: new Map(),
            selections: new Map(),
          }));
        } catch (error) {
          logger.error('Session leave failed', {
            error: error instanceof Error ? error.message : String(error),
            sessionId,
          });
          throw error;
        }
      }
    }, [state.sessionId, state.currentUser]),

    updateCursor: useCallback(
      async (cursor: CursorPosition): Promise<void> => {
        const sessionId = state.sessionId ? SessionId(state.sessionId as string) : null;
        const currentUser = state.currentUser;

        if (!sessionId || !currentUser) return;

        // Throttle cursor updates
        if (cursorThrottleRef.current) {
          clearTimeout(cursorThrottleRef.current);
        }

        cursorThrottleRef.current = window.setTimeout(async () => {
          try {
            await collaborationEngine.broadcastCursor(
              sessionId,
              UserId(currentUser.id as string),
              cursor
            );
          } catch (error) {
            logger.error('Cursor broadcast failed', {
              error: error instanceof Error ? error.message : String(error),
              sessionId,
            });
          }
        }, throttleCursor);
      },
      [state.sessionId, state.currentUser, throttleCursor]
    ),

    updateSelection: useCallback(
      async (selectedNodes: string[], selectedEdges: string[]): Promise<void> => {
        const sessionId = state.sessionId ? SessionId(state.sessionId as string) : null;
        const currentUser = state.currentUser;

        if (!sessionId || !currentUser) return;

        const selection: Selection = {
          nodeIds: selectedNodes.map((id) => NodeId(id)),
          edgeIds: selectedEdges,
        };

        // Throttle selection updates
        if (selectionThrottleRef.current) {
          clearTimeout(selectionThrottleRef.current);
        }

        selectionThrottleRef.current = window.setTimeout(async () => {
          try {
            await collaborationEngine.broadcastSelection(
              sessionId,
              UserId(currentUser.id as string),
              selection
            );
          } catch (error) {
            logger.error('Selection broadcast failed', {
              error: error instanceof Error ? error.message : String(error),
              sessionId,
            });
          }
        }, throttleSelection);
      },
      [state.sessionId, state.currentUser, throttleSelection]
    ),

    updateUser: useCallback(
      async (updates: Partial<CollaborationUser>): Promise<void> => {
        const sessionId = state.sessionId ? SessionId(state.sessionId as string) : null;
        const currentUser = state.currentUser;

        if (!sessionId || !currentUser) return;

        try {
          await collaborationEngine.updatePresence(
            sessionId,
            UserId(currentUser.id as string),
            updates
          );

          // Update local state
          setState((prev) => ({
            ...prev,
            currentUser: prev.currentUser ? { ...prev.currentUser, ...updates } : null,
          }));
        } catch (error) {
          logger.error('User update failed', {
            error: error instanceof Error ? error.message : String(error),
            sessionId,
          });
        }
      },
      [state.sessionId, state.currentUser]
    ),

    applyOperation: useCallback(
      async (operation: Operation): Promise<void> => {
        const sessionId = state.sessionId ? SessionId(state.sessionId as string) : null;

        if (!sessionId) return;

        try {
          await collaborationEngine.applyOperation(sessionId, operation);

          setState((prev) => ({
            ...prev,
            operationCount: prev.operationCount + 1,
          }));
        } catch (error) {
          logger.error('Operation apply failed', {
            error: error instanceof Error ? error.message : String(error),
            sessionId,
          });
          throw error;
        }
      },
      [state.sessionId]
    ),
  };

  // Set up event listeners
  useEffect(() => {
    const handleUserJoined = (event: unknown) => {
      if (event.sessionId === state.sessionId && event.userId !== state.currentUser?.id) {
        setState((prev) => {
          const newUsers = new Map(prev.users);
          newUsers.set(event.userId, event.data.user);
          return { ...prev, users: newUsers };
        });
      }
    };

    const handleUserLeft = (event: unknown) => {
      if (event.sessionId === state.sessionId) {
        setState((prev) => {
          const newUsers = new Map(prev.users);
          const newCursors = new Map(prev.cursors);
          const newSelections = new Map(prev.selections);

          newUsers.delete(event.userId);
          newCursors.delete(event.userId);
          newSelections.delete(event.userId);

          return {
            ...prev,
            users: newUsers,
            cursors: newCursors,
            selections: newSelections,
          };
        });
      }
    };

    const handleCursorUpdated = (event: unknown) => {
      if (event.sessionId === state.sessionId && event.userId !== state.currentUser?.id) {
        setState((prev) => {
          const newCursors = new Map(prev.cursors);
          newCursors.set(event.userId, event.data);
          return { ...prev, cursors: newCursors };
        });
      }
    };

    const handleSelectionUpdated = (event: unknown) => {
      if (event.sessionId === state.sessionId && event.userId !== state.currentUser?.id) {
        setState((prev) => {
          const newSelections = new Map(prev.selections);
          newSelections.set(event.userId, event.data);
          return { ...prev, selections: newSelections };
        });
      }
    };

    const handleUserUpdated = (event: unknown) => {
      if (event.sessionId === state.sessionId) {
        setState((prev) => {
          const newUsers = new Map(prev.users);
          if (event.userId === state.currentUser?.id) {
            // Update current user
            return {
              ...prev,
              currentUser: prev.currentUser ? { ...prev.currentUser, ...event.data.user } : null,
            };
          } else {
            // Update other user
            newUsers.set(event.userId, event.data.user);
            return { ...prev, users: newUsers };
          }
        });
      }
    };

    // Add event listeners
    collaborationEngine.on('session-joined', handleUserJoined);
    collaborationEngine.on('session-left', handleUserLeft);
    collaborationEngine.on('presence-updated', handleCursorUpdated);
    collaborationEngine.on('presence-updated', handleSelectionUpdated);
    collaborationEngine.on('presence-updated', handleUserUpdated);

    return () => {
      // Remove event listeners
      collaborationEngine.off('session-joined', handleUserJoined);
      collaborationEngine.off('session-left', handleUserLeft);
      collaborationEngine.off('presence-updated', handleCursorUpdated);
      collaborationEngine.off('presence-updated', handleSelectionUpdated);
      collaborationEngine.off('presence-updated', handleUserUpdated);
    };
  }, [state.sessionId, state.currentUser?.id]);

  // Load initial presence data when session changes
  useEffect(() => {
    const sessionId = state.sessionId ? SessionId(state.sessionId as string) : null;

    if (sessionId) {
      const loadPresence = async () => {
        try {
          const presenceData = await collaborationEngine.getPresenceState(sessionId);

          // Extract users, cursors, and selections from PresenceData map
          const users = new Map();
          const cursors = new Map();
          const selections = new Map();

          for (const [userId, presence] of presenceData) {
            if (presence.cursor) {
              cursors.set(userId, presence.cursor);
            }
            if (presence.selection) {
              selections.set(userId, presence.selection);
            }
          }

          setState((prev) => ({
            ...prev,
            users,
            cursors,
            selections,
          }));
        } catch (error) {
          logger.error('Presence data load failed', {
            error: error instanceof Error ? error.message : String(error),
            sessionId,
          });
        }
      };

      loadPresence();
    }
  }, [state.sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
      if (selectionThrottleRef.current) {
        clearTimeout(selectionThrottleRef.current);
      }
    };
  }, []);

  return [state, actions];
}

export default useCollaboration;
