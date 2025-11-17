import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useGraphStore } from '../store/graph-store';
import { Icon } from './icons/IconSystem';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'Viewport' });
// import { MeasurementTools, type Measurement } from './viewport/MeasurementTools';

// Temporary type definition for measurements
type Measurement = {
  id: string;
  type: 'distance' | 'angle' | 'radius';
  value: number;
  unit: string;
};
import type { MeshData, ShapeHandle } from '@brepflow/types';

export function Viewport() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const geometryGroupRef = useRef<THREE.Group | null>(null);
  const { graph, dagEngine } = useGraphStore();

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [showMeasurementTools, setShowMeasurementTools] = useState(false);

  // Measurement handlers
  const handleMeasurementCreate = useCallback((measurement: Measurement) => {
    setMeasurements((prev) => [...prev, measurement]);
  }, []);

  const handleMeasurementUpdate = useCallback((measurement: Measurement) => {
    setMeasurements((prev) => prev.map((m) => (m.id === measurement.id ? measurement : m)));
  }, []);

  const handleMeasurementDelete = useCallback((measurementId: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
  }, []);

  // Create Three.js mesh from tessellated geometry
  const createMeshFromTessellation = useCallback(
    (meshData: MeshData, nodeId: string): THREE.Mesh => {
      const geometry = new THREE.BufferGeometry();

      // Set vertex positions
      geometry.setAttribute('position', new THREE.BufferAttribute(meshData.positions, 3));

      // Set normals if available
      if (meshData.normals) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.normals, 3));
      } else {
        geometry.computeVertexNormals();
      }

      // Set indices for faces
      if (meshData.indices) {
        geometry.setIndex(new THREE.BufferAttribute(meshData.indices, 1));
      }

      // Create material with node-specific color
      const hue = Math.abs(nodeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360;
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(hue / 360, 0.7, 0.6),
        opacity: 0.8,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { nodeId, type: 'geometry' };

      return mesh;
    },
    []
  );

  // Create simple geometry based on node type (mock implementation)
  const createSimpleGeometry = useCallback((node: any): THREE.Mesh | null => {
    const type = node.type.split('::')[1]?.toLowerCase();
    let geometry: THREE.BufferGeometry | null = null;

    switch (type) {
      case 'box':
        const width = node.params?.width || 100;
        const height = node.params?.height || 100;
        const depth = node.params?.depth || 100;
        geometry = new THREE.BoxGeometry(width, height, depth);
        break;

      case 'cylinder':
        const radius = node.params?.radius || 50;
        const cylHeight = node.params?.height || 100;
        geometry = new THREE.CylinderGeometry(radius, radius, cylHeight, 32);
        break;

      case 'sphere':
        const sphereRadius = node.params?.radius || 50;
        geometry = new THREE.SphereGeometry(sphereRadius, 32, 16);
        break;

      case 'union':
      case 'subtract':
      case 'intersect':
        // For Boolean operations, create a placeholder mesh
        // In a real implementation, this would compute the actual Boolean result
        geometry = new THREE.BoxGeometry(80, 80, 80);
        break;

      default:
        return null;
    }

    if (!geometry) return null;

    // Create material with node-specific color
    const hue =
      Math.abs(node.id.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % 360;
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(hue / 360, 0.7, 0.6),
      opacity: 0.9,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { nodeId: node.id, type: 'geometry' };

    // Position based on node position in graph (scaled down)
    if (node.position) {
      mesh.position.x = (node.position.x - 400) * 0.2;
      mesh.position.z = (node.position.y - 300) * 0.2;
    }

    return mesh;
  }, []);

  // Update 3D scene with current graph geometry
  const updateSceneGeometry = useCallback(async () => {
    if (!geometryGroupRef.current) return;

    // Clear existing geometry
    geometryGroupRef.current.clear();

    // Process all nodes with shape outputs
    const geometryNodes = graph.nodes.filter((node) => {
      // Check if node has a shape output with a value
      return node.outputs?.shape?.value || node.outputs?.geometry?.value;
    });

    // If no real geometry yet, fall back to simple visualization for testing
    if (geometryNodes.length === 0) {
      const displayNodes = graph.nodes.filter(
        (node) => node.type.startsWith('Solid::') || node.type.startsWith('Boolean::')
      );

      for (const node of displayNodes) {
        const mesh = createSimpleGeometry(node);
        if (mesh) {
          geometryGroupRef.current.add(mesh);
        }
      }
    } else {
      // Use real tessellation for nodes with shape outputs
      for (const node of geometryNodes) {
        try {
          const shapeHandle = (node.outputs?.shape?.value ||
            node.outputs?.geometry?.value) as ShapeHandle;
          if (!shapeHandle || !shapeHandle.id || !dagEngine) continue;

          // Tessellate the shape with better quality using WASM invoke interface
          const meshData = await dagEngine.geometryAPI.invoke('TESSELLATE', {
            shape: shapeHandle,
            deflection: 0.01,
          });

          // Create Three.js mesh
          const mesh = createMeshFromTessellation(meshData, node.id);
          geometryGroupRef.current.add(mesh);
        } catch (error) {
          logger.warn('Failed to tessellate geometry, falling back to simple geometry', {
            nodeId: node.id,
            nodeType: node.type,
            error: error instanceof Error ? error.message : String(error),
          });
          // Fall back to simple geometry on error
          const mesh = createSimpleGeometry(node);
          if (mesh) {
            geometryGroupRef.current.add(mesh);
          }
        }
      }
    }

    // Fit view to show all geometry
    if (geometryGroupRef.current.children.length > 0) {
      const box = new THREE.Box3().setFromObject(geometryGroupRef.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Position camera to see all geometry
      const camera = sceneRef.current?.userData?.camera;
      if (camera) {
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim);
        camera.lookAt(center);
      }
    }
  }, [graph.nodes, dagEngine, createMeshFromTessellation, createSimpleGeometry]);

  useEffect(() => {
    if (!mountRef.current) return;

    const initializeViewport = () => {
      const container = mountRef.current;
      if (!container) return;

      // Validate container has proper dimensions before proceeding
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) {
        // Container not ready, try again on next frame
        requestAnimationFrame(initializeViewport);
        return;
      }

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1e1e1e);
      sceneRef.current = scene;

      // Camera setup with validated dimensions
      const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 10000);
      camera.position.set(100, 100, 100);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup with validated dimensions
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera as any, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Grid
      const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
      scene.add(gridHelper);

      // Axes
      const axesHelper = new THREE.AxesHelper(50);
      scene.add(axesHelper);

      // Geometry group for CAD objects
      const geometryGroup = new THREE.Group();
      geometryGroup.name = 'geometry';
      scene.add(geometryGroup);
      geometryGroupRef.current = geometryGroup;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight.position.set(100, 100, 50);
      scene.add(directionalLight);

      // Store camera reference for geometry fitting
      scene.userData.camera = camera;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Enhanced resize handling with ResizeObserver
      const handleResize = (width: number, height: number) => {
        if (width > 0 && height > 0 && camera && renderer) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      };

      // Use ResizeObserver for container resize detection
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          handleResize(width, height);
        }
      });

      if (container) {
        resizeObserver.observe(container);
      }

      // Fallback window resize handler
      const handleWindowResize = () => {
        if (container) {
          handleResize(container.clientWidth, container.clientHeight);
        }
      };
      window.addEventListener('resize', handleWindowResize);

      // Cleanup function
      const cleanup = () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleWindowResize);
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        controls.dispose();
      };

      // Store cleanup function for access in outer scope
      sceneRef.current.userData.cleanup = cleanup;
    };

    // Start initialization with delay to ensure layout is ready
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(initializeViewport);
    }, 0);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (sceneRef.current?.userData?.cleanup) {
        sceneRef.current.userData.cleanup();
      }
    };
  }, []);

  // Update scene geometry when graph changes
  useEffect(() => {
    updateSceneGeometry();
  }, [updateSceneGeometry]);

  return (
    <div className="viewport" ref={mountRef}>
      {/* Compact Toolbar with Professional Layout */}
      <div className="viewport-toolbar">
        <div className="toolbar-group display-controls">
          <button className="toolbar-btn compact" title="Shaded (S)">
            <Icon name="shaded" size={14} />
          </button>
          <button className="toolbar-btn compact" title="Wireframe (W)">
            <Icon name="wireframe" size={14} />
          </button>
          <button className="toolbar-btn compact" title="X-Ray (X)">
            <Icon name="xray" size={14} />
          </button>
          <button className="toolbar-btn compact" title="Section (Alt+S)">
            <Icon name="section" size={14} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group navigation-controls">
          <button className="toolbar-btn compact" title="Fit View (F)">
            <Icon name="fit-view" size={14} />
          </button>
          <button className="toolbar-btn compact" title="Zoom Selection (Z)">
            <Icon name="zoom" size={14} />
          </button>
          <button className="toolbar-btn compact" title="Hide Selected (H)">
            <Icon name="hide" size={14} />
          </button>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group tools-controls">
          <button
            className={`toolbar-btn compact ${showMeasurementTools ? 'active' : ''}`}
            onClick={() => setShowMeasurementTools(!showMeasurementTools)}
            title="Measurement Tools (M)"
          >
            <Icon name="settings" size={14} />
          </button>
        </div>

        <div className="toolbar-spacer" />

        {/* Compact Status Indicators */}
        <div className="viewport-status">
          <div className="status-indicator">
            <span className="status-label">Triangles:</span>
            <span className="status-value">12.5K</span>
          </div>
          <div className="status-indicator">
            <span className="status-label">FPS:</span>
            <span className="status-value">60</span>
          </div>
        </div>
      </div>

      {/* Coordinate Display - Bottom Right */}
      <div className="coordinate-display">
        <div className="coordinate-item">
          <span className="coord-label">X:</span>
          <span className="coord-value">0.00</span>
        </div>
        <div className="coordinate-item">
          <span className="coord-label">Y:</span>
          <span className="coord-value">0.00</span>
        </div>
        <div className="coordinate-item">
          <span className="coord-label">Z:</span>
          <span className="coord-value">0.00</span>
        </div>
      </div>

      {/* Navigation Cube - Top Right */}
      <div className="navigation-cube">
        <div className="cube-face front" title="Front View (1)">
          F
        </div>
        <div className="cube-face back" title="Back View (Ctrl+1)">
          B
        </div>
        <div className="cube-face top" title="Top View (7)">
          T
        </div>
        <div className="cube-face bottom" title="Bottom View (Ctrl+7)">
          ⊥
        </div>
        <div className="cube-face left" title="Left View (3)">
          L
        </div>
        <div className="cube-face right" title="Right View (Ctrl+3)">
          R
        </div>
        <div className="cube-center" title="Isometric View (0)">
          ISO
        </div>
      </div>

      {/* Compact Grid/Scale Indicator */}
      <div className="scale-indicator">
        <div className="scale-bar">
          <div className="scale-tick" />
          <span className="scale-label">10mm</span>
          <div className="scale-tick" />
        </div>
        <div className="grid-info">
          <span className="grid-size">Grid: 1mm</span>
        </div>
      </div>

      {/* Measurement Tools Panel - Compact */}
      {showMeasurementTools && (
        <div className="measurement-panel compact">
          <div className="panel-header compact">
            <h4 className="panel-title">Measure</h4>
            <button
              className="close-btn"
              onClick={() => setShowMeasurementTools(false)}
              title="Close"
            >
              ×
            </button>
          </div>
          <div className="measurement-tools">
            <button className="tool-btn" title="Distance">
              <Icon name="line" size={12} />
              <span>Distance</span>
            </button>
            <button className="tool-btn" title="Angle">
              <Icon name="rotate" size={12} />
              <span>Angle</span>
            </button>
            <button className="tool-btn" title="Radius">
              <Icon name="sphere" size={12} />
              <span>Radius</span>
            </button>
          </div>

          {/* Active Measurements List */}
          {measurements.length > 0 && (
            <div className="measurements-list">
              <div className="list-header">Active Measurements</div>
              {measurements.slice(0, 3).map((measurement) => (
                <div key={measurement.id} className="measurement-item">
                  <span className="measurement-type">{measurement.type}</span>
                  <span className="measurement-value">
                    {measurement.value.toFixed(2)} {measurement.unit}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={() => handleMeasurementDelete(measurement.id)}
                    title="Delete measurement"
                  >
                    ×
                  </button>
                </div>
              ))}
              {measurements.length > 3 && (
                <div className="more-measurements">+{measurements.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selection Info Panel - Bottom Left */}
      <div className="selection-info">
        <div className="info-item">
          <span className="info-label">Selected:</span>
          <span className="info-value">None</span>
        </div>
      </div>

      {/* Performance Monitor - Top Left (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-monitor">
          <div className="perf-item">
            <span className="perf-label">GPU:</span>
            <span className="perf-value">98%</span>
          </div>
          <div className="perf-item">
            <span className="perf-label">Memory:</span>
            <span className="perf-value">245MB</span>
          </div>
        </div>
      )}
    </div>
  );
}
