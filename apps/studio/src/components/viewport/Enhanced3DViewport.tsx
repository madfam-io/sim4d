import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IconButton } from '../ui/Button';
import { Panel } from '../ui/Panel';
import type { IconName } from '../icons/IconSystem';
import './Enhanced3DViewport.css';

export interface ViewportToolConfig {
  id: string;
  icon: IconName;
  label: string;
  shortcut?: string;
  group: 'navigation' | 'view' | 'measure' | 'tools';
  active?: boolean;
}

export interface ViewportProps {
  className?: string;
  onToolChange?: (toolId: string) => void;
  onViewChange?: (view: string) => void;
  onMeasurement?: (type: string, data: any) => void;
}

const VIEWPORT_TOOLS: ViewportToolConfig[] = [
  // Navigation Tools
  {
    id: 'orbit',
    icon: 'rotate-3d',
    label: 'Orbit',
    shortcut: 'O',
    group: 'navigation',
    active: true,
  },
  { id: 'pan', icon: 'move', label: 'Pan', shortcut: 'P', group: 'navigation' },
  { id: 'zoom', icon: 'zoom-in', label: 'Zoom', shortcut: 'Z', group: 'navigation' },
  { id: 'fit', icon: 'maximize', label: 'Fit All', shortcut: 'F', group: 'navigation' },

  // View Tools
  { id: 'wireframe', icon: 'grid-3x3', label: 'Wireframe', shortcut: 'W', group: 'view' },
  { id: 'shaded', icon: 'sun', label: 'Shaded', shortcut: 'S', group: 'view' },
  { id: 'xray', icon: 'eye', label: 'X-Ray', shortcut: 'X', group: 'view' },

  // Measurement Tools
  { id: 'measure-distance', icon: 'ruler', label: 'Distance', group: 'measure' },
  { id: 'measure-angle', icon: 'triangle', label: 'Angle', group: 'measure' },
  { id: 'measure-radius', icon: 'circle', label: 'Radius', group: 'measure' },

  // Other Tools
  { id: 'section', icon: 'scissors', label: 'Section', group: 'tools' },
  { id: 'explode', icon: 'layers', label: 'Explode', group: 'tools' },
];

const STANDARD_VIEWS = [
  { id: 'iso', label: 'ISO', icon: 'box' as IconName },
  { id: 'front', label: 'Front', icon: 'square' as IconName },
  { id: 'back', label: 'Back', icon: 'square' as IconName },
  { id: 'left', label: 'Left', icon: 'square' as IconName },
  { id: 'right', label: 'Right', icon: 'square' as IconName },
  { id: 'top', label: 'Top', icon: 'square' as IconName },
  { id: 'bottom', label: 'Bottom', icon: 'square' as IconName },
];

