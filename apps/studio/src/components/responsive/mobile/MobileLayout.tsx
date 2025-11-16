import React, { useState, useRef, useEffect } from 'react';
import { Panel } from '../types';
import { BottomSheet } from './BottomSheet';
import { MobileTabBar } from './MobileTabBar';
import { FloatingActionButton } from './FloatingActionButton';
import { MobileSplitView } from './MobileSplitView';
import { PersistentToolbar } from './PersistentToolbar';
import './MobileLayout.css';

interface MobileLayoutProps {
  panels: Record<string, Panel>;
  activePanel: string;
  onPanelChange: (panelId: string) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  dimensions: { width: number; height: number };
  capabilities: any;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  panels,
  activePanel,
  onPanelChange,
  isFullscreen,
  onFullscreenToggle,
  dimensions,
  capabilities,
}) => {
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [splitMode, setSplitMode] = useState<
    'single' | 'split-horizontal' | 'split-vertical' | 'overlay'
  >('single');
  const [primaryPanel, setPrimaryPanel] = useState('nodeEditor');
  const [secondaryPanel, setSecondaryPanel] = useState('viewport');
  const panelContentRef = useRef<HTMLDivElement>(null);

  // Handle pull-to-refresh gesture
  useEffect(() => {
    if (!capabilities.touch) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (panelContentRef.current?.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0 && deltaY < 100) {
        panelContentRef.current!.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;

      const deltaY = currentY - startY;
      if (deltaY > 50) {
        // Trigger refresh
        window.location.reload();
      }

      panelContentRef.current!.style.transform = '';
      isPulling = false;
    };

    const panel = panelContentRef.current;
    if (panel) {
      panel.addEventListener('touchstart', handleTouchStart, { passive: false });
      panel.addEventListener('touchmove', handleTouchMove, { passive: false });
      panel.addEventListener('touchend', handleTouchEnd);

      return () => {
        panel.removeEventListener('touchstart', handleTouchStart);
        panel.removeEventListener('touchmove', handleTouchMove);
        panel.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [capabilities.touch]);

  const currentPanel = panels[activePanel];

  // Quick action items for FAB
  const quickActions = [
    { id: 'add-node', icon: '➕', label: 'Add Node', action: () => setBottomSheetOpen(true) },
    { id: 'connect', icon: '🔗', label: 'Connect', action: () => {} },
    { id: 'save', icon: '💾', label: 'Save', action: () => {} },
    { id: 'evaluate', icon: '▶️', label: 'Run', action: () => {} },
  ];

  // Determine optimal split mode based on orientation and screen size
  useEffect(() => {
    if (capabilities.orientation === 'landscape' && dimensions.width > 600) {
      setSplitMode('split-horizontal');
    } else if (dimensions.height > 700) {
      setSplitMode('split-vertical');
    } else {
      setSplitMode('single');
    }
  }, [capabilities.orientation, dimensions]);

  return (
    <div className="mobile-layout" data-orientation={capabilities.orientation}>
      {/* Status Bar */}
      <div className="mobile-status-bar">
        <span className="app-title">BrepFlow</span>
        <div className="status-actions">
          <button onClick={onFullscreenToggle} className="icon-button">
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>

      {/* Main Content Area with Split View */}
      <div className="mobile-content" ref={panelContentRef}>
        {panels[primaryPanel] && panels[secondaryPanel] ? (
          <MobileSplitView
            mode={splitMode}
            onModeChange={setSplitMode}
            primaryContent={panels[primaryPanel].content}
            secondaryContent={panels[secondaryPanel].content}
            primaryLabel={panels[primaryPanel].title || panels[primaryPanel].label}
            secondaryLabel={panels[secondaryPanel].title || panels[secondaryPanel].label}
          />
        ) : (
          // Fallback to single panel if split view can't work
          currentPanel && <div className="panel-container">{currentPanel.content}</div>
        )}
      </div>

      {/* Bottom Sheet for Node Palette */}
      {activePanel === 'palette' && (
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          height={dimensions.height * 0.7}
          snapPoints={[80, dimensions.height * 0.5, dimensions.height * 0.9]}
        >
          {panels.palette.content}
        </BottomSheet>
      )}

      {/* Persistent Toolbar with Split Controls */}
      <PersistentToolbar
        primaryActions={[
          {
            id: 'split-mode',
            icon: splitMode === 'single' ? '⊞' : '⊡',
            label: 'Split View',
            onClick: () => {
              const modes: Array<'single' | 'split-horizontal' | 'split-vertical' | 'overlay'> = [
                'single',
                'split-horizontal',
                'split-vertical',
                'overlay',
              ];
              const currentIndex = modes.indexOf(splitMode);
              setSplitMode(modes[(currentIndex + 1) % modes.length]);
            },
          },
          {
            id: 'nodeEditor',
            icon: '📝',
            label: 'Editor',
            active: primaryPanel === 'nodeEditor',
            onClick: () => setPrimaryPanel('nodeEditor'),
          },
          {
            id: 'viewport',
            icon: '🎨',
            label: 'Viewport',
            active: primaryPanel === 'viewport',
            onClick: () => setPrimaryPanel('viewport'),
          },
          {
            id: 'inspector',
            icon: '🔍',
            label: 'Inspector',
            active: secondaryPanel === 'inspector',
            onClick: () => setSecondaryPanel('inspector'),
          },
        ]}
        secondaryActions={[
          { id: 'undo', icon: '↶', label: 'Undo', onClick: () => {} },
          { id: 'redo', icon: '↷', label: 'Redo', onClick: () => {} },
          { id: 'settings', icon: '⚙️', label: 'Settings', onClick: () => {} },
          { id: 'help', icon: '❓', label: 'Help', onClick: () => {} },
        ]}
        compact={dimensions.width < 360}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={quickActions}
        expanded={fabExpanded}
        onToggle={() => setFabExpanded(!fabExpanded)}
        hidden={isFullscreen}
      />
    </div>
  );
};
