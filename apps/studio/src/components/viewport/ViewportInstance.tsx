import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Enhanced3DViewport } from './Enhanced3DViewport';
import { IconButton } from '../ui/Button';
import type {
  ViewportInstanceProps,
  ViewportRenderMode,
  ViewportViewType,
} from './multi-viewport-interfaces';
import './ViewportInstance.css';

const RENDER_MODE_ICONS: Record<
  ViewportRenderMode,
  'grid-3x3' | 'sun' | 'image' | 'eye' | 'camera'
> = {
  wireframe: 'grid-3x3',
  shaded: 'sun',
  textured: 'image',
  xray: 'eye',
  realistic: 'camera',
};

const VIEW_TYPE_ICONS: Record<ViewportViewType, 'box' | 'square'> = {
  perspective: 'box',
  front: 'square',
  back: 'square',
  left: 'square',
  right: 'square',
  top: 'square',
  bottom: 'square',
  iso: 'box',
};

export const ViewportInstance: React.FC<ViewportInstanceProps> = ({
  viewport,
  isActive,
  geometryData,
  onCameraChange,
  onSelect,
  onRenderModeChange,
  onViewTypeChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle viewport selection
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect?.();
    },
    [onSelect]
  );

  // Handle render mode cycling
  const handleRenderModeToggle = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      const modes: ViewportRenderMode[] = ['wireframe', 'shaded', 'textured', 'xray', 'realistic'];
      const currentIndex = modes.indexOf(viewport.renderMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      onRenderModeChange?.(nextMode);
    },
    [viewport.renderMode, onRenderModeChange]
  );

  // Handle view type change
  const handleViewTypeChange = useCallback(
    (viewType: ViewportViewType) => {
      onViewTypeChange?.(viewType);
      setShowControls(false);
    },
    [onViewTypeChange]
  );

  // Handle camera changes from Enhanced3DViewport
  const handleToolChange = useCallback(
    (toolId: string) => {
      // This will be connected to actual camera controls later
      console.log(`Viewport ${viewport.id}: Tool changed to ${toolId}`);
    },
    [viewport.id]
  );

  const handleViewChange = useCallback(
    (view: string) => {
      // Map string view to ViewportViewType
      const viewTypeMap: Record<string, ViewportViewType> = {
        iso: 'iso',
        front: 'front',
        back: 'back',
        left: 'left',
        right: 'right',
        top: 'top',
        bottom: 'bottom',
      };

      const viewType = viewTypeMap[view] || 'perspective';
      onViewTypeChange?.(viewType);
    },
    [onViewTypeChange]
  );

  // Handle mouse events for hover state
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowControls(false);
  }, []);

  // Handle keyboard shortcuts for this viewport when active
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if this viewport is active and no modifiers
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      switch (event.key.toLowerCase()) {
        case '1':
          event.preventDefault();
          handleViewTypeChange('front');
          break;
        case '2':
          event.preventDefault();
          handleViewTypeChange('back');
          break;
        case '3':
          event.preventDefault();
          handleViewTypeChange('right');
          break;
        case '4':
          event.preventDefault();
          handleViewTypeChange('left');
          break;
        case '5':
          event.preventDefault();
          handleViewTypeChange('top');
          break;
        case '6':
          event.preventDefault();
          handleViewTypeChange('bottom');
          break;
        case '7':
          event.preventDefault();
          handleViewTypeChange('iso');
          break;
        case 'r':
          event.preventDefault();
          handleRenderModeToggle(event as any);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleViewTypeChange, handleRenderModeToggle]);

  const containerClasses = [
    'viewport-instance',
    isActive && 'active',
    isHovered && 'hovered',
    viewport.locked && 'locked',
    !viewport.visible && 'hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-viewport-id={viewport.id}
    >
      {/* Viewport Header */}
      <div className="viewport-header">
        <div className="viewport-info">
          <span className="viewport-name">{viewport.name}</span>
          <span className="viewport-view-type">{viewport.viewType}</span>
        </div>

        <div className="viewport-controls">
          {/* Render Mode Toggle */}
          <IconButton
            icon={RENDER_MODE_ICONS[viewport.renderMode]}
            size="sm"
            variant="ghost"
            className="viewport-control-btn"
            onClick={handleRenderModeToggle}
            title={`Render Mode: ${viewport.renderMode} (R)`}
            aria-label={`Switch render mode from ${viewport.renderMode}`}
          />

          {/* View Type Menu */}
          <div className="viewport-view-menu">
            <IconButton
              icon={VIEW_TYPE_ICONS[viewport.viewType]}
              size="sm"
              variant="ghost"
              className="viewport-control-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowControls(!showControls);
              }}
              title={`View: ${viewport.viewType}`}
              aria-label={`Change view type from ${viewport.viewType}`}
            />

            {showControls && (
              <div className="view-type-dropdown">
                {Object.entries(VIEW_TYPE_ICONS).map(([viewType, icon]) => (
                  <button
                    key={viewType}
                    className={`view-type-option ${viewport.viewType === viewType ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTypeChange(viewType as ViewportViewType);
                    }}
                  >
                    <IconButton
                      icon={icon}
                      size="sm"
                      variant="ghost"
                      aria-label={`Switch to ${viewType} view`}
                    />
                    <span>{viewType}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lock Toggle */}
          {viewport.locked && (
            <IconButton
              icon="lock"
              size="sm"
              variant="ghost"
              className="viewport-control-btn locked"
              title="Viewport Locked"
              aria-label="Viewport Locked"
            />
          )}
        </div>
      </div>

      {/* Active Viewport Indicator */}
      {isActive && <div className="viewport-active-indicator" />}

      {/* Viewport Content */}
      <div className="viewport-content">
        <Enhanced3DViewport
          className="viewport-3d"
          onToolChange={handleToolChange}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Viewport Status */}
      <div className="viewport-status">
        <div className="viewport-camera-info">
          <span className="camera-mode">
            {viewport.camera.isOrthographic ? 'Orthographic' : 'Perspective'}
          </span>
          <span className="camera-zoom">Zoom: {(viewport.camera.zoom * 100).toFixed(0)}%</span>
        </div>

        <div className="viewport-quality">
          <span className={`quality-indicator quality-${viewport.quality}`}>
            {viewport.quality.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
