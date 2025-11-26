import React, { useState } from 'react';
import { Panel } from '../types';
import './DesktopLayout.css';

interface DesktopLayoutProps {
  panels: Record<string, Panel>;
  activePanel: string;
  onPanelChange: (panelId: string) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  dimensions: { width: number; height: number };
  capabilities: any;
}

type LayoutMode = 'quad' | 'triple' | 'dual' | 'single';

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  panels,
  activePanel,
  onPanelChange,
  isFullscreen,
  onFullscreenToggle,
  dimensions,
  capabilities,
}) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('quad');
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set());

  const togglePanelCollapse = (panelId: string) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }
      return next;
    });
  };

  const renderPanel = (panelId: string, className: string = '') => {
    const panel = panels[panelId];
    if (!panel) return null;

    const isCollapsed = collapsedPanels.has(panelId);

    return (
      <div
        className={`desktop-panel ${className} ${isCollapsed ? 'collapsed' : ''} ${
          panelId === activePanel ? 'active' : ''
        }`}
      >
        <div className="panel-header">
          <h3 className="panel-title">
            <span className="panel-icon">{panel.icon || '📄'}</span>
            {panel.title}
          </h3>
          <div className="panel-controls">
            <button
              className="panel-control"
              onClick={() => togglePanelCollapse(panelId)}
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
            {panel.badge && panel.badge > 0 && <span className="panel-badge">{panel.badge}</span>}
          </div>
        </div>
        {!isCollapsed && (
          <div className="panel-body" onClick={() => onPanelChange(panelId)}>
            {panel.content}
          </div>
        )}
      </div>
    );
  };

  const getLayoutClass = () => {
    switch (layoutMode) {
      case 'quad':
        return 'layout-quad';
      case 'triple':
        return 'layout-triple';
      case 'dual':
        return 'layout-dual';
      case 'single':
        return 'layout-single';
      default:
        return 'layout-quad';
    }
  };

  return (
    <div className={`desktop-layout ${getLayoutClass()}`} data-fullscreen={isFullscreen}>
      {/* Top Menu Bar */}
      <div className="desktop-menubar">
        <div className="menubar-section">
          <span className="app-logo">Sim4D Studio</span>
        </div>
        <div className="menubar-section">
          <select
            value={layoutMode}
            onChange={(e) => setLayoutMode(e.target.value as LayoutMode)}
            className="layout-selector"
          >
            <option value="single">Single Panel</option>
            <option value="dual">Dual Panel</option>
            <option value="triple">Triple Panel</option>
            <option value="quad">Quad Panel</option>
          </select>
        </div>
        <div className="menubar-section">
          <button onClick={onFullscreenToggle} className="menubar-button">
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="desktop-content">
        {layoutMode === 'single' && <>{renderPanel('nodeEditor', 'panel-full')}</>}

        {layoutMode === 'dual' && (
          <>
            {renderPanel('nodeEditor', 'panel-left')}
            {renderPanel('viewport', 'panel-right')}
          </>
        )}

        {layoutMode === 'triple' && (
          <>
            {renderPanel('palette', 'panel-sidebar')}
            {renderPanel('nodeEditor', 'panel-main')}
            {renderPanel('inspector', 'panel-aside')}
          </>
        )}

        {layoutMode === 'quad' && (
          <>
            {renderPanel('palette', 'panel-top-left')}
            {renderPanel('nodeEditor', 'panel-top-right')}
            {renderPanel('viewport', 'panel-bottom-left')}
            {renderPanel('inspector', 'panel-bottom-right')}
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="desktop-statusbar">
        <div className="statusbar-section">
          <span className="status-item">
            {dimensions.width} × {dimensions.height}
          </span>
          <span className="status-item">{capabilities.touch ? 'Touch' : 'Mouse'}</span>
        </div>
        <div className="statusbar-section">
          <span className="status-item">Ready</span>
        </div>
      </div>
    </div>
  );
};
