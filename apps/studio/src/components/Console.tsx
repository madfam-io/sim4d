import React, { useState, useEffect, useRef } from 'react';
import { useGraphStore } from '../store/graph-store';

interface ConsoleMessage {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source?: string;
}

export const Console: React.FC = () => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { graph } = useGraphStore();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add system messages based on graph state
  useEffect(() => {
    const dirtyNodes = graph.nodes.filter((n) => n.dirty);
    if (dirtyNodes.length > 0) {
      const newMessage: ConsoleMessage = {
        id: `eval-${Date.now()}`,
        timestamp: new Date(),
        level: 'info',
        message: `Evaluating ${dirtyNodes.length} node${dirtyNodes.length !== 1 ? 's' : ''}...`,
        source: 'graph' as string,
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  }, [graph]);

  const addMessage = (level: ConsoleMessage['level'], message: string, source?: string) => {
    const newMessage: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      ...(source !== undefined && { source }),
    };
    setMessages((prev) => [...prev.slice(-99), newMessage]); // Keep last 100 messages
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getMessageIcon = (level: ConsoleMessage['level']) => {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
    }
  };

  const getMessageClass = (level: ConsoleMessage['level']) => {
    return `console-message console-message--${level}`;
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ConsoleMessage = {
      id: 'welcome',
      timestamp: new Date(),
      level: 'info',
      message: 'Sim4D Studio Console Ready',
      source: 'system',
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <div className="console-container">
      <div className="console-header">
        <div className="console-title">
          <span className="console-icon">💻</span>
          Console
          {messages.length > 1 && <span className="console-count">({messages.length - 1})</span>}
        </div>
        <div className="console-actions">
          <button
            className="console-action-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
          <button className="console-action-btn" onClick={clearMessages} title="Clear console">
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="console-content">
          <div className="console-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={getMessageClass(msg.level)}>
                <span className="console-time">[{formatTime(msg.timestamp)}]</span>
                <span className="console-icon">{getMessageIcon(msg.level)}</span>
                <span className="console-text">{msg.message}</span>
                {msg.source && <span className="console-source">({msg.source})</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <style>{`
        .console-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
        }

        .console-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          min-height: 36px;
        }

        .console-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .console-count {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .console-actions {
          display: flex;
          gap: 4px;
        }

        .console-action-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          border-radius: 3px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .console-action-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .console-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .console-messages {
          flex: 1;
          padding: 8px;
          overflow-y: auto;
          font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
          font-size: 13px;
          line-height: 1.4;
          background: var(--bg-primary);
        }

        .console-message {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          padding: 2px 0;
          color: var(--text-primary);
        }

        .console-message--info { color: #3b82f6; }
        .console-message--warn { color: #f59e0b; }
        .console-message--error { color: #ef4444; }
        .console-message--success { color: #10b981; }

        .console-time {
          color: var(--text-secondary);
          font-size: 11px;
          min-width: 70px;
        }

        .console-icon {
          font-size: 12px;
          min-width: 16px;
        }

        .console-text {
          flex: 1;
        }

        .console-source {
          color: var(--text-secondary);
          font-size: 11px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default Console;
