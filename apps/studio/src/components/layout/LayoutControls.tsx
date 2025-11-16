import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '../../store/layout-store';
import { LAYOUT_PRESETS } from '../../config/layout-presets';
import type { LayoutPresetId, PanelId } from '../../types/layout';

interface LayoutControlsProps {
  position?: 'top' | 'bottom' | 'floating';
}

const LayoutPresetButton: React.FC<{
  presetId: string;
  preset: (typeof LAYOUT_PRESETS)[keyof typeof LAYOUT_PRESETS];
  isActive: boolean;
  onClick: () => void;
}> = ({ presetId, preset, isActive, onClick }) => (
  <motion.button
    className={`preset-button ${isActive ? 'active' : ''}`}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    title={preset.description}
  >
    <div className="preset-icon">
      {presetId === 'guided' && '🎓'}
      {presetId === 'professional' && '💼'}
      {presetId === 'modeling' && '🎨'}
      {presetId === 'nodeFocused' && '🔧'}
    </div>
    <div className="preset-name">{preset.name}</div>
  </motion.button>
);

const PanelToggleButton: React.FC<{
  panelId: PanelId;
  panelName: string;
  isVisible: boolean;
  isMinimized: boolean;
  onToggle: () => void;
  onMinimize: () => void;
}> = ({ panelId, panelName, isVisible, isMinimized, onToggle, onMinimize }) => (
  <div className="panel-toggle-group">
    <motion.button
      className={`panel-toggle ${isVisible ? 'visible' : 'hidden'}`}
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`${isVisible ? 'Hide' : 'Show'} ${panelName}`}
    >
      <span className="panel-icon">
        {panelId === 'nodePanel' && '📦'}
        {panelId === 'nodeEditor' && '🔗'}
        {panelId === 'viewport3d' && '👁️'}
        {panelId === 'inspector' && '⚙️'}
        {panelId === 'console' && '💻'}
      </span>
      <span className="panel-name">{panelName}</span>
    </motion.button>

    {isVisible && (
      <motion.button
        className={`panel-minimize ${isMinimized ? 'minimized' : 'maximized'}`}
        onClick={onMinimize}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={`${isMinimized ? 'Restore' : 'Minimize'} ${panelName}`}
      >
        {isMinimized ? '□' : '−'}
      </motion.button>
    )}
  </div>
);

export const LayoutControls: React.FC<LayoutControlsProps> = ({ position = 'floating' }) => {
  const {
    currentLayout,
    focusMode,
    savedLayouts,
    loadPreset,
    saveAsPreset,
    deletePreset,
    togglePanelVisibility,
    minimizePanel,
    maximizePanel,
    resetToDefault,
    exportLayout,
    importLayout,
    exitFocusMode,
  } = useLayoutStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showPanelControls, setShowPanelControls] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  const currentPresetId =
    Object.keys(LAYOUT_PRESETS).find((key) => LAYOUT_PRESETS[key]?.name === currentLayout.name) ||
    null;

  const handlePresetClick = useCallback(
    (presetId: LayoutPresetId) => {
      loadPreset(presetId);
      setShowPresets(false);
    },
    [loadPreset]
  );

  const handlePanelToggle = useCallback(
    (panelId: PanelId) => {
      togglePanelVisibility(panelId);
    },
    [togglePanelVisibility]
  );

  const handlePanelMinimize = useCallback(
    (panelId: PanelId) => {
      const panel = currentLayout.panels[panelId];
      if (panel.minimized) {
        maximizePanel(panelId);
      } else {
        minimizePanel(panelId);
      }
    },
    [currentLayout.panels, maximizePanel, minimizePanel]
  );

  const handleSavePreset = useCallback(() => {
    if (newPresetName.trim()) {
      saveAsPreset(newPresetName.trim());
      setNewPresetName('');
      setSaveDialogOpen(false);
    }
  }, [newPresetName, saveAsPreset]);

  const handleImportLayout = useCallback(() => {
    try {
      importLayout(importJson);
      setImportJson('');
      setImportDialogOpen(false);
    } catch (error) {
      alert('Invalid layout format');
    }
  }, [importJson, importLayout]);

  const handleExportLayout = useCallback(() => {
    const exported = exportLayout();
    navigator.clipboard.writeText(exported);
    alert('Layout copied to clipboard!');
  }, [exportLayout]);

  if (focusMode.focusedPanel) {
    return (
      <div className="layout-controls focus-mode">
        <motion.button
          className="exit-focus-button"
          onClick={exitFocusMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Exit Focus Mode
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`layout-controls ${position}`}>
      <motion.button
        className="layout-controls-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        ⚙️
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="layout-controls-menu"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Layout Presets */}
            <div className="control-section">
              <button className="section-header" onClick={() => setShowPresets(!showPresets)}>
                📐 Layout Presets {showPresets ? '▼' : '▶'}
              </button>

              <AnimatePresence>
                {showPresets && (
                  <motion.div
                    className="preset-grid"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {Object.entries(LAYOUT_PRESETS).map(([presetId, preset]) => (
                      <LayoutPresetButton
                        key={presetId}
                        presetId={presetId}
                        preset={preset}
                        isActive={currentPresetId === presetId}
                        onClick={() => handlePresetClick(presetId as LayoutPresetId)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panel Controls */}
            <div className="control-section">
              <button
                className="section-header"
                onClick={() => setShowPanelControls(!showPanelControls)}
              >
                🪟 Panel Controls {showPanelControls ? '▼' : '▶'}
              </button>

              <AnimatePresence>
                {showPanelControls && (
                  <motion.div
                    className="panel-controls"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {Object.entries(currentLayout.panels)
                      .filter(([panelId]) => panelId !== 'toolbar')
                      .map(([panelId, panel]) => (
                        <PanelToggleButton
                          key={panelId}
                          panelId={panelId as PanelId}
                          panelName={panel.title}
                          isVisible={panel.visible}
                          isMinimized={panel.minimized}
                          onToggle={() => handlePanelToggle(panelId as PanelId)}
                          onMinimize={() => handlePanelMinimize(panelId as PanelId)}
                        />
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Layout Actions */}
            <div className="control-section">
              <div className="section-header">💾 Layout Actions</div>
              <div className="action-buttons">
                <motion.button
                  className="action-button"
                  onClick={() => setSaveDialogOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save As Preset
                </motion.button>

                <motion.button
                  className="action-button"
                  onClick={handleExportLayout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Export Layout
                </motion.button>

                <motion.button
                  className="action-button"
                  onClick={() => setImportDialogOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Import Layout
                </motion.button>

                <motion.button
                  className="action-button danger"
                  onClick={resetToDefault}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset to Default
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <AnimatePresence>
        {saveDialogOpen && (
          <motion.div
            className="dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSaveDialogOpen(false)}
          >
            <motion.div
              className="dialog"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Save Layout as Preset</h3>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name..."
                onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
              />
              <div className="dialog-actions">
                <button onClick={() => setSaveDialogOpen(false)}>Cancel</button>
                <button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Dialog */}
      <AnimatePresence>
        {importDialogOpen && (
          <motion.div
            className="dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImportDialogOpen(false)}
          >
            <motion.div
              className="dialog large"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Import Layout</h3>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste layout JSON here..."
                rows={10}
              />
              <div className="dialog-actions">
                <button onClick={() => setImportDialogOpen(false)}>Cancel</button>
                <button onClick={handleImportLayout} disabled={!importJson.trim()}>
                  Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
