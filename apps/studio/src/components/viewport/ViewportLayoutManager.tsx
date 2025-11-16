import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ViewportInstance } from './ViewportInstance';
import { ViewportSyncControls } from './ViewportSyncControls';
import { IconButton } from '../ui/Button';
import { CameraSynchronizationEngine } from './CameraSynchronizationEngine';
import type {
  ViewportLayoutManagerProps,
  ViewportLayoutConfig,
  ViewportLayoutType,
  ViewportInstance as ViewportInstanceType,
  ViewportCameraState,
  ViewportRenderMode,
  ViewportViewType,
  CameraSyncMode,
} from './multi-viewport-interfaces';
import {
  DEFAULT_LAYOUTS,
  createDefaultViewports,
  STANDARD_VIEWPORT_CONFIGS,
} from './multi-viewport-interfaces';
import type { ViewportSyncSettings } from './CameraSynchronizationEngine';
import './ViewportLayoutManager.css';

const LAYOUT_ICONS: Record<
  ViewportLayoutType,
  'square' | 'grid-3x3' | 'columns' | 'rows' | 'layout-grid'
> = {
  single: 'square',
  quad: 'grid-3x3',
  horizontal: 'columns',
  vertical: 'rows',
  custom: 'layout-grid',
};

export const ViewportLayoutManager: React.FC<ViewportLayoutManagerProps> = ({
  className = '',
  onLayoutChange,
  onViewportSelect,
  onCameraChange,
  onRenderModeChange,
  initialLayout = 'single',
  initialViewports,
  enableKeyboardShortcuts = true,
  showLayoutControls = true,
  geometryData,
}) => {
  // Initialize layout configuration
  const [layoutConfig, setLayoutConfig] = useState<ViewportLayoutConfig>(() => {
    const baseConfig = DEFAULT_LAYOUTS[initialLayout];
    const viewports = initialViewports?.length
      ? (initialViewports.map((partial, index) => ({
          ...(createDefaultViewports(initialLayout)[index] || createDefaultViewports('single')[0]),
          ...partial,
        })) as ViewportInstanceType[])
      : createDefaultViewports(initialLayout);

    return {
      ...baseConfig,
      viewports,
      activeViewportId: viewports.find((v) => v.active)?.id || viewports[0]?.id || 'main',
    };
  });

  // State for UI controls
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showSyncControls, setShowSyncControls] = useState(false);
  const [syncedCameras, setSyncedCameras] = useState(false);
  const [currentSyncMode, setCurrentSyncMode] = useState<CameraSyncMode>('none');

  // Camera synchronization engine
  const syncEngineRef = useRef<CameraSynchronizationEngine | null>(null);
  const previousCameraStates = useRef<Map<string, ViewportCameraState>>(new Map());

  // Get active viewport
  const activeViewport = useMemo(() => {
    return layoutConfig.viewports.find((v) => v.id === layoutConfig.activeViewportId);
  }, [layoutConfig.viewports, layoutConfig.activeViewportId]);

  // Initialize synchronization engine
  useEffect(() => {
    if (!syncEngineRef.current) {
      syncEngineRef.current = new CameraSynchronizationEngine();
    }

    const engine = syncEngineRef.current;

    // Register all viewports with the sync engine
    layoutConfig.viewports.forEach((viewport) => {
      engine.registerViewport(viewport, {
        participateInSync: true,
        receivesUpdates: true,
        sendsUpdates: true,
        priority: viewport.viewType === 'perspective' ? 10 : 5,
        syncConfig: {
          mode: currentSyncMode,
          direction: 'all',
          preserveOrthographic: true,
          interpolationSpeed: 0.8,
          threshold: 0.001,
          debounceMs: 16,
        },
      });

      // Add event listener for camera updates
      engine.addEventListener(viewport.id, (event) => {
        if (event.sourceViewportId !== 'sync-engine') return;

        setLayoutConfig((prev) => ({
          ...prev,
          viewports: prev.viewports.map((v) =>
            v.id === viewport.id ? { ...v, camera: { ...v.camera, ...event.deltaCamera } } : v
          ),
        }));
      });

      // Store initial camera state
      previousCameraStates.current.set(viewport.id, { ...viewport.camera });
    });

    // Cleanup function
    return () => {
      layoutConfig.viewports.forEach((viewport) => {
        engine.unregisterViewport(viewport.id);
      });
    };
  }, [layoutConfig.viewports, currentSyncMode]);

  // Handle layout type change
  const handleLayoutChange = useCallback(
    (newLayoutType: ViewportLayoutType) => {
      const newConfig: ViewportLayoutConfig = {
        ...DEFAULT_LAYOUTS[newLayoutType],
        viewports: createDefaultViewports(newLayoutType),
        activeViewportId: createDefaultViewports(newLayoutType)[0]?.id || 'main',
      };

      setLayoutConfig(newConfig);
      onLayoutChange?.(newConfig);
      setShowLayoutMenu(false);
    },
    [onLayoutChange]
  );

  // Handle viewport selection
  const handleViewportSelect = useCallback(
    (viewportId: string) => {
      setLayoutConfig((prev) => {
        const newConfig = {
          ...prev,
          activeViewportId: viewportId,
          viewports: prev.viewports.map((v) => ({
            ...v,
            active: v.id === viewportId,
          })),
        };
        return newConfig;
      });
      onViewportSelect?.(viewportId);
    },
    [onViewportSelect]
  );

  // Handle camera changes with synchronization
  const handleCameraChange = useCallback(
    (viewportId: string, camera: ViewportCameraState) => {
      const previousCamera = previousCameraStates.current.get(viewportId);

      // Update the camera state
      setLayoutConfig((prev) => ({
        ...prev,
        viewports: prev.viewports.map((v) => (v.id === viewportId ? { ...v, camera } : v)),
      }));

      // Trigger synchronization if enabled and engine is available
      if (syncEngineRef.current && previousCamera && currentSyncMode !== 'none') {
        syncEngineRef.current.syncCameraChange(viewportId, camera, previousCamera);
      }

      // Store the new camera state
      previousCameraStates.current.set(viewportId, { ...camera });

      onCameraChange?.(viewportId, camera);
    },
    [onCameraChange, currentSyncMode]
  );

  // Handle render mode changes
  const handleRenderModeChange = useCallback(
    (viewportId: string, mode: ViewportRenderMode) => {
      setLayoutConfig((prev) => ({
        ...prev,
        viewports: prev.viewports.map((v) =>
          v.id === viewportId ? { ...v, renderMode: mode } : v
        ),
      }));
      onRenderModeChange?.(viewportId, mode);
    },
    [onRenderModeChange]
  );

  // Handle view type changes
  const handleViewTypeChange = useCallback((viewportId: string, viewType: ViewportViewType) => {
    const standardCamera = STANDARD_VIEWPORT_CONFIGS[viewType];
    if (standardCamera) {
      setLayoutConfig((prev) => ({
        ...prev,
        viewports: prev.viewports.map((v) =>
          v.id === viewportId
            ? {
                ...v,
                viewType,
                camera: { ...standardCamera, zoom: v.camera.zoom } as ViewportCameraState,
              }
            : v
        ),
      }));
    }
  }, []);

  // Handle sync mode changes
  const handleSyncModeChange = useCallback(
    (mode: CameraSyncMode) => {
      setCurrentSyncMode(mode);
      setSyncedCameras(mode !== 'none');
      setLayoutConfig((prev) => ({
        ...prev,
        syncedCameras: mode !== 'none',
      }));

      // Update sync settings for all viewports
      if (syncEngineRef.current) {
        layoutConfig.viewports.forEach((viewport) => {
          const settings = syncEngineRef.current?.getSyncSettings(viewport.id);
          if (settings) {
            syncEngineRef.current?.updateSyncSettings(viewport.id, {
              ...settings,
              syncConfig: {
                ...settings.syncConfig,
                mode: mode,
              },
            });
          }
        });
      }
    },
    [layoutConfig.viewports]
  );

  // Handle viewport sync settings changes
  const handleViewportSyncSettingsChange = useCallback(
    (viewportId: string, settings: Partial<ViewportSyncSettings>) => {
      if (syncEngineRef.current) {
        syncEngineRef.current.updateSyncSettings(viewportId, settings);
      }
    },
    []
  );

  // Handle global sync toggle
  const handleGlobalSyncToggle = useCallback(
    (enabled: boolean) => {
      if (enabled && currentSyncMode === 'none') {
        handleSyncModeChange('rotation'); // Default to rotation sync
      } else if (!enabled) {
        handleSyncModeChange('none');
      }
    },
    [currentSyncMode, handleSyncModeChange]
  );

  // Handle camera sync toggle (legacy support)
  const handleCameraSyncToggle = useCallback(() => {
    const newMode = currentSyncMode === 'none' ? 'rotation' : 'none';
    handleSyncModeChange(newMode);
  }, [currentSyncMode, handleSyncModeChange]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when no input is focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + layout number for quick layout switching
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        const num = parseInt(event.key);
        const layoutMap: Record<number, ViewportLayoutType> = {
          1: 'single',
          2: 'horizontal',
          3: 'vertical',
          4: 'quad',
        };

        const layout = layoutMap[num];
        if (layout) {
          event.preventDefault();
          handleLayoutChange(layout);
        }
      }

      // Tab to cycle through viewports in multi-viewport layouts
      if (
        event.key === 'Tab' &&
        !event.ctrlKey &&
        !event.metaKey &&
        layoutConfig.viewports.length > 1
      ) {
        event.preventDefault();
        const currentIndex = layoutConfig.viewports.findIndex(
          (v) => v.id === layoutConfig.activeViewportId
        );
        const nextIndex = (currentIndex + 1) % layoutConfig.viewports.length;
        handleViewportSelect(layoutConfig.viewports[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, layoutConfig, handleLayoutChange, handleViewportSelect]);

  // Render layout controls
  const renderLayoutControls = () => {
    if (!showLayoutControls) return null;

    return (
      <div className="viewport-layout-controls">
        {/* Layout Type Selector */}
        <div className="layout-selector">
          <IconButton
            icon={LAYOUT_ICONS[layoutConfig.type]}
            size="md"
            variant="ghost"
            className="layout-toggle-btn"
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            title={`Layout: ${layoutConfig.type} (Ctrl+1-4)`}
            aria-label={`Change layout from ${layoutConfig.type}`}
          />

          {showLayoutMenu && (
            <div className="layout-menu">
              {Object.entries(LAYOUT_ICONS).map(([layoutType, icon]) => (
                <button
                  key={layoutType}
                  className={`layout-option ${layoutConfig.type === layoutType ? 'active' : ''}`}
                  onClick={() => handleLayoutChange(layoutType as ViewportLayoutType)}
                  title={`${layoutType} layout`}
                >
                  <IconButton
                    icon={icon}
                    size="sm"
                    variant="ghost"
                    aria-label={`${layoutType} layout`}
                  />
                  <span>{layoutType}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Camera Sync Controls */}
        {layoutConfig.viewports.length > 1 && (
          <>
            <IconButton
              icon="link"
              size="md"
              variant={syncedCameras ? 'primary' : 'ghost'}
              className="camera-sync-btn"
              onClick={handleCameraSyncToggle}
              title={`Camera Sync: ${syncedCameras ? 'ON' : 'OFF'} (${currentSyncMode})`}
              aria-label={`Toggle camera sync (currently ${syncedCameras ? 'enabled' : 'disabled'})`}
            />
            <IconButton
              icon="settings"
              size="md"
              variant={showSyncControls ? 'primary' : 'ghost'}
              className="sync-settings-btn"
              onClick={() => setShowSyncControls(!showSyncControls)}
              title="Sync Settings"
              aria-label="Sync Settings"
            />
          </>
        )}

        {/* Active Viewport Info */}
        {activeViewport && (
          <div className="active-viewport-info">
            <span className="active-viewport-name">{activeViewport.name}</span>
            <span className="active-viewport-view">{activeViewport.viewType}</span>
          </div>
        )}
      </div>
    );
  };

  // Render viewports based on layout type
  const renderViewports = () => {
    const { viewports, type } = layoutConfig;

    switch (type) {
      case 'single':
        return (
          <div className="viewport-layout-single">
            {viewports[0] && (
              <ViewportInstance
                viewport={viewports[0]}
                isActive={viewports[0].id === layoutConfig.activeViewportId}
                geometryData={geometryData}
                onCameraChange={(camera) => handleCameraChange(viewports[0].id, camera)}
                onSelect={() => handleViewportSelect(viewports[0].id)}
                onRenderModeChange={(mode) => handleRenderModeChange(viewports[0].id, mode)}
                onViewTypeChange={(viewType) => handleViewTypeChange(viewports[0].id, viewType)}
              />
            )}
          </div>
        );

      case 'horizontal':
        return (
          <PanelGroup direction="horizontal" className="viewport-layout-horizontal">
            {viewports.map((viewport, index) => (
              <React.Fragment key={viewport.id}>
                <Panel defaultSize={50} minSize={20}>
                  <ViewportInstance
                    viewport={viewport}
                    isActive={viewport.id === layoutConfig.activeViewportId}
                    geometryData={geometryData}
                    onCameraChange={(camera) => handleCameraChange(viewport.id, camera)}
                    onSelect={() => handleViewportSelect(viewport.id)}
                    onRenderModeChange={(mode) => handleRenderModeChange(viewport.id, mode)}
                    onViewTypeChange={(viewType) => handleViewTypeChange(viewport.id, viewType)}
                  />
                </Panel>
                {index < viewports.length - 1 && (
                  <PanelResizeHandle className="viewport-resize-handle" />
                )}
              </React.Fragment>
            ))}
          </PanelGroup>
        );

      case 'vertical':
        return (
          <PanelGroup direction="vertical" className="viewport-layout-vertical">
            {viewports.map((viewport, index) => (
              <React.Fragment key={viewport.id}>
                <Panel defaultSize={50} minSize={20}>
                  <ViewportInstance
                    viewport={viewport}
                    isActive={viewport.id === layoutConfig.activeViewportId}
                    geometryData={geometryData}
                    onCameraChange={(camera) => handleCameraChange(viewport.id, camera)}
                    onSelect={() => handleViewportSelect(viewport.id)}
                    onRenderModeChange={(mode) => handleRenderModeChange(viewport.id, mode)}
                    onViewTypeChange={(viewType) => handleViewTypeChange(viewport.id, viewType)}
                  />
                </Panel>
                {index < viewports.length - 1 && (
                  <PanelResizeHandle className="viewport-resize-handle horizontal" />
                )}
              </React.Fragment>
            ))}
          </PanelGroup>
        );

      case 'quad':
        const [topLeft, topRight, bottomLeft, bottomRight] = viewports;
        return (
          <PanelGroup direction="vertical" className="viewport-layout-quad">
            {/* Top Row */}
            <Panel defaultSize={50} minSize={20}>
              <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={20}>
                  {topLeft && (
                    <ViewportInstance
                      viewport={topLeft}
                      isActive={topLeft.id === layoutConfig.activeViewportId}
                      geometryData={geometryData}
                      onCameraChange={(camera) => handleCameraChange(topLeft.id, camera)}
                      onSelect={() => handleViewportSelect(topLeft.id)}
                      onRenderModeChange={(mode) => handleRenderModeChange(topLeft.id, mode)}
                      onViewTypeChange={(viewType) => handleViewTypeChange(topLeft.id, viewType)}
                    />
                  )}
                </Panel>
                <PanelResizeHandle className="viewport-resize-handle" />
                <Panel defaultSize={50} minSize={20}>
                  {topRight && (
                    <ViewportInstance
                      viewport={topRight}
                      isActive={topRight.id === layoutConfig.activeViewportId}
                      geometryData={geometryData}
                      onCameraChange={(camera) => handleCameraChange(topRight.id, camera)}
                      onSelect={() => handleViewportSelect(topRight.id)}
                      onRenderModeChange={(mode) => handleRenderModeChange(topRight.id, mode)}
                      onViewTypeChange={(viewType) => handleViewTypeChange(topRight.id, viewType)}
                    />
                  )}
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="viewport-resize-handle horizontal" />

            {/* Bottom Row */}
            <Panel defaultSize={50} minSize={20}>
              <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={20}>
                  {bottomLeft && (
                    <ViewportInstance
                      viewport={bottomLeft}
                      isActive={bottomLeft.id === layoutConfig.activeViewportId}
                      geometryData={geometryData}
                      onCameraChange={(camera) => handleCameraChange(bottomLeft.id, camera)}
                      onSelect={() => handleViewportSelect(bottomLeft.id)}
                      onRenderModeChange={(mode) => handleRenderModeChange(bottomLeft.id, mode)}
                      onViewTypeChange={(viewType) => handleViewTypeChange(bottomLeft.id, viewType)}
                    />
                  )}
                </Panel>
                <PanelResizeHandle className="viewport-resize-handle" />
                <Panel defaultSize={50} minSize={20}>
                  {bottomRight && (
                    <ViewportInstance
                      viewport={bottomRight}
                      isActive={bottomRight.id === layoutConfig.activeViewportId}
                      geometryData={geometryData}
                      onCameraChange={(camera) => handleCameraChange(bottomRight.id, camera)}
                      onSelect={() => handleViewportSelect(bottomRight.id)}
                      onRenderModeChange={(mode) => handleRenderModeChange(bottomRight.id, mode)}
                      onViewTypeChange={(viewType) =>
                        handleViewTypeChange(bottomRight.id, viewType)
                      }
                    />
                  )}
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        );

      default:
        return renderViewports(); // Fallback to current logic
    }
  };

  const containerClasses = [
    'viewport-layout-manager',
    `layout-${layoutConfig.type}`,
    syncedCameras && 'cameras-synced',
    showSyncControls && 'sync-controls-open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Cleanup sync engine on unmount
  useEffect(() => {
    return () => {
      if (syncEngineRef.current) {
        syncEngineRef.current.dispose();
        syncEngineRef.current = null;
      }
    };
  }, []);

  return (
    <div className={containerClasses}>
      {renderLayoutControls()}
      <div className="viewport-layout-content">{renderViewports()}</div>

      {/* Advanced Sync Controls Panel */}
      {showSyncControls && layoutConfig.viewports.length > 1 && (
        <div className="sync-controls-panel">
          <ViewportSyncControls
            viewports={layoutConfig.viewports}
            activeViewportId={layoutConfig.activeViewportId}
            onSyncModeChange={handleSyncModeChange}
            onViewportSyncSettingsChange={handleViewportSyncSettingsChange}
            onGlobalSyncToggle={handleGlobalSyncToggle}
            syncEnabled={syncedCameras}
            currentSyncMode={currentSyncMode}
            className="viewport-sync-controls-instance"
          />
        </div>
      )}
    </div>
  );
};
