import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { MobileLayout } from './mobile/MobileLayout';
import { TabletLayout } from './tablet/TabletLayout';
import { DesktopLayout } from './desktop/DesktopLayout';
import './ResponsiveLayoutManager.css';

export interface Panel {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
  badge?: number;
}

export interface ResponsiveLayoutProps {
  panels: {
    nodeEditor: Panel;
    viewport: Panel;
    palette: Panel;
    inspector: Panel;
    console?: Panel;
    toolbar?: Panel;
  };
  defaultPanel?: string;
  onPanelChange?: (panelId: string) => void;
  enableGestures?: boolean;
  enableKeyboardShortcuts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export const ResponsiveLayoutManager: React.FC<ResponsiveLayoutProps> = ({
  panels,
  defaultPanel = 'nodeEditor',
  onPanelChange,
  enableGestures = true,
  enableKeyboardShortcuts = true,
  theme = 'auto',
}) => {
  const { deviceType, isMobile, isTablet, isDesktop, capabilities, dimensions } = useResponsive();
  const [activePanel, setActivePanel] = useState(defaultPanel);
  const [splitRatio, setSplitRatio] = useState(0.6);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle panel change
  const handlePanelChange = useCallback(
    (panelId: string) => {
      setActivePanel(panelId);
      onPanelChange?.(panelId);
    },
    [onPanelChange]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + number to switch panels
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const panelIndex = parseInt(e.key) - 1;
        const panelIds = Object.keys(panels);
        if (panelIds[panelIndex]) {
          handlePanelChange(panelIds[panelIndex]);
        }
      }

      // Cmd/Ctrl + F for fullscreen
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboardShortcuts, panels, handlePanelChange]);

  // Gesture handling for mobile/tablet
  useEffect(() => {
    if (!enableGestures || !capabilities.touch) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Swipe detection (horizontal swipe for panel navigation)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const panelIds = Object.keys(panels);
        const currentIndex = panelIds.indexOf(activePanel);

        if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - previous panel
          handlePanelChange(panelIds[currentIndex - 1]);
        } else if (deltaX < 0 && currentIndex < panelIds.length - 1) {
          // Swipe left - next panel
          handlePanelChange(panelIds[currentIndex + 1]);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [enableGestures, capabilities.touch, activePanel, panels, handlePanelChange]);

  // Render appropriate layout based on device type
  const renderLayout = () => {
    const layoutProps = {
      panels,
      activePanel,
      onPanelChange: handlePanelChange,
      isFullscreen,
      onFullscreenToggle: () => setIsFullscreen(!isFullscreen),
      dimensions,
      capabilities,
    };

    if (isMobile) {
      return <MobileLayout {...layoutProps} />;
    }

    if (isTablet) {
      return (
        <TabletLayout {...layoutProps} splitRatio={splitRatio} onSplitRatioChange={setSplitRatio} />
      );
    }

    return <DesktopLayout {...layoutProps} />;
  };

  return (
    <div
      ref={containerRef}
      className={`responsive-layout-manager ${deviceType} ${theme}`}
      data-fullscreen={isFullscreen}
      data-touch={capabilities.touch}
    >
      {renderLayout()}

      {/* Development helper - Show current breakpoint */}
      {process.env.NODE_ENV === 'development' && (
        <div className="breakpoint-indicator">
          {deviceType} ({dimensions.width}x{dimensions.height})
        </div>
      )}
    </div>
  );
};
