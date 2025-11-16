/**
 * User Presence Overlay Component
 * Shows real-time cursors, selections, and user awareness
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { CollaborationUser, CursorPosition, SelectionState } from '@brepflow/engine-core';
import { SessionId, UserId, NodeId } from '@brepflow/types';

// Selection type from collaboration engine
type Selection = {
  nodeIds: NodeId[];
  edgeIds: string[];
};
import './UserPresenceOverlay.css';

// Import the actual collaboration engine
import { BrepFlowCollaborationEngine } from '@brepflow/engine-core';

const collaborationEngine = new BrepFlowCollaborationEngine({} as any);

interface UserPresenceOverlayProps {
  sessionId: SessionId;
  currentUserId: UserId;
  containerRef: React.RefObject<HTMLElement>;
  children?: React.ReactNode;
}

interface UserCursor {
  userId: UserId;
  user: CollaborationUser;
  position: CursorPosition;
  visible: boolean;
}

interface UserSelection {
  userId: UserId;
  user: CollaborationUser;
  selection: SelectionState;
  visible: boolean;
}

export const UserPresenceOverlay: React.FC<UserPresenceOverlayProps> = ({
  sessionId: sessionIdProp,
  currentUserId: currentUserIdProp,
  containerRef,
  children,
}) => {
  // Ensure branded types are preserved using helper functions
  const sessionId = SessionId(sessionIdProp as string);
  const currentUserId = UserId(currentUserIdProp as string);
  const [users, setUsers] = useState<Map<UserId, CollaborationUser>>(new Map());
  const [cursors, setCursors] = useState<Map<UserId, UserCursor>>(new Map());
  const [selections, setSelections] = useState<Map<UserId, UserSelection>>(new Map());
  const [isTrackingCursor, setIsTrackingCursor] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cursorUpdateTimeoutRef = useRef<number>();
  const selectionUpdateTimeoutRef = useRef<number>();

  // Get current user's cursor position
  const updateCursorPosition = useCallback(
    (event: MouseEvent) => {
      if (!containerRef.current || !isTrackingCursor) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const cursor: CursorPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        userId: currentUserId,
        timestamp: Date.now(),
      };

      // Throttle cursor updates
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }

      cursorUpdateTimeoutRef.current = window.setTimeout(() => {
        collaborationEngine.broadcastCursor(sessionId, currentUserId, cursor);
      }, 50); // 50ms throttle
    },
    [sessionId, currentUserId, containerRef, isTrackingCursor]
  );

  // Update selection when user selects nodes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateSelection = useCallback(
    (selectedNodes: string[], selectedEdges: string[]) => {
      if (!isTrackingCursor) return;

      const selection: Selection = {
        nodeIds: selectedNodes.map((id) => NodeId(id)),
        edgeIds: selectedEdges,
      };

      // Throttle selection updates
      if (selectionUpdateTimeoutRef.current) {
        clearTimeout(selectionUpdateTimeoutRef.current);
      }

      selectionUpdateTimeoutRef.current = window.setTimeout(() => {
        collaborationEngine.broadcastSelection(sessionId, currentUserId, selection);
      }, 200); // 200ms throttle
    },
    [sessionId, currentUserId, isTrackingCursor]
  );

  // Setup collaboration event listeners
  useEffect(() => {
    const handleUserJoined = (event: any) => {
      if (event.sessionId === sessionId && event.userId !== currentUserId) {
        setUsers((prev) => new Map(prev.set(event.userId, event.data.user)));
      }
    };

    const handleUserLeft = (event: any) => {
      if (event.sessionId === sessionId) {
        setUsers((prev) => {
          const newUsers = new Map(prev);
          newUsers.delete(event.userId);
          return newUsers;
        });
        setCursors((prev) => {
          const newCursors = new Map(prev);
          newCursors.delete(event.userId);
          return newCursors;
        });
        setSelections((prev) => {
          const newSelections = new Map(prev);
          newSelections.delete(event.userId);
          return newSelections;
        });
      }
    };

    const handleCursorUpdated = (event: any) => {
      if (event.sessionId === sessionId && event.userId !== currentUserId) {
        const user = users.get(event.userId);
        if (user) {
          setCursors(
            (prev) =>
              new Map(
                prev.set(event.userId, {
                  userId: event.userId,
                  user,
                  position: event.data,
                  visible: true,
                })
              )
          );

          // Auto-hide cursor after inactivity
          setTimeout(() => {
            setCursors((prev) => {
              const cursor = prev.get(event.userId);
              if (cursor && cursor.position.timestamp === event.data.timestamp) {
                return new Map(prev.set(event.userId, { ...cursor, visible: false }));
              }
              return prev;
            });
          }, 5000);
        }
      }
    };

    const handleSelectionUpdated = (event: any) => {
      if (event.sessionId === sessionId && event.userId !== currentUserId) {
        const user = users.get(event.userId);
        if (user) {
          setSelections(
            (prev) =>
              new Map(
                prev.set(event.userId, {
                  userId: event.userId,
                  user,
                  selection: event.data,
                  visible: true,
                })
              )
          );
        }
      }
    };

    const handleUserUpdated = (event: any) => {
      if (event.sessionId === sessionId) {
        setUsers((prev) => new Map(prev.set(event.userId, event.data.user)));
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
  }, [sessionId, currentUserId, users]);

  // Setup mouse tracking
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleMouseEnter = () => setIsTrackingCursor(true);
    const handleMouseLeave = () => setIsTrackingCursor(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', updateCursorPosition);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', updateCursorPosition);
    };
  }, [containerRef, updateCursorPosition]);

  // Load initial presence state
  useEffect(() => {
    const loadPresence = async () => {
      try {
        const presenceData = await collaborationEngine.getPresenceState(sessionId);

        // Convert cursor and selection data from PresenceData map
        const userCursors = new Map<UserId, UserCursor>();
        const userSelections = new Map<UserId, UserSelection>();

        for (const [userId, presence] of presenceData) {
          if (userId !== currentUserId) {
            const user = users.get(userId);
            if (user && presence.cursor) {
              userCursors.set(userId, {
                userId,
                user,
                position: presence.cursor,
                visible: true,
              });
            }
            if (user && presence.selection) {
              userSelections.set(userId, {
                userId,
                user,
                selection: presence.selection,
                visible: true,
              });
            }
          }
        }

        setCursors(userCursors);
        setSelections(userSelections);
      } catch (error) {
        console.error('Failed to load presence state:', error);
      }
    };

    loadPresence();
  }, [sessionId, currentUserId]);

  // Render user cursors
  const renderCursors = useMemo(() => {
    return Array.from(cursors.values())
      .filter((cursor) => cursor.visible && cursor.userId !== currentUserId)
      .map((cursor) => <UserCursorComponent key={cursor.userId} cursor={cursor} />);
  }, [cursors, currentUserId]);

  // Render user selections
  const renderSelections = useMemo(() => {
    return Array.from(selections.values())
      .filter((selection) => selection.visible && selection.userId !== currentUserId)
      .map((selection) => <UserSelectionComponent key={selection.userId} selection={selection} />);
  }, [selections, currentUserId]);

  return (
    <div ref={overlayRef} className="user-presence-overlay">
      {children}

      {/* User cursors */}
      <div className="presence-cursors">{renderCursors}</div>

      {/* User selections */}
      <div className="presence-selections">{renderSelections}</div>

      {/* User list panel */}
      <UserListPanel
        users={Array.from(users.values()).filter((user) => user.id !== currentUserId)}
        onUserClick={(userId) => {
          // Focus on user's cursor
          const cursor = cursors.get(userId);
          if (cursor && cursor.visible) {
            // Scroll to user's cursor position
            console.log(`Focus on user ${userId} at position`, cursor.position);
          }
        }}
      />
    </div>
  );
};

