/**
 * Camera Synchronization Demo
 *
 * Demonstration component showcasing the sophisticated camera synchronization
 * system with professional CAD-style viewport coordination.
 */

import React, { useState, useCallback } from 'react';
import { ViewportLayoutManager } from './ViewportLayoutManager';
import { IconButton } from '../ui/Button';
import { Panel } from '../ui/Panel';
import type {
  ViewportLayoutType,
  ViewportCameraState,
  ViewportRenderMode,
  CameraSyncMode,
} from './multi-viewport-interfaces';
import './CameraSyncDemo.css';

interface DemoState {
  layout: ViewportLayoutType;
  syncMode: CameraSyncMode;
  activeDemo: 'rotation' | 'pan' | 'zoom' | 'orthographic' | 'mixed' | null;
  performance: {
    syncLatency: number;
    updatesPerSecond: number;
    averageFrameTime: number;
  };
  cameraStates: Record<string, ViewportCameraState>;
}

const DEMO_SCENARIOS = [
  {
    id: 'rotation',
    title: 'Rotation Sync',
    description: 'Synchronized orbit/rotation while preserving orthographic view constraints',
    syncMode: 'rotation' as CameraSyncMode,
    layout: 'quad' as ViewportLayoutType,
    icon: 'rotate-3d',
  },
  {
    id: 'pan',
    title: 'Pan Sync',
    description: 'Coordinated panning across viewports with view-plane projection',
    syncMode: 'pan' as CameraSyncMode,
    layout: 'horizontal' as ViewportLayoutType,
    icon: 'move',
  },
  {
    id: 'zoom',
    title: 'Zoom Sync',
    description: 'Proportional zoom synchronization with scale adaptation',
    syncMode: 'zoom' as CameraSyncMode,
    layout: 'vertical' as ViewportLayoutType,
    icon: 'zoom-in',
  },
  {
    id: 'orthographic',
    title: 'Orthographic Lock',
    description: 'Maintains axis alignment for orthographic views during sync',
    syncMode: 'orthographic-lock' as CameraSyncMode,
    layout: 'quad' as ViewportLayoutType,
    icon: 'lock',
  },
  {
    id: 'mixed',
    title: 'Full Sync',
    description: 'Complete camera coordination with intelligent view preservation',
    syncMode: 'full' as CameraSyncMode,
    layout: 'quad' as ViewportLayoutType,
    icon: 'link',
  },
] as const;

const PERFORMANCE_TARGETS = {
  syncLatency: { good: 16, acceptable: 33, poor: 100 }, // milliseconds
  updatesPerSecond: { good: 60, acceptable: 30, poor: 15 },
  frameTime: { good: 16.7, acceptable: 33.3, poor: 66.7 }, // milliseconds
};