export const Enhanced3DViewport: React.FC<ViewportProps> = ({
  className = '',
  onToolChange,
  onViewChange,
  onMeasurement,
}) => {
  const [activeTool, setActiveTool] = useState('orbit');
  const [activeView, setActiveView] = useState('iso');
  const [showMeasurementPanel, setShowMeasurementPanel] = useState(false);
  const [measurements, setMeasurements] = useState<
    Array<{
      id: string;
      type: string;
      value: number;
      unit: string;
    }>
  >([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, z: 0 });
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    triangles: 125000,
    renderTime: 16.7,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Handle tool selection
  const handleToolSelect = useCallback(
    (toolId: string) => {
      setActiveTool(toolId);
      onToolChange?.(toolId);

      // Auto-show measurement panel for measurement tools
      if (toolId.startsWith('measure-')) {
        setShowMeasurementPanel(true);
      }
    },
    [onToolChange]
  );

  // Handle view change
  const handleViewChange = useCallback(
    (viewId: string) => {
      setActiveView(viewId);
      onViewChange?.(viewId);
    },
    [onViewChange]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const tool = VIEWPORT_TOOLS.find((t) => t.shortcut?.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        e.preventDefault();
        handleToolSelect(tool.id);
      }

      // Escape to deselect measurement tools
      if (e.key === 'Escape' && activeTool.startsWith('measure-')) {
        handleToolSelect('orbit');
        setShowMeasurementPanel(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, handleToolSelect]);

  // Mock mouse tracking (in real implementation, this would come from Three.js raycasting)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Mock 3D coordinate calculation
        setMousePosition({
          x: Math.round((x - rect.width / 2) * 0.1),
          y: Math.round((rect.height / 2 - y) * 0.1),
          z: 0,
        });
      }
    };

    const viewport = viewportRef.current;
    if (viewport) {
      viewport.addEventListener('mousemove', handleMouseMove);
      return () => viewport.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Mock performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceStats({
        fps: 58 + Math.random() * 4,
        triangles: 125000 + Math.random() * 10000,
        renderTime: 16 + Math.random() * 2,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addMeasurement = (type: string, value: number) => {
    const newMeasurement = {
      id: Date.now().toString(),
      type,
      value,
      unit: 'mm',
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
    onMeasurement?.(type, newMeasurement);
  };

  const removeMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const groupedTools = VIEWPORT_TOOLS.reduce(
    (groups, tool) => {
      if (!groups[tool.group]) {
        groups[tool.group] = [];
      }
      groups[tool.group].push(tool);
      return groups;
    },
    {} as Record<string, ViewportToolConfig[]>
  );

  return (
    <div ref={viewportRef} className={`enhanced-viewport ${className}`}>
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        className="viewport-canvas"
        style={{
          cursor: activeTool === 'pan' ? 'grab' : activeTool === 'zoom' ? 'zoom-in' : 'default',
        }}
      />

      {/* Enhanced Toolbar */}
      <div className="viewport-toolbar">
        {Object.entries(groupedTools).map(([groupName, tools]) => (
          <div key={groupName} className="viewport-toolbar-group">
            {tools.map((tool) => (
              <IconButton
                key={tool.id}
                icon={tool.icon}
                size="md"
                variant={activeTool === tool.id ? 'primary' : 'ghost'}
                className={`viewport-tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => handleToolSelect(tool.id)}
                aria-label={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Enhanced Navigation Cube */}
      <div className="navigation-cube">
        <div className="cube-container">
          {STANDARD_VIEWS.map((view) => (
            <button
              key={view.id}
              className={`cube-face cube-face-${view.id} ${activeView === view.id ? 'active' : ''}`}
              onClick={() => handleViewChange(view.id)}
              title={`View ${view.label}`}
            >
              {view.label}
            </button>
          ))}
          <button className="cube-center" onClick={() => handleViewChange('iso')} title="Home View">
            🏠
          </button>
        </div>
      </div>

      {/* Enhanced Coordinate Display */}
      <div className="coordinate-display">
        <div className="coordinate-item">
          <span className="coord-label">X</span>
          <span className="coord-value">{mousePosition.x.toFixed(1)}</span>
        </div>
        <div className="coordinate-item">
          <span className="coord-label">Y</span>
          <span className="coord-value">{mousePosition.y.toFixed(1)}</span>
        </div>
        <div className="coordinate-item">
          <span className="coord-label">Z</span>
          <span className="coord-value">{mousePosition.z.toFixed(1)}</span>
        </div>
      </div>

      {/* Scale Indicator */}
      <div className="scale-indicator">
        <div className="scale-bar">
          <div className="scale-line"></div>
          <span className="scale-label">50mm</span>
        </div>
        <div className="grid-info">
          <span className="grid-size">Grid: 10mm</span>
        </div>
      </div>

      {/* Performance Monitor */}
      <div className="performance-monitor">
        <div className="perf-item">
          <span className="perf-label">FPS</span>
          <span
            className={`perf-value ${performanceStats.fps > 55 ? 'good' : performanceStats.fps > 30 ? '' : 'bad'}`}
          >
            {performanceStats.fps.toFixed(0)}
          </span>
        </div>
        <div className="perf-item">
          <span className="perf-label">Triangles</span>
          <span className="perf-value">{(performanceStats.triangles / 1000).toFixed(0)}K</span>
        </div>
        <div className="perf-item">
          <span className="perf-label">Render</span>
          <span className="perf-value">{performanceStats.renderTime.toFixed(1)}ms</span>
        </div>
      </div>

      {/* Measurement Panel */}
      {showMeasurementPanel && (
        <Panel
          title="Measurements"
          subtitle="Click in viewport to measure"
          variant="floating"
          collapsible
          className="measurement-panel"
          headerActions={
            <IconButton
              icon="x"
              size="sm"
              variant="ghost"
              onClick={() => setShowMeasurementPanel(false)}
              aria-label="Close measurement panel"
            />
          }
        >
          <div className="measurement-tools">
            <div className="tool-grid">
              {groupedTools.measure?.map((tool) => (
                <button
                  key={tool.id}
                  className={`measurement-tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <div className="tool-icon">
                    <IconButton
                      icon={tool.icon}
                      size="sm"
                      variant="ghost"
                      aria-label={tool.label}
                    />
                  </div>
                  <span className="tool-label">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="measurements-list">
            {measurements.length > 0 ? (
              <>
                <div className="measurements-header">
                  <h4>Measurements</h4>
                </div>
                {measurements.map((measurement) => (
                  <div key={measurement.id} className="measurement-item">
                    <div className="measurement-info">
                      <div className="measurement-type">{measurement.type}</div>
                      <div className="measurement-value">
                        {measurement.value.toFixed(2)}
                        <span className="measurement-unit">{measurement.unit}</span>
                      </div>
                    </div>
                    <div className="measurement-actions">
                      <IconButton
                        icon="copy"
                        size="sm"
                        variant="ghost"
                        className="measurement-action-btn"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${measurement.value.toFixed(2)}${measurement.unit}`
                          )
                        }
                        aria-label="Copy measurement"
                      />
                      <IconButton
                        icon="trash-2"
                        size="sm"
                        variant="ghost"
                        className="measurement-action-btn delete"
                        onClick={() => removeMeasurement(measurement.id)}
                        aria-label="Delete measurement"
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="measurements-empty">
                <div className="measurements-empty-icon">📏</div>
                <div className="measurements-empty-text">No measurements</div>
                <div className="measurements-empty-hint">
                  Select a measurement tool and click in the viewport
                </div>
              </div>
            )}
          </div>

          {/* Mock measurement actions */}
          <div style={{ display: 'none' }}>
            <button onClick={() => addMeasurement('Distance', 25.4)}>Add Distance</button>
            <button onClick={() => addMeasurement('Angle', 45)}>Add Angle</button>
            <button onClick={() => addMeasurement('Radius', 12.7)}>Add Radius</button>
          </div>
        </Panel>
      )}
    </div>
  );
};
