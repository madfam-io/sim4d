import React from 'react';
import { usePresence } from '../hooks';
import { useCollaboration } from '../collaboration-provider';

export interface CollaborationStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function CollaborationStatus({
  showDetails = true,
  className = '',
}: CollaborationStatusProps) {
  const { userCount, isConnected } = usePresence();
  const { document } = useCollaboration();

  return (
    <div className={`collaboration-status ${className}`}>
      <div className="status-row">
        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {showDetails && isConnected && (
        <>
          <div className="status-row">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" />
            </svg>
            <span className="status-text">
              {userCount} {userCount === 1 ? 'user' : 'users'} online
            </span>
          </div>

          {document && (
            <div className="status-row">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
              </svg>
              <span className="status-text">Version {document.version}</span>
            </div>
          )}
        </>
      )}

      <style>{`
        .collaboration-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          background-color: #f9fafb;
          border-radius: 6px;
          font-size: 14px;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .status-dot.connected {
          background-color: #10b981;
        }

        .status-dot.disconnected {
          background-color: #ef4444;
          animation: none;
        }

        .status-text {
          color: #6b7280;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
