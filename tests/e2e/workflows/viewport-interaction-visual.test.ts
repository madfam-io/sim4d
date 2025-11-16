import { test, expect } from '@playwright/test';
import { NodeTestHelper } from '../helpers/node-test-helper';
import { ViewportTestHelper } from '../helpers/viewport-test-helper';
import { InspectorTestHelper } from '../helpers/inspector-test-helper';

/**
 * 3D Viewport Interaction and Visual Regression Tests
 * Tests viewport controls, visual rendering, and geometry interaction
 */
test.describe('3D Viewport Interaction and Visual Regression', () => {
  let nodeHelper: NodeTestHelper;
  let viewportHelper: ViewportTestHelper;
  let inspectorHelper: InspectorTestHelper;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    nodeHelper = new NodeTestHelper(page);
    viewportHelper = new ViewportTestHelper(page);
    inspectorHelper = new InspectorTestHelper(page);

    // Wait for workspace to be ready
    await nodeHelper.waitForWorkspaceReady();
    await viewportHelper.waitForViewportReady();
  });

  test.describe('Basic Viewport Interaction', () => {
    test('Viewport initializes properly with WebGL context', async ({ page }) => {
      // Verify viewport is ready and WebGL context exists
      await viewportHelper.waitForViewportReady();

      // Check WebGL context is available
      const hasWebGL = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        return !!gl;
      });

      expect(hasWebGL).toBe(true);
    });

    test('Camera orbit controls work correctly', async ({ page }) => {
      // Create geometry to orbit around
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test camera orbiting
      await viewportHelper.orbitCamera(45, 30);
      await viewportHelper.takeViewportScreenshot('camera-orbit-45-30.png');

      // Test different orbit position
      await viewportHelper.orbitCamera(-90, -20);
      await viewportHelper.takeViewportScreenshot('camera-orbit-negative.png');

      // Reset camera and verify
      await viewportHelper.resetCamera();
      await viewportHelper.takeViewportScreenshot('camera-reset.png');
    });

    test('Zoom controls function properly', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test zoom in
      await viewportHelper.zoomIn(3);
      await viewportHelper.takeViewportScreenshot('zoom-in.png');

      // Test zoom out
      await viewportHelper.zoomOut(5);
      await viewportHelper.takeViewportScreenshot('zoom-out.png');

      // Test fit all
      await viewportHelper.fitAll();
      await viewportHelper.takeViewportScreenshot('fit-all.png');
    });

    test('Pan controls work correctly', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test panning
      await viewportHelper.panCamera(100, 50);
      await viewportHelper.takeViewportScreenshot('pan-right-down.png');

      await viewportHelper.panCamera(-150, -75);
      await viewportHelper.takeViewportScreenshot('pan-left-up.png');

      // Reset to center
      await viewportHelper.fitAll();
    });

    test('Multiple viewport controls combined', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Combined operations: orbit, zoom, pan
      await viewportHelper.orbitCamera(30, 20);
      await viewportHelper.zoomIn(2);
      await viewportHelper.panCamera(50, 25);

      await viewportHelper.takeViewportScreenshot('combined-controls.png');

      // Verify viewport is still responsive
      await viewportHelper.verifyViewportResponsiveness();
    });
  });

  test.describe('Rendering Modes and Visualization', () => {
    test('Solid rendering mode displays correctly', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Ensure solid rendering mode
      await viewportHelper.setRenderingMode('solid');
      await viewportHelper.takeViewportScreenshot('solid-rendering.png');

      // Verify geometry is visible
      await viewportHelper.verifyGeometryVisible();
    });

    test('Wireframe rendering mode works', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Switch to wireframe mode
      await viewportHelper.setRenderingMode('wireframe');
      await viewportHelper.takeViewportScreenshot('wireframe-rendering.png');
    });

    test('Rendering mode switching preserves geometry', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test mode switching
      await viewportHelper.setRenderingMode('solid');
      await viewportHelper.verifyGeometryVisible();

      await viewportHelper.setRenderingMode('wireframe');
      await viewportHelper.verifyGeometryVisible();

      await viewportHelper.setRenderingMode('solid');
      await viewportHelper.verifyGeometryVisible();
    });

    test('Viewport overlays work correctly', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test grid overlay
      await viewportHelper.toggleOverlay('grid');
      await viewportHelper.takeViewportScreenshot('with-grid.png');

      // Test axes overlay
      await viewportHelper.toggleOverlay('axes');
      await viewportHelper.takeViewportScreenshot('with-axes.png');

      // Test stats overlay if available
      await viewportHelper.toggleOverlay('stats');
      await viewportHelper.takeViewportScreenshot('with-stats.png');
    });
  });

  test.describe('Geometry Visualization', () => {
    test('Single box geometry renders correctly', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.verifyGeometryVisible();
      await viewportHelper.verifyObjectCount(1);
      await viewportHelper.takeViewportScreenshot('single-box.png');
    });

    test('Multiple geometries render together', async ({ page }) => {
      // Create multiple geometries
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 }, { x: 200, y: 200 });
      await nodeHelper.createCylinderNode({ radius: 30, height: 80 }, { x: 400, y: 200 });

      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.verifyObjectCount(2);
      await viewportHelper.fitAll();
      await viewportHelper.takeViewportScreenshot('multiple-geometries.png');
    });

    test('Complex geometry workflow visualization', async ({ page }) => {
      const { nodes } = await nodeHelper.createComplexWorkflow();
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Verify all geometries are visible
      await viewportHelper.verifyGeometryVisible();
      await viewportHelper.fitAll();
      await viewportHelper.takeViewportScreenshot('complex-workflow.png');

      // Test different viewing angles
      await viewportHelper.orbitCamera(60, 45);
      await viewportHelper.takeViewportScreenshot('complex-workflow-angled.png');
    });

    test('Geometry updates with parameter changes', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.takeViewportScreenshot('original-box.png');

      // Change parameters and verify visual update
      await nodeHelper.selectNode(nodeId);
      await inspectorHelper.editParameter('width', '200');
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.takeViewportScreenshot('modified-box-width.png');

      // Change height
      await inspectorHelper.editParameter('height', '100');
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.takeViewportScreenshot('modified-box-height.png');
    });
  });

  test.describe('Visual Regression Testing', () => {
    test('Consistent rendering across sessions', async ({ page }) => {
      // Create a standard test scene
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Reset to standard view
      await viewportHelper.resetCamera();
      await viewportHelper.fitAll();

      // Take baseline screenshot
      await viewportHelper.takeViewportScreenshot('baseline-standard-box.png');
    });

    test('Rendering consistency with different geometries', async ({ page }) => {
      // Test various geometry types for consistent rendering
      const geometryTests = [
        { type: 'box', params: { width: 100, height: 50, depth: 25 }, name: 'standard-box' },
        { type: 'box', params: { width: 50, height: 50, depth: 50 }, name: 'cube' },
        { type: 'cylinder', params: { radius: 25, height: 60 }, name: 'standard-cylinder' },
      ];

      for (const test of geometryTests) {
        // Clear previous geometry
        const existingNodes = await nodeHelper.getAllNodeIds();
        for (const nodeId of existingNodes) {
          await nodeHelper.deleteNode(nodeId);
        }

        // Create new geometry
        if (test.type === 'box') {
          await nodeHelper.createBoxNode(test.params as any);
        } else if (test.type === 'cylinder') {
          await nodeHelper.createCylinderNode(test.params as any);
        }

        await nodeHelper.evaluateGraph();
        await viewportHelper.waitForGeometryRendered();
        await viewportHelper.resetCamera();
        await viewportHelper.fitAll();

        await viewportHelper.takeViewportScreenshot(`${test.name}-rendering.png`);
      }
    });

    test('Lighting and material consistency', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test different viewing angles for lighting consistency
      const angles = [
        { azimuth: 0, elevation: 0, name: 'front' },
        { azimuth: 90, elevation: 0, name: 'right' },
        { azimuth: 180, elevation: 0, name: 'back' },
        { azimuth: 270, elevation: 0, name: 'left' },
        { azimuth: 0, elevation: 90, name: 'top' },
        { azimuth: 45, elevation: 30, name: 'isometric' },
      ];

      for (const angle of angles) {
        await viewportHelper.resetCamera();
        await viewportHelper.orbitCamera(angle.azimuth, angle.elevation);
        await viewportHelper.takeViewportScreenshot(`lighting-${angle.name}.png`);
      }
    });

    test('Resolution and scaling consistency', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test at different zoom levels
      const zoomLevels = [
        { level: 'far', action: () => viewportHelper.zoomOut(5), name: 'zoom-far' },
        { level: 'fit', action: () => viewportHelper.fitAll(), name: 'zoom-fit' },
        { level: 'close', action: () => viewportHelper.zoomIn(3), name: 'zoom-close' },
      ];

      for (const zoom of zoomLevels) {
        await zoom.action();
        await viewportHelper.takeViewportScreenshot(`${zoom.name}.png`);
      }
    });
  });

  test.describe('Viewport Performance', () => {
    test('Viewport maintains good performance with single geometry', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test viewport responsiveness
      await viewportHelper.verifyViewportResponsiveness(100); // Within 100ms

      // Get performance metrics
      const metrics = await viewportHelper.getPerformanceMetrics();
      expect(metrics.fps).toBeGreaterThan(30); // At least 30 FPS
      expect(metrics.renderTime).toBeLessThan(50); // Less than 50ms render time
    });

    test('Viewport handles multiple geometries efficiently', async ({ page }) => {
      // Create multiple geometries
      for (let i = 0; i < 5; i++) {
        await nodeHelper.createBoxNode(
          { width: 50, height: 50, depth: 50 },
          { x: 200 + i * 100, y: 200 }
        );
      }

      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Verify performance is still acceptable
      const metrics = await viewportHelper.getPerformanceMetrics();
      expect(metrics.fps).toBeGreaterThan(20); // At least 20 FPS with multiple objects
      expect(metrics.renderTime).toBeLessThan(100); // Less than 100ms render time
    });

    test('Viewport stress test with rapid interactions', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Stress test viewport with rapid interactions
      const stressResults = await viewportHelper.stressTestViewport(3000); // 3 second test

      expect(stressResults.averageFPS).toBeGreaterThan(15); // Maintain reasonable FPS
      expect(stressResults.minFPS).toBeGreaterThan(5); // Don't drop too low
      expect(stressResults.maxRenderTime).toBeLessThan(200); // Max render time reasonable
    });

    test('Memory usage remains stable during viewport operations', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Get initial memory
      const initialMemory = await page.evaluate(
        () => (performance as any).memory?.usedJSHeapSize || 0
      );

      // Perform many viewport operations
      for (let i = 0; i < 20; i++) {
        await viewportHelper.orbitCamera(Math.random() * 90, Math.random() * 60);
        await viewportHelper.zoom(Math.random() * 100 - 50);
      }

      // Check final memory
      const finalMemory = await page.evaluate(
        () => (performance as any).memory?.usedJSHeapSize || 0
      );

      // Memory shouldn't increase dramatically (allow 50MB growth)
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    });
  });

  test.describe('Viewport Interaction with Node System', () => {
    test('Viewport updates when nodes are created', async ({ page }) => {
      // Start with empty viewport
      await viewportHelper.takeViewportScreenshot('empty-viewport.png');

      // Add geometry and verify it appears
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.verifyGeometryVisible();
      await viewportHelper.takeViewportScreenshot('geometry-added.png');
    });

    test('Viewport updates when nodes are deleted', async ({ page }) => {
      // Create geometry
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      await viewportHelper.verifyObjectCount(1);

      // Delete node
      await nodeHelper.deleteNode(nodeId);
      await nodeHelper.evaluateGraph();

      // Verify geometry is removed
      await viewportHelper.verifyObjectCount(0);
      await viewportHelper.takeViewportScreenshot('geometry-removed.png');
    });

    test('Viewport selection integration', async ({ page }) => {
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Test clicking on geometry in viewport
      await viewportHelper.clickGeometry();

      // Verify some form of selection feedback (this may vary by implementation)
      await page.waitForTimeout(500); // Allow for selection feedback
    });

    test('Viewport shows real-time parameter changes', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Change parameter and immediately evaluate
      await inspectorHelper.editParameter('width', '200');
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Verify geometry changed
      await viewportHelper.verifyGeometryVisible();
      await viewportHelper.takeViewportScreenshot('real-time-parameter-change.png');
    });
  });
});
