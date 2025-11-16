import React, { useCallback, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '../../store/layout-store';
import type { PanelId, PanelConfig } from '../../types/layout';

interface ResizablePanelProps {
  id: PanelId;
  children: ReactNode;
  className?: string;
}

interface PanelHeaderProps {
  panel: PanelConfig;
  onMinimize: () => void;
  onClose: () => void;
  onFocus: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ panel, onMinimize, onClose, onFocus }) => (
  <div className="panel-header">
    <div className="panel-title">
      <span>{panel.title}</span>
      {panel.minimized && <span className="minimized-indicator">●</span>}
    </div>
    <div className="panel-controls">
      <motion.button
        className="panel-control-button focus-button"
        onClick={onFocus}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Focus panel (F)"
      >
        ⊡
      </motion.button>
      <motion.button
        className="panel-control-button minimize-button"
        onClick={onMinimize}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={panel.minimized ? 'Restore' : 'Minimize'}
      >
        {panel.minimized ? '□' : '−'}
      </motion.button>
      {panel.closable && (
        <motion.button
          className="panel-control-button close-button"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Close panel"
        >
          ×
        </motion.button>
      )}
    </div>
  </div>
);

export const ResizablePanel: React.FC<ResizablePanelProps> = ({ id, children, className = '' }) => {
  const {
    currentLayout,
    focusMode,
    updatePanelConfig,
    togglePanelVisibility,
    minimizePanel,
    maximizePanel,
    enterFocusMode,
    exitFocusMode,
  } = useLayoutStore();

  const panelConfig = currentLayout.panels[id];
  const isFocused = focusMode.focusedPanel === id;
  const isOtherPanelFocused = focusMode.focusedPanel && focusMode.focusedPanel !== id;

  const handleMinimize = useCallback(() => {
    if (panelConfig.minimized) {
      maximizePanel(id);
    } else {
      minimizePanel(id);
    }
  }, [id, panelConfig.minimized, maximizePanel, minimizePanel]);

  const handleClose = useCallback(() => {
    togglePanelVisibility(id);
  }, [id, togglePanelVisibility]);

  const handleFocus = useCallback(() => {
    if (isFocused) {
      exitFocusMode();
    } else {
      enterFocusMode(id);
    }
  }, [id, isFocused, enterFocusMode, exitFocusMode]);

  const panelStyle = useMemo(() => {
    const style: React.CSSProperties = {};

    if (panelConfig.size.width) {
      style.width =
        typeof panelConfig.size.width === 'number'
          ? `${panelConfig.size.width}px`
          : panelConfig.size.width;
    }

    if (panelConfig.size.height) {
      style.height =
        typeof panelConfig.size.height === 'number'
          ? `${panelConfig.size.height}px`
          : panelConfig.size.height;
    }

    if (panelConfig.size.minWidth) {
      style.minWidth = `${panelConfig.size.minWidth}px`;
    }

    if (panelConfig.size.minHeight) {
      style.minHeight = `${panelConfig.size.minHeight}px`;
    }

    return style;
  }, [panelConfig.size]);

  const panelClasses = useMemo(() => {
    const classes = ['resizable-panel', className];

    if (panelConfig.minimized) classes.push('minimized');
    if (isFocused) classes.push('focused');
    if (isOtherPanelFocused && focusMode.dimOtherPanels) classes.push('dimmed');
    if (!panelConfig.visible) classes.push('hidden');

    return classes.join(' ');
  }, [
    className,
    panelConfig.minimized,
    panelConfig.visible,
    isFocused,
    isOtherPanelFocused,
    focusMode.dimOtherPanels,
  ]);

  if (!panelConfig.visible && !isFocused) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className={panelClasses}
        style={panelStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isOtherPanelFocused && focusMode.dimOtherPanels ? 0.3 : 1,
          scale: isFocused ? 1.02 : 1,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: focusMode.transitionDuration / 1000,
          ease: 'easeInOut',
        }}
        layout
      >
        <PanelHeader
          panel={panelConfig}
          onMinimize={handleMinimize}
          onClose={handleClose}
          onFocus={handleFocus}
        />

        <AnimatePresence>
          {!panelConfig.minimized && (
            <motion.div
              className="panel-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
