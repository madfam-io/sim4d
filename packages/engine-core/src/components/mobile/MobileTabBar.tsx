import React from 'react';
import { Panel } from '../ResponsiveLayoutManager';
import './MobileTabBar.css';

interface MobileTabBarProps {
  panels: Record<string, Panel>;
  activePanel: string;
  onPanelChange: (panelId: string) => void;
  hidden?: boolean;
}

const defaultIcons: Record<string, string> = {
  nodeEditor: '📊',
  viewport: '🎲',
  palette: '🎨',
  inspector: '⚙️',
  console: '💬',
};

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  panels,
  activePanel,
  onPanelChange,
  hidden = false,
}) => {
  const tabItems = Object.entries(panels).slice(0, 5); // Max 5 tabs

  if (hidden) return null;

  return (
    <div className="mobile-tab-bar">
      {tabItems.map(([id, panel]) => (
        <button
          key={id}
          className={`tab-item ${activePanel === id ? 'active' : ''}`}
          onClick={() => onPanelChange(id)}
          aria-label={panel.title}
        >
          <span className="tab-icon">{panel.icon || defaultIcons[id] || '📄'}</span>
          <span className="tab-label">{panel.title}</span>
          {panel.badge && panel.badge > 0 && (
            <span className="tab-badge">{panel.badge > 99 ? '99+' : panel.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
};