export const CameraSyncDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>({
    layout: 'quad',
    syncMode: 'none',
    activeDemo: null,
    performance: {
      syncLatency: 0,
      updatesPerSecond: 0,
      averageFrameTime: 16.7,
    },
    cameraStates: {},
  });

  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [geometryData] = useState(() => ({
    // Mock geometry data for demonstration
    meshes: [
      { id: 'cube', type: 'box', vertices: 1728, triangles: 2880 },
      { id: 'sphere', type: 'sphere', vertices: 2562, triangles: 5120 },
      { id: 'cylinder', type: 'cylinder', vertices: 1440, triangles: 2880 },
    ],
    totalTriangles: 10880,
    boundingBox: {
      min: [-50, -50, -50],
      max: [50, 50, 50],
    },
  }));

  // Handle demo scenario activation
  const handleDemoActivation = useCallback((demoId: (typeof DEMO_SCENARIOS)[number]['id']) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === demoId);
    if (!scenario) return;

    setDemoState((prev) => ({
      ...prev,
      layout: scenario.layout,
      syncMode: scenario.syncMode,
      activeDemo: demoId,
    }));

    // Simulate performance metrics update
    setTimeout(() => {
      setDemoState((prev) => ({
        ...prev,
        performance: {
          syncLatency: Math.random() * 20 + 5,
          updatesPerSecond: Math.random() * 20 + 50,
          averageFrameTime: Math.random() * 10 + 12,
        },
      }));
    }, 100);
  }, []);

  // Handle camera changes from viewports
  const handleCameraChange = useCallback((viewportId: string, camera: ViewportCameraState) => {
    setDemoState((prev) => ({
      ...prev,
      cameraStates: {
        ...prev.cameraStates,
        [viewportId]: camera,
      },
    }));
  }, []);

  // Handle layout changes
  const handleLayoutChange = useCallback((layoutConfig: any) => {
    setDemoState((prev) => ({
      ...prev,
      layout: layoutConfig.type,
    }));
  }, []);

  // Performance metrics evaluation
  const getPerformanceStatus = (metric: keyof typeof PERFORMANCE_TARGETS, value: number) => {
    const targets = PERFORMANCE_TARGETS[metric];
    if (value <= targets.good) return 'good';
    if (value <= targets.acceptable) return 'acceptable';
    return 'poor';
  };

  const renderDemoControls = () => (
    <Panel
      title="Camera Sync Demonstrations"
      subtitle="Interactive scenarios showcasing professional CAD synchronization"
      variant="floating"
      className="demo-controls-panel"
    >
      <div className="demo-scenarios">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            className={`demo-scenario-card ${demoState.activeDemo === scenario.id ? 'active' : ''}`}
            onClick={() => handleDemoActivation(scenario.id)}
          >
            <div className="scenario-header">
              <div className="scenario-icon">
                <IconButton
                  icon={scenario.icon as any}
                  size="md"
                  variant="ghost"
                  aria-label={scenario.title}
                />
              </div>
              <div className="scenario-info">
                <h3>{scenario.title}</h3>
                <div className="scenario-meta">
                  <span className="sync-mode">{scenario.syncMode}</span>
                  <span className="layout-type">{scenario.layout}</span>
                </div>
              </div>
            </div>
            <p className="scenario-description">{scenario.description}</p>
            {demoState.activeDemo === scenario.id && (
              <div className="scenario-status">
                <div className="status-indicator active">
                  <div className="status-dot"></div>
                  <span>Active Demo</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="demo-actions">
        <button
          className="demo-action-btn reset"
          onClick={() =>
            setDemoState((prev) => ({
              ...prev,
              activeDemo: null,
              syncMode: 'none',
            }))
          }
        >
          <IconButton icon="refresh-cw" size="sm" variant="ghost" aria-label="Reset Demo" />
          Reset Demo
        </button>

        <button
          className="demo-action-btn performance"
          onClick={() => setShowPerformancePanel(!showPerformancePanel)}
        >
          <IconButton icon="activity" size="sm" variant="ghost" aria-label="Performance metrics" />
          Performance
        </button>
      </div>
    </Panel>
  );

  const renderPerformancePanel = () => {
    if (!showPerformancePanel) return null;

    return (
      <Panel
        title="Synchronization Performance"
        subtitle="Real-time metrics and optimization insights"
        variant="floating"
        className="performance-panel"
        headerActions={
          <IconButton
            icon="x"
            size="sm"
            variant="ghost"
            onClick={() => setShowPerformancePanel(false)}
            aria-label="Close performance panel"
          />
        }
      >
        <div className="performance-metrics">
          <div className="metric-group">
            <h4>Sync Performance</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Sync Latency</div>
                <div
                  className={`metric-value ${getPerformanceStatus('syncLatency', demoState.performance.syncLatency)}`}
                >
                  {demoState.performance.syncLatency.toFixed(1)}ms
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Updates/sec</div>
                <div
                  className={`metric-value ${getPerformanceStatus('updatesPerSecond', demoState.performance.updatesPerSecond)}`}
                >
                  {demoState.performance.updatesPerSecond.toFixed(0)}
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Frame Time</div>
                <div
                  className={`metric-value ${getPerformanceStatus('frameTime', demoState.performance.averageFrameTime)}`}
                >
                  {demoState.performance.averageFrameTime.toFixed(1)}ms
                </div>
              </div>
            </div>
          </div>

          <div className="metric-group">
            <h4>Scene Complexity</h4>
            <div className="scene-stats">
              <div className="stat-item">
                <span className="stat-label">Total Triangles:</span>
                <span className="stat-value">{geometryData.totalTriangles.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Viewports:</span>
                <span className="stat-value">{Object.keys(demoState.cameraStates).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sync Mode:</span>
                <span className="stat-value">{demoState.syncMode}</span>
              </div>
            </div>
          </div>

          <div className="metric-group">
            <h4>Performance Targets</h4>
            <div className="targets-info">
              <div className="target-item good">
                <div className="target-indicator"></div>
                <span>Optimal: &lt;16ms latency, &gt;60 FPS</span>
              </div>
              <div className="target-item acceptable">
                <div className="target-indicator"></div>
                <span>Acceptable: &lt;33ms latency, &gt;30 FPS</span>
              </div>
              <div className="target-item poor">
                <div className="target-indicator"></div>
                <span>Poor: &gt;33ms latency, &lt;30 FPS</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    );
  };

  const renderCameraStatesDebug = () => {
    if (Object.keys(demoState.cameraStates).length === 0) return null;

    return (
      <Panel
        title="Camera States Debug"
        subtitle="Real-time camera synchronization data"
        variant="compact"
        className="camera-debug-panel"
        collapsible
      >
        <div className="camera-states">
          {Object.entries(demoState.cameraStates).map(([viewportId, camera]) => (
            <div key={viewportId} className="camera-state-item">
              <div className="camera-id">{viewportId}</div>
              <div className="camera-data">
                <div className="camera-property">
                  <span className="property-label">Position:</span>
                  <span className="property-value">
                    [{camera.position.map((v) => v.toFixed(1)).join(', ')}]
                  </span>
                </div>
                <div className="camera-property">
                  <span className="property-label">Target:</span>
                  <span className="property-value">
                    [{camera.target.map((v) => v.toFixed(1)).join(', ')}]
                  </span>
                </div>
                <div className="camera-property">
                  <span className="property-label">Zoom:</span>
                  <span className="property-value">{camera.zoom.toFixed(2)}</span>
                </div>
                <div className="camera-property">
                  <span className="property-label">Type:</span>
                  <span className="property-value">
                    {camera.isOrthographic ? 'Orthographic' : 'Perspective'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  };

  return (
    <div className="camera-sync-demo">
      <div className="demo-layout">
        <div className="demo-viewport">
          <ViewportLayoutManager
            initialLayout={demoState.layout}
            onLayoutChange={handleLayoutChange}
            onCameraChange={handleCameraChange}
            geometryData={geometryData}
            enableKeyboardShortcuts={true}
            showLayoutControls={true}
            className="demo-viewport-manager"
          />
        </div>

        <div className="demo-sidebar">
          {renderDemoControls()}
          {renderPerformancePanel()}
          {renderCameraStatesDebug()}
        </div>
      </div>

      {demoState.activeDemo && (
        <div className="demo-overlay">
          <div className="demo-info">
            <div className="demo-title">
              Demo: {DEMO_SCENARIOS.find((s) => s.id === demoState.activeDemo)?.title}
            </div>
            <div className="demo-hint">
              Try interacting with the viewports to see camera synchronization in action
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
