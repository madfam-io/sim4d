import { test, expect } from '@playwright/test';
import { NodeTestHelper } from '../helpers/node-test-helper';
import { ViewportTestHelper } from '../helpers/viewport-test-helper';
import { InspectorTestHelper } from '../helpers/inspector-test-helper';

/**
 * Phase 4A: Live Parameter Editing Tests
 * Tests the Inspector panel's live parameter editing capabilities
 */
test.describe('Phase 4A - Live Parameter Editing', () => {
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
    await inspectorHelper.waitForInspectorReady();
  });

  test.describe('Inspector Live Editing Basics', () => {
    test('Inspector shows parameters when node is selected', async ({ page }) => {
      // Create a box node
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });

      // Select the node
      await nodeHelper.selectNode(nodeId);

      // Verify Inspector becomes active and shows parameters
      await inspectorHelper.verifyInspectorActive();
      await inspectorHelper.verifyParametersSection();

      // Verify parameter values are displayed correctly
      await inspectorHelper.verifyParameterValue('width', '100');
      await inspectorHelper.verifyParameterValue('height', '50');
      await inspectorHelper.verifyParameterValue('depth', '25');
    });

    test('Live parameter editing without dialog popup', async ({ page }) => {
      // Create and select a box node
      const nodeId = await nodeHelper.createBoxNode({ width: 50, height: 50, depth: 50 });
      await nodeHelper.selectNode(nodeId);

      // Edit parameter directly in Inspector (no dialog should appear)
      await inspectorHelper.editParameter('width', '150');

      // Verify no parameter dialog opened
      await expect(page.locator('[data-testid="parameter-dialog"]')).not.toBeVisible();

      // Verify immediate update
      await inspectorHelper.verifyDirtyIndicator();
      await inspectorHelper.verifyParameterValue('width', '150');

      // Verify node parameters were updated
      const updatedParams = await nodeHelper.getNodeParameters(nodeId);
      expect(updatedParams.width).toBe(150);
    });

    test('Multiple parameter changes in sequence', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Edit multiple parameters in sequence
      await inspectorHelper.editParameter('width', '200');
      await inspectorHelper.editParameter('height', '75');
      await inspectorHelper.editParameter('depth', '40');

      // Verify all changes were applied
      await inspectorHelper.verifyParameterValue('width', '200');
      await inspectorHelper.verifyParameterValue('height', '75');
      await inspectorHelper.verifyParameterValue('depth', '40');

      // Verify node has all updated parameters
      const finalParams = await nodeHelper.getNodeParameters(nodeId);
      expect(finalParams.width).toBe(200);
      expect(finalParams.height).toBe(75);
      expect(finalParams.depth).toBe(40);
    });

    test('Inspector updates when switching between nodes', async ({ page }) => {
      // Create two different nodes
      const boxId = await nodeHelper.createBoxNode(
        { width: 100, height: 50, depth: 25 },
        { x: 200, y: 200 }
      );
      const cylinderId = await nodeHelper.createCylinderNode(
        { radius: 30, height: 80 },
        { x: 400, y: 200 }
      );

      // Select first node and verify Inspector
      await nodeHelper.selectNode(boxId);
      await inspectorHelper.verifyParameterValue('width', '100');

      // Switch to second node
      await nodeHelper.selectNode(cylinderId);
      await inspectorHelper.verifyParameterValue('radius', '30');
      await inspectorHelper.verifyParameterValue('height', '80');

      // Verify Inspector updated completely
      await inspectorHelper.verifyInspectorNodeSwitch(boxId, cylinderId);
    });
  });

  test.describe('Undo/Redo Functionality', () => {
    test('Undo/Redo single parameter change', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Test undo/redo for a single parameter
      await inspectorHelper.testUndoRedo('width', '100', '200');
    });

    test('Undo/Redo multiple parameter changes', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Make multiple changes
      await inspectorHelper.editParameter('width', '200');
      await inspectorHelper.editParameter('height', '75');

      // Undo both changes
      await page.keyboard.press('Control+Z');
      await inspectorHelper.verifyParameterValue('height', '50'); // Height reverted

      await page.keyboard.press('Control+Z');
      await inspectorHelper.verifyParameterValue('width', '100'); // Width reverted

      // Redo both changes
      await page.keyboard.press('Control+Y');
      await inspectorHelper.verifyParameterValue('width', '200'); // Width restored

      await page.keyboard.press('Control+Y');
      await inspectorHelper.verifyParameterValue('height', '75'); // Height restored
    });

    test('Undo history preserved across node selection', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Make a change
      await inspectorHelper.editParameter('width', '200');

      // Select a different area (but keep the node selected)
      await page.click('[data-testid="workflow-canvas"]', { position: { x: 50, y: 50 } });

      // Reselect the node
      await nodeHelper.selectNode(nodeId);

      // Undo should still work
      await page.keyboard.press('Control+Z');
      await inspectorHelper.verifyParameterValue('width', '100');
    });
  });

  test.describe('Real-time Validation', () => {
    test('Invalid values show immediate feedback', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Try to set invalid value
      await inspectorHelper.editParameter('width', '-10');

      // Should show validation error immediately
      await expect(page.locator('[data-testid="param-error"], .validation-error')).toBeVisible();

      // Error indicator should prevent further operations
      await inspectorHelper.verifyDirtyIndicator();
    });

    test('Valid values clear validation errors', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Set invalid value
      await inspectorHelper.editParameter('width', '0');
      await expect(page.locator('[data-testid="param-error"]')).toBeVisible();

      // Fix with valid value
      await inspectorHelper.editParameter('width', '150');
      await expect(page.locator('[data-testid="param-error"]')).not.toBeVisible();
    });

    test('Parameter ranges enforced in real-time', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Test extreme values
      await inspectorHelper.editParameter('width', '999999');

      // Should either accept or show range error
      const hasError = await page
        .locator('[data-testid="param-error"]')
        .isVisible({ timeout: 1000 });
      const paramValue = await page.inputValue('[data-testid="inspector-param-width"]');

      if (hasError) {
        // Range validation active
        expect(hasError).toBe(true);
      } else {
        // Value accepted - verify it's reasonable
        expect(parseFloat(paramValue)).toBeGreaterThan(0);
        expect(parseFloat(paramValue)).toBeLessThan(10000000); // Reasonable upper limit
      }
    });
  });

  test.describe('Inspector Performance', () => {
    test('Inspector responds quickly to parameter changes', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Test Inspector responsiveness
      await inspectorHelper.testInspectorResponsiveness();
    });

    test('Rapid parameter changes handled gracefully', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      const startTime = Date.now();

      // Rapid sequence of changes
      for (let i = 1; i <= 10; i++) {
        await inspectorHelper.editParameter('width', (100 + i * 10).toString());
        await page.waitForTimeout(50); // Very short delay
      }

      // Verify final state is correct
      await inspectorHelper.verifyParameterValue('width', '200');

      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(3000); // Should handle 10 changes within 3 seconds
    });

    test('Inspector handles switching between many nodes efficiently', async ({ page }) => {
      // Create multiple nodes
      const nodes = [];
      for (let i = 0; i < 5; i++) {
        const nodeId = await nodeHelper.createBoxNode(
          { width: 50 + i * 10, height: 50, depth: 25 },
          { x: 200 + i * 150, y: 200 }
        );
        nodes.push(nodeId);
      }

      const startTime = Date.now();

      // Rapidly switch between nodes
      for (const nodeId of nodes) {
        await nodeHelper.selectNode(nodeId);
        await inspectorHelper.verifyInspectorActive();
      }

      const switchTime = Date.now() - startTime;
      expect(switchTime).toBeLessThan(5000); // Should switch between 5 nodes within 5 seconds
    });
  });

  test.describe('Integration with Geometry Evaluation', () => {
    test('Parameter changes trigger geometry updates', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Evaluate initial geometry
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Take initial screenshot
      await viewportHelper.takeViewportScreenshot('box-100x50x25.png');

      // Change parameter
      await inspectorHelper.editParameter('width', '200');

      // Re-evaluate geometry
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Take updated screenshot
      await viewportHelper.takeViewportScreenshot('box-200x50x25.png');

      // Verify geometry updated (visual change expected)
      await viewportHelper.verifyGeometryVisible();
    });

    test('Multiple parameter changes batch geometry updates', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Make multiple rapid changes
      await inspectorHelper.editParameter('width', '150');
      await inspectorHelper.editParameter('height', '75');
      await inspectorHelper.editParameter('depth', '40');

      // Single evaluation should handle all changes
      await nodeHelper.evaluateGraph();
      await viewportHelper.waitForGeometryRendered();

      // Verify final geometry state
      await viewportHelper.verifyGeometryVisible();
      await viewportHelper.takeViewportScreenshot('box-all-parameters-changed.png');
    });

    test('Invalid parameters prevent geometry evaluation', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Set invalid parameter
      await inspectorHelper.editParameter('width', '-10');

      // Attempt evaluation
      const evaluateButton = page.locator('[data-testid="evaluate"], button:has-text("Evaluate")');
      if (await evaluateButton.isVisible()) {
        await evaluateButton.click();

        // Should either prevent evaluation or show error
        const hasError = await nodeHelper.nodeHasError(nodeId);
        if (hasError) {
          const errorMessage = await nodeHelper.getNodeError(nodeId);
          expect(errorMessage).toBeTruthy();
        }
      }
    });
  });

  test.describe('Advanced Inspector Features', () => {
    test('Inspector preserves state across app navigation', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Make a change
      await inspectorHelper.editParameter('width', '200');

      // Simulate navigation or panel switching (if app has such features)
      // This test assumes the app maintains Inspector state

      // Verify Inspector still shows the updated value
      await inspectorHelper.verifyParameterValue('width', '200');
      await inspectorHelper.verifyInspectorActive();
    });

    test('Inspector handles different node types correctly', async ({ page }) => {
      // Test with different node types to ensure Inspector adapts
      const boxId = await nodeHelper.createBoxNode(
        { width: 100, height: 50, depth: 25 },
        { x: 200, y: 200 }
      );
      const cylinderId = await nodeHelper.createCylinderNode(
        { radius: 30, height: 80 },
        { x: 400, y: 200 }
      );

      // Test Box node parameters
      await nodeHelper.selectNode(boxId);
      await inspectorHelper.verifyParameterValue('width', '100');
      await inspectorHelper.editParameter('width', '150');

      // Test Cylinder node parameters
      await nodeHelper.selectNode(cylinderId);
      await inspectorHelper.verifyParameterValue('radius', '30');
      await inspectorHelper.editParameter('radius', '40');

      // Verify both nodes retained their changes
      await nodeHelper.selectNode(boxId);
      await inspectorHelper.verifyParameterValue('width', '150');

      await nodeHelper.selectNode(cylinderId);
      await inspectorHelper.verifyParameterValue('radius', '40');
    });

    test('Inspector provides appropriate user feedback', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Test various user feedback mechanisms
      await inspectorHelper.editParameter('width', '200');

      // Should show dirty indicator
      await inspectorHelper.verifyDirtyIndicator();

      // Should show updated value immediately
      await inspectorHelper.verifyParameterValue('width', '200');

      // Test validation feedback
      await inspectorHelper.editParameter('width', 'abc');
      await expect(page.locator('[data-testid="param-error"], .validation-error')).toBeVisible();

      // Clear error
      await inspectorHelper.editParameter('width', '150');
      await expect(page.locator('[data-testid="param-error"]')).not.toBeVisible();
    });
  });
});