// User Cursor Component
interface UserCursorComponentProps {
  cursor: UserCursor;
}

const UserCursorComponent: React.FC<UserCursorComponentProps> = ({ cursor }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade out cursor after inactivity
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [cursor.position.timestamp]);

  if (!isVisible || !cursor.visible) {
    return null;
  }

  return (
    <div
      className="user-cursor"
      style={
        {
          left: cursor.position.x,
          top: cursor.position.y,
          transform: 'translate(-2px, -2px)',
          '--user-color': cursor.user.color,
        } as React.CSSProperties
      }
    >
      <div className="cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M0 0L0 10L3 7L5 11L7 10L5 6L8 6L0 0Z" fill="currentColor" />
          <path
            d="M0 0L0 10L3 7L5 11L7 10L5 6L8 6L0 0Z"
            fill="white"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>
      <div className="cursor-label">
        <span className="cursor-username">{cursor.user.name}</span>
      </div>
    </div>
  );
};

// User Selection Component
interface UserSelectionComponentProps {
  selection: UserSelection;
}

const UserSelectionComponent: React.FC<UserSelectionComponentProps> = ({ selection }) => {
  if (!selection.visible || selection.selection.selectedNodes.length === 0) {
    return null;
  }

  return (
    <div className="user-selection">
      {selection.selection.selectedNodes.map((nodeId: string) => (
        <NodeSelectionHighlight key={nodeId} nodeId={nodeId} user={selection.user} />
      ))}
    </div>
  );
};

// Node Selection Highlight Component
interface NodeSelectionHighlightProps {
  nodeId: string;
  user: CollaborationUser;
}

const NodeSelectionHighlight: React.FC<NodeSelectionHighlightProps> = ({ nodeId, user }) => {
  const [nodeElement, setNodeElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find the node element in the DOM
    const element = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
    setNodeElement(element);
  }, [nodeId]);

  if (!nodeElement) {
    return null;
  }

  const rect = nodeElement.getBoundingClientRect();

  return (
    <div
      className="node-selection-highlight"
      style={
        {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          '--user-color': user.color,
        } as React.CSSProperties
      }
    >
      <div className="selection-border" />
      <div className="selection-label">
        <span>{user.name}</span>
      </div>
    </div>
  );
};

// User List Panel Component
interface UserListPanelProps {
  users: CollaborationUser[];
  onUserClick: (userId: UserId) => void;
}

const UserListPanel: React.FC<UserListPanelProps> = ({ users, onUserClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={`user-list-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="panel-title">
          <span className="user-count">{users.length}</span>
          <span>user{users.length !== 1 ? 's' : ''} online</span>
        </div>
        <div className="panel-toggle">{isExpanded ? '▼' : '▲'}</div>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {users.map((user) => (
            <div
              key={user.id}
              className={`user-item ${user.isOnline ? 'online' : 'offline'}`}
              onClick={() => onUserClick(UserId(user.id as string))}
            >
              <div className="user-avatar" style={{ backgroundColor: user.color }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-status">
                  {user.isOnline ? (
                    <span className="status-online">Online</span>
                  ) : (
                    <span className="status-offline">
                      Last seen {formatLastSeen(user.lastSeen)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Utility function to format last seen time
function formatLastSeen(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    // Less than 1 minute
    return 'just now';
  } else if (diff < 3600000) {
    // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  } else if (diff < 86400000) {
    // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
}

export default UserPresenceOverlay;
