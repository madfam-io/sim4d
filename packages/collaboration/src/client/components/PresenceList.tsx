import React from 'react';
import { usePresence } from '../hooks';

export interface PresenceListProps {
  maxVisible?: number;
  className?: string;
}

export function PresenceList({ maxVisible = 5, className = '' }: PresenceListProps) {
  const { activeUsers, userCount, isConnected } = usePresence();

  if (!isConnected) {
    return (
      <div className={`presence-list offline ${className}`}>
        <span className="status-indicator offline" />
        <span>Offline</span>
      </div>
    );
  }

  const visibleUsers = activeUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, userCount - maxVisible);

  return (
    <div className={`presence-list ${className}`}>
      <div className="presence-avatars">
        {visibleUsers.map((user) => (
          <div
            key={user.id}
            className={`presence-avatar ${user.isCurrentUser ? 'current-user' : ''}`}
            style={{
              backgroundColor: user.color,
              backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
            }}
            title={user.name}
          >
            {!user.avatar && user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {hiddenCount > 0 && (
          <div className="presence-avatar more" title={`+${hiddenCount} more`}>
            +{hiddenCount}
          </div>
        )}
      </div>
      <style>{`
        .presence-list {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .presence-list.offline {
          opacity: 0.6;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
        }

        .status-indicator.offline {
          background-color: #6b7280;
        }

        .presence-avatars {
          display: flex;
          flex-direction: row-reverse;
        }

        .presence-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 500;
          margin-left: -8px;
          background-size: cover;
          background-position: center;
        }

        .presence-avatar:last-child {
          margin-left: 0;
        }

        .presence-avatar.current-user {
          border-color: #3b82f6;
        }

        .presence-avatar.more {
          background-color: #6b7280;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
