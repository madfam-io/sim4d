import React, { useState } from 'react';
import './PersistentToolbar.css';

interface ToolbarAction {
  id: string;
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  onClick?: () => void; // Changed from 'action' to 'onClick'
}

interface PersistentToolbarProps {
  primaryActions: ToolbarAction[];
  secondaryActions?: ToolbarAction[];
  onModeChange?: (mode: string) => void;
  className?: string;
  compact?: boolean;
}

export const PersistentToolbar: React.FC<PersistentToolbarProps> = ({
  primaryActions,
  secondaryActions = [],
  onModeChange,
  className = '',
}) => {
  const [expandedMenu, setExpandedMenu] = useState(false);
  const [activeMode, setActiveMode] = useState('select');

  const handleActionClick = (action: ToolbarAction) => {
    action.onClick?.();
    if (action.id.includes('mode')) {
      setActiveMode(action.id);
      onModeChange?.(action.id);
    }
  };

  return (
    <div className={`persistent-toolbar ${className}`}>
      {/* Primary Actions - Always Visible */}
      <div className="toolbar-primary">
        {primaryActions.map((action) => (
          <button
            key={action.id}
            className={`toolbar-button ${action.id === activeMode ? 'active' : ''}`}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            aria-label={action.label}
          >
            <span className="toolbar-icon">{action.icon}</span>
            {action.badge && action.badge > 0 && (
              <span className="toolbar-badge">{action.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Secondary Actions - Expandable Menu */}
      {secondaryActions.length > 0 && (
        <div className="toolbar-secondary">
          <button
            className={`toolbar-menu-button ${expandedMenu ? 'expanded' : ''}`}
            onClick={() => setExpandedMenu(!expandedMenu)}
            aria-label="More actions"
          >
            <span className="toolbar-icon">{expandedMenu ? '✕' : '⋯'}</span>
          </button>

          {expandedMenu && (
            <div className="toolbar-dropdown">
              {secondaryActions.map((action) => (
                <button
                  key={action.id}
                  className="toolbar-dropdown-item"
                  onClick={() => {
                    handleActionClick(action);
                    setExpandedMenu(false);
                  }}
                  disabled={action.disabled}
                >
                  <span className="toolbar-icon">{action.icon}</span>
                  <span className="toolbar-label">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
