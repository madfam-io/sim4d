import React, { useEffect, useMemo } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { LayoutControls } from './LayoutControls';
import { useLayoutStore } from '../../store/layout-store';
import type { PanelId } from '../../types/layout';
import './layout.css';

interface WorkbenchLayoutManagerProps {
  children: {
    nodePanel?: React.ReactNode;
    nodeEditor?: React.ReactNode;
    viewport3d?: React.ReactNode;
    inspector?: React.ReactNode;
    console?: React.ReactNode;
    toolbar?: React.ReactNode;
  };
  controlsPosition?: 'top' | 'bottom' | 'floating';
}

interface PanelComponentProps {
  panelId: PanelId;
  children?: React.ReactNode;
}

const PanelComponent: React.FC<PanelComponentProps> = ({ panelId, children }) => (
  <div className={`panel-content-wrapper panel-${panelId}`}>{children}</div>
);

export const WorkbenchLayoutManager: React.FC<WorkbenchLayoutManagerProps> = ({
  children,
  controlsPosition = 'floating',
}) => {
  const { currentLayout, focusMode, updateScreenSize, getScreenSize, isInitialized } =
    useLayoutStore();

  // Auto-recovery for collapsed panels - immediate and aggressive
  useEffect(() => {
    const fixPanels = () => {
      const leftSidebar = document.getElementById('left-sidebar');
      const rightSidebar = document.getElementById('right-sidebar');

      if (leftSidebar) {
        const width = parseFloat(window.getComputedStyle(leftSidebar).width);
        if (width < 50) {
          leftSidebar.style.cssText =
            'width: 20% !important; flex: 0 0 20% !important; min-width: 240px !important;';
        }
      }

      if (rightSidebar) {
        const width = parseFloat(window.getComputedStyle(rightSidebar).width);
        if (width < 50) {
          rightSidebar.style.cssText =
            'width: 25% !important; flex: 0 0 25% !important; min-width: 320px !important;';
        }
      }
    };

    // Fix immediately and repeatedly
    fixPanels();
    const timer1 = setTimeout(fixPanels, 0);
    const timer2 = setTimeout(fixPanels, 50);
    const timer3 = setTimeout(fixPanels, 100);
    const timer4 = setTimeout(fixPanels, 200);
    const timer5 = setTimeout(fixPanels, 500);

    // Keep checking for a bit
    const interval = setInterval(fixPanels, 250);
    const stopTimer = setTimeout(() => clearInterval(interval), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(stopTimer);
      clearInterval(interval);
    };
  }, []);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const newScreenSize = getScreenSize();
      updateScreenSize(newScreenSize);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getScreenSize, updateScreenSize]);

  // Get visible panels in order (including minimized ones)
  const visiblePanels = useMemo(() => {
    const panels = Object.entries(currentLayout.panels)
      .filter(([_, panel]) => panel.visible)
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([id]) => id as PanelId);

    return panels;
  }, [currentLayout.panels, currentLayout.name]);

  // If focus mode is active, render focused panel only
  if (focusMode.focusedPanel) {
    const focusedPanelContent = children[focusMode.focusedPanel];
    return (
      <div className="workbench-layout focus-mode">
        <LayoutControls position={controlsPosition} />
        <PanelComponent panelId={focusMode.focusedPanel}>{focusedPanelContent}</PanelComponent>
      </div>
    );
  }

  // Render normal layout if not initialized yet
  if (!isInitialized) {
    return (
      <div className="workbench-layout">
        <div className="loading-layout">Loading workspace...</div>
      </div>
    );
  }

  // Calculate panel sizes and structure
  const leftPanels = visiblePanels.filter((id) => currentLayout.panels[id].position === 'left');
  const rightPanels = visiblePanels.filter((id) => currentLayout.panels[id].position === 'right');
  const centerPanels = visiblePanels.filter((id) => currentLayout.panels[id].position === 'center');
  const bottomPanels = visiblePanels.filter((id) => currentLayout.panels[id].position === 'bottom');
  const topPanels = visiblePanels.filter((id) => currentLayout.panels[id].position === 'top');

  return (
    <div className="workbench-layout">
      <LayoutControls position={controlsPosition} />

      <PanelGroup direction="vertical" className="main-layout-container">
        {/* Top panels (toolbar) */}
        {topPanels.length > 0 && (
          <>
            <Panel id="top-area" defaultSize={5} minSize={3} maxSize={10}>
              <div className="top-panels-container">
                {topPanels.map((panelId) => (
                  <PanelComponent key={panelId} panelId={panelId}>
                    {children[panelId]}
                  </PanelComponent>
                ))}
              </div>
            </Panel>
            <PanelResizeHandle className="panel-resize-handle horizontal" />
          </>
        )}

        {/* Main content area */}
        <Panel id="main-area" minSize={40}>
          <PanelGroup direction="horizontal" className="main-panel-group">
            {/* Left sidebar */}
            {leftPanels.length > 0 && (
              <>
                <Panel
                  id="left-sidebar"
                  defaultSize={20}
                  minSize={15}
                  maxSize={35}
                  collapsible={false}
                  style={{ minWidth: '240px' }}
                >
                  <div className="left-panels-container">
                    {leftPanels.map((panelId) => (
                      <PanelComponent key={panelId} panelId={panelId}>
                        {children[panelId]}
                      </PanelComponent>
                    ))}
                  </div>
                </Panel>
                <PanelResizeHandle className="panel-resize-handle" />
              </>
            )}

            {/* Center content area */}
            {centerPanels.length > 0 && (
              <Panel id="center-area" minSize={30}>
                <PanelGroup direction="vertical" className="center-content-group">
                  {centerPanels.map((panelId, index) => (
                    <React.Fragment key={panelId}>
                      <Panel
                        id={`center-${panelId}`}
                        defaultSize={
                          typeof currentLayout.panels[panelId].size.height === 'string'
                            ? Math.min(
                                Math.max(
                                  parseFloat(
                                    (currentLayout.panels[panelId].size.height as string).replace(
                                      '%',
                                      ''
                                    )
                                  ),
                                  15
                                ),
                                85
                              )
                            : 50
                        }
                        minSize={15}
                        maxSize={85}
                        style={{ height: '100%', overflow: 'hidden' }}
                      >
                        <PanelComponent panelId={panelId}>
                          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            {children[panelId]}
                          </div>
                        </PanelComponent>
                      </Panel>
                      {index < centerPanels.length - 1 && (
                        <PanelResizeHandle className="panel-resize-handle horizontal" />
                      )}
                    </React.Fragment>
                  ))}
                </PanelGroup>
              </Panel>
            )}

            {/* Right sidebar */}
            {rightPanels.length > 0 && (
              <>
                <PanelResizeHandle className="panel-resize-handle" />
                <Panel
                  id="right-sidebar"
                  defaultSize={25}
                  minSize={20}
                  maxSize={40}
                  collapsible={false}
                  style={{ minWidth: '320px' }}
                >
                  <div className="right-panels-container">
                    {rightPanels.map((panelId) => (
                      <PanelComponent key={panelId} panelId={panelId}>
                        {children[panelId]}
                      </PanelComponent>
                    ))}
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </Panel>

        {/* Bottom panels (console) */}
        {bottomPanels.length > 0 && (
          <>
            <PanelResizeHandle className="panel-resize-handle horizontal" />
            <Panel id="bottom-area" defaultSize={25} minSize={15} maxSize={50}>
              <div className="bottom-panels-container">
                {bottomPanels.map((panelId) => (
                  <PanelComponent key={panelId} panelId={panelId}>
                    {children[panelId]}
                  </PanelComponent>
                ))}
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
};

export default WorkbenchLayoutManager;
