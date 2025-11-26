import React, { useRef, useState, useCallback } from 'react';
import { Panel } from '../types';
import './TabletLayout.css';

interface TabletLayoutProps {
  panels: Record<string, Panel>;
  activePanel: string;
  onPanelChange: (panelId: string) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  dimensions: { width: number; height: number };
  capabilities: any;
  splitRatio: number;
  onSplitRatioChange: (ratio: number) => void;
}

export const TabletLayout: React.FC<TabletLayoutProps> = ({
  panels,
  activePanel,
  onPanelChange,
  isFullscreen,
  onFullscreenToggle,
  dimensions,
  capabilities,
  splitRatio,
  onSplitRatioChange,
}) => {
  const [primaryPanel, setPrimaryPanel] = useState('nodeEditor');
  const [secondaryPanel, setSecondaryPanel] = useState('viewport');
  const splitRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle split resize
  const handleSplitDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleSplitDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !splitRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = splitRef.current.getBoundingClientRect();
      const newRatio = (clientX - rect.left) / rect.width;

      onSplitRatioChange(Math.max(0.2, Math.min(0.8, newRatio)));
    },
    [isDragging, onSplitRatioChange]
  );

  const handleSplitDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleSplitDrag);
      window.addEventListener('mouseup', handleSplitDragEnd);
      window.addEventListener('touchmove', handleSplitDrag);
      window.addEventListener('touchend', handleSplitDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleSplitDrag);
        window.removeEventListener('mouseup', handleSplitDragEnd);
        window.removeEventListener('touchmove', handleSplitDrag);
        window.removeEventListener('touchend', handleSplitDragEnd);
      };
    }
  }, [isDragging, handleSplitDrag, handleSplitDragEnd]);

  const primaryPanelContent = panels[primaryPanel];
  const secondaryPanelContent = panels[secondaryPanel];

  return (
    <div className="tablet-layout" data-orientation={capabilities.orientation}>
      {/* Header Bar */}
      <div className="tablet-header">
        <div className="header-section">
          <span className="app-title">Sim4D Studio</span>
        </div>
        <div className="header-tabs">
          {Object.entries(panels).map(([id, panel]) => (
            <button
              key={id}
              className={`header-tab ${id === primaryPanel || id === secondaryPanel ? 'active' : ''}`}
              onClick={() => {
                if (id !== primaryPanel && id !== secondaryPanel) {
                  setSecondaryPanel(id);
                }
              }}
            >
              {panel.icon || '📄'} {panel.title}
            </button>
          ))}
        </div>
        <div className="header-actions">
          <button onClick={onFullscreenToggle} className="icon-button">
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      {/* Split View Content */}
      <div
        ref={splitRef}
        className="tablet-split-view"
        style={{
          gridTemplateColumns: `${splitRatio * 100}% ${(1 - splitRatio) * 100}%`,
        }}
      >
        <div className="split-panel primary">
          {primaryPanelContent && (
            <div className="panel-content">
              <div className="panel-header">
                <h3>{primaryPanelContent.title}</h3>
              </div>
              {primaryPanelContent.content}
            </div>
          )}
        </div>

        {/* Split Handle */}
        <div
          className={`split-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleSplitDragStart}
          onTouchStart={handleSplitDragStart}
        >
          <div className="handle-grip" />
        </div>

        <div className="split-panel secondary">
          {secondaryPanelContent && (
            <div className="panel-content">
              <div className="panel-header">
                <h3>{secondaryPanelContent.title}</h3>
              </div>
              {secondaryPanelContent.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
