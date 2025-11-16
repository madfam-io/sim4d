/**
 * Viewport Sync Controls
 *
 * Professional UI controls for configuring camera synchronization across
 * multiple viewports with CAD-style precision and usability.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { IconButton } from '../ui/Button';
import { Panel } from '../ui/Panel';
import type {
  CameraSyncMode,
  ViewportInstance,
  ViewportSyncParticipation,
} from './multi-viewport-interfaces';
import type { SyncMode, ViewportSyncSettings } from './CameraSynchronizationEngine';
import './ViewportSyncControls.css';

export interface ViewportSyncControlsProps {
  viewports: ViewportInstance[];
  activeViewportId: string;
  onSyncModeChange: (mode: CameraSyncMode) => void;
  onViewportSyncSettingsChange: (
    viewportId: string,
    settings: Partial<ViewportSyncSettings>
  ) => void;
  onGlobalSyncToggle: (enabled: boolean) => void;
  syncEnabled: boolean;
  currentSyncMode: CameraSyncMode;
  className?: string;
}

interface SyncModeConfig {
  id: CameraSyncMode;
  label: string;
  description: string;
  icon: string;
  shortDescription: string;
}

const SYNC_MODES: SyncModeConfig[] = [
  {
    id: 'none',
    label: 'Independent',
    description: 'All viewports operate independently',
    icon: 'unlink',
    shortDescription: 'No sync',
  },
  {
    id: 'rotation',
    label: 'Rotation Sync',
    description: 'Synchronized rotation and orbit, independent pan and zoom',
    icon: 'rotate-3d',
    shortDescription: 'Orbit only',
  },
  {
    id: 'pan',
    label: 'Pan Sync',
    description: 'Synchronized panning, independent rotation and zoom',
    icon: 'move',
    shortDescription: 'Pan only',
  },
  {
    id: 'zoom',
    label: 'Zoom Sync',
    description: 'Synchronized zoom level, independent pan and rotation',
    icon: 'zoom-in',
    shortDescription: 'Zoom only',
  },
  {
    id: 'full',
    label: 'Full Sync',
    description: 'Complete camera synchronization across all viewports',
    icon: 'link',
    shortDescription: 'All camera',
  },
  {
    id: 'orthographic-lock',
    label: 'Ortho Lock',
    description: 'Maintains orthographic view constraints during sync',
    icon: 'lock',
    shortDescription: 'Ortho constrained',
  },
];

const SYNC_DIRECTION_OPTIONS = [
  { id: 'all', label: 'All Axes', icon: 'box' },
  { id: 'xy', label: 'XY Plane', icon: 'square' },
  { id: 'xz', label: 'XZ Plane', icon: 'square' },
  { id: 'yz', label: 'YZ Plane', icon: 'square' },
] as const;

export const ViewportSyncControls: React.FC<ViewportSyncControlsProps> = ({
  viewports,
  activeViewportId,
  onSyncModeChange,
  onViewportSyncSettingsChange,
  onGlobalSyncToggle,
  syncEnabled,
  currentSyncMode,
  className = '',
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [selectedViewportId, setSelectedViewportId] = useState<string | null>(null);

  const currentSyncConfig = useMemo(() => {
    return SYNC_MODES.find((mode) => mode.id === currentSyncMode) || SYNC_MODES[0];
  }, [currentSyncMode]);

  const handleSyncModeSelect = useCallback(
    (mode: CameraSyncMode) => {
      onSyncModeChange(mode);
      if (mode === 'none') {
        onGlobalSyncToggle(false);
      } else {
        onGlobalSyncToggle(true);
      }
    },
    [onSyncModeChange, onGlobalSyncToggle]
  );

  const handleViewportPriorityChange = useCallback(
    (viewportId: string, priority: number) => {
      onViewportSyncSettingsChange(viewportId, { priority });
    },
    [onViewportSyncSettingsChange]
  );

  const handleViewportParticipationToggle = useCallback(
    (viewportId: string, participate: boolean) => {
      onViewportSyncSettingsChange(viewportId, { participateInSync: participate });
    },
    [onViewportSyncSettingsChange]
  );

  const renderSyncModeSelector = () => (
    <div className="sync-mode-selector">
      <div className="sync-mode-header">
        <h3>Camera Sync Mode</h3>
        <IconButton
          icon={syncEnabled ? 'link' : 'unlink'}
          size="sm"
          variant={syncEnabled ? 'primary' : 'ghost'}
          onClick={() => onGlobalSyncToggle(!syncEnabled)}
          title={`Sync ${syncEnabled ? 'Enabled' : 'Disabled'}`}
          aria-label={`${syncEnabled ? 'Disable' : 'Enable'} camera sync`}
        />
      </div>

      <div className="sync-mode-grid">
        {SYNC_MODES.map((mode) => (
          <button
            key={mode.id}
            className={`sync-mode-card ${currentSyncMode === mode.id ? 'active' : ''} ${!syncEnabled && mode.id !== 'none' ? 'disabled' : ''}`}
            onClick={() => handleSyncModeSelect(mode.id)}
            disabled={!syncEnabled && mode.id !== 'none'}
          >
            <div className="sync-mode-icon">
              <IconButton
                icon={mode.icon as any}
                size="md"
                variant="ghost"
                aria-label={mode.label}
              />
            </div>
            <div className="sync-mode-info">
              <div className="sync-mode-title">{mode.label}</div>
              <div className="sync-mode-short">{mode.shortDescription}</div>
            </div>
            {currentSyncMode === mode.id && (
              <div className="sync-mode-indicator">
                <IconButton
                  icon="check"
                  size="sm"
                  variant="ghost"
                  aria-label="Currently selected sync mode"
                />
              </div>
            )}
          </button>
        ))}
      </div>

      {syncEnabled && currentSyncConfig && (
        <div className="sync-mode-description">
          <div className="description-icon">
            <IconButton icon="info" size="sm" variant="ghost" aria-label="Sync mode information" />
          </div>
          <span>{currentSyncConfig.description}</span>
        </div>
      )}
    </div>
  );

  const renderViewportParticipation = () => (
    <div className="viewport-participation">
      <div className="participation-header">
        <h3>Viewport Participation</h3>
        <IconButton
          icon={showAdvancedControls ? 'chevron-up' : 'chevron-down'}
          size="sm"
          variant="ghost"
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          title="Toggle advanced controls"
          aria-label={`${showAdvancedControls ? 'Hide' : 'Show'} advanced controls`}
        />
      </div>

      <div className="viewport-list">
        {viewports.map((viewport) => (
          <div
            key={viewport.id}
            className={`viewport-item ${viewport.id === activeViewportId ? 'active' : ''}`}
          >
            <div className="viewport-info">
              <div className="viewport-indicator">
                <div
                  className={`viewport-type-icon ${viewport.viewType}`}
                  title={`${viewport.name} (${viewport.viewType})`}
                >
                  {viewport.viewType.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="viewport-details">
                <div className="viewport-name">{viewport.name}</div>
                <div className="viewport-type">{viewport.viewType}</div>
              </div>
            </div>

            <div className="viewport-controls">
              <IconButton
                icon="settings"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setSelectedViewportId(selectedViewportId === viewport.id ? null : viewport.id)
                }
                title="Viewport sync settings"
                aria-label="Viewport sync settings"
              />

              <label className="sync-toggle">
                <input
                  type="checkbox"
                  checked={true} // This would come from sync settings
                  onChange={(e) => handleViewportParticipationToggle(viewport.id, e.target.checked)}
                />
                <span className="sync-toggle-slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {showAdvancedControls && (
        <div className="advanced-controls">
          <div className="control-section">
            <h4>Sync Direction</h4>
            <div className="direction-buttons">
              {SYNC_DIRECTION_OPTIONS.map((option) => (
                <button key={option.id} className="direction-button" title={option.label}>
                  <IconButton
                    icon={option.icon as any}
                    size="sm"
                    variant="ghost"
                    aria-label={option.label}
                  />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h4>Interpolation Speed</h4>
            <div className="speed-control">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                defaultValue="0.8"
                className="speed-slider"
              />
              <div className="speed-labels">
                <span>Smooth</span>
                <span>Instant</span>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h4>Orthographic Preservation</h4>
            <label className="preservation-toggle">
              <input type="checkbox" defaultChecked />
              <span>Maintain orthographic view constraints</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );

  const renderSyncStatus = () => {
    if (!syncEnabled) return null;

    return (
      <div className="sync-status">
        <div className="status-indicator">
          <div className="status-dot active"></div>
          <span>Sync Active</span>
        </div>

        <div className="sync-stats">
          <div className="stat-item">
            <span className="stat-label">Mode:</span>
            <span className="stat-value">{currentSyncConfig.label}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Viewports:</span>
            <span className="stat-value">{viewports.length}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderViewportSettings = () => {
    if (!selectedViewportId) return null;

    const viewport = viewports.find((v) => v.id === selectedViewportId);
    if (!viewport) return null;

    return (
      <Panel
        title={`${viewport.name} Sync Settings`}
        subtitle="Configure sync behavior for this viewport"
        variant="floating"
        collapsible
        className="viewport-settings-panel"
        headerActions={
          <IconButton
            icon="x"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedViewportId(null)}
            aria-label="Close settings"
          />
        }
      >
        <div className="settings-content">
          <div className="setting-group">
            <h4>Sync Participation</h4>
            <div className="participation-options">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Receive updates from other viewports</span>
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                <span>Send updates to other viewports</span>
              </label>
            </div>
          </div>

          <div className="setting-group">
            <h4>Priority Level</h4>
            <div className="priority-control">
              <input
                type="range"
                min="1"
                max="10"
                defaultValue={viewport.viewType === 'perspective' ? '10' : '5'}
                onChange={(e) =>
                  handleViewportPriorityChange(viewport.id, parseInt(e.target.value))
                }
              />
              <div className="priority-labels">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="priority-description">
                Higher priority viewports take precedence in sync conflicts
              </div>
            </div>
          </div>

          <div className="setting-group">
            <h4>View Type Constraints</h4>
            <div className="constraint-info">
              <div className="constraint-item">
                <span className="constraint-label">View Type:</span>
                <span className="constraint-value">{viewport.viewType}</span>
              </div>
              <div className="constraint-item">
                <span className="constraint-label">Orthographic:</span>
                <span className="constraint-value">
                  {viewport.camera.isOrthographic ? 'Yes' : 'No'}
                </span>
              </div>
              {viewport.camera.isOrthographic && (
                <div className="constraint-note">
                  Orthographic views maintain axis alignment during sync
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>
    );
  };

  return (
    <div className={`viewport-sync-controls ${className}`}>
      {renderSyncStatus()}
      {renderSyncModeSelector()}
      {renderViewportParticipation()}
      {renderViewportSettings()}
    </div>
  );
};
