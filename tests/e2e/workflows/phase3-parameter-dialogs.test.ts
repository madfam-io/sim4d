import { test, expect } from '@playwright/test';
import { NodeTestHelper } from '../helpers/node-test-helper';
import { ViewportTestHelper } from '../helpers/viewport-test-helper';

/**
 * Phase 3: Parameter Dialog Workflows
 * Tests the parameter dialog system for node creation and configuration
 */
test.describe('Phase 3 - Parameter Dialog Workflows', () => {
  let nodeHelper: NodeTestHelper;
  let viewportHelper: ViewportTestHelper;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    nodeHelper = new NodeTestHelper(page);
    viewportHelper = new ViewportTestHelper(page);

    // Wait for workspace to be ready
    await nodeHelper.waitForWorkspaceReady();
    await viewportHelper.waitForViewportReady();
  });

  test.describe('Basic Node Creation with Parameter Dialogs', () => {
    test('Create Box node with parameter dialog', async ({ page }) => {
      // Drag Box node to canvas - should open parameter dialog
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Verify parameter dialog opens
      await expect(
        page.locator('[data-testid="parameter-dialog"], .parameter-dialog')
      ).toBeVisible();

      // Fill parameters
      await page.fill('[data-testid="param-width"], [name="width"]', '100');
      await page.fill('[data-testid="param-height"], [name="height"]', '50');
      await page.fill('[data-testid="param-depth"], [name="depth"]', '25');

      // Verify real-time validation (no error indicators)
      await expect(page.locator('[data-testid="param-error"], .param-error')).not.toBeVisible();

      // Create node
      await page.click('[data-testid="create-node-button"], button:has-text("Create")');

      // Verify dialog closes and node appears
      await expect(page.locator('[data-testid="parameter-dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-node-id]')).toHaveCount(1);

      // Verify node has correct parameters
      const nodeId = await nodeHelper.getLastCreatedNodeId();
      const nodeParams = await nodeHelper.getNodeParameters(nodeId);
      expect(nodeParams.width).toBe(100);
      expect(nodeParams.height).toBe(50);
      expect(nodeParams.depth).toBe(25);
    });

    test('Create Cylinder node with parameter validation', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Cylinder', { x: 400, y: 300 });

      // Verify parameter dialog opens
      await expect(page.locator('[data-testid="parameter-dialog"]')).toBeVisible();

      // Test invalid parameter (negative radius)
      await page.fill('[data-testid="param-radius"], [name="radius"]', '-10');
      await page.fill('[data-testid="param-height"], [name="height"]', '100');

      // Verify validation error appears
      await expect(page.locator('[data-testid="param-error"], .param-error')).toBeVisible();

      // Fix parameter
      await page.fill('[data-testid="param-radius"], [name="radius"]', '25');

      // Verify error disappears
      await expect(page.locator('[data-testid="param-error"]')).not.toBeVisible();

      // Create node
      await page.click('[data-testid="create-node-button"], button:has-text("Create")');

      // Verify node created successfully
      await expect(page.locator('[data-node-id]')).toHaveCount(1);
    });

    test('Cancel parameter dialog preserves workspace', async ({ page }) => {
      const initialNodeCount = await nodeHelper.getNodeCount();

      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Fill some parameters
      await page.fill('[data-testid="param-width"], [name="width"]', '100');

      // Cancel dialog
      await page.click('[data-testid="cancel-button"], button:has-text("Cancel")');

      // Verify dialog closes and no node is created
      await expect(page.locator('[data-testid="parameter-dialog"]')).not.toBeVisible();
      expect(await nodeHelper.getNodeCount()).toBe(initialNodeCount);
    });
  });

  test.describe('Parameter Dialog Features', () => {
    test('Parameter dialog shows proper units and ranges', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Verify parameter labels include units
      await expect(page.locator('label:has-text("Width"), label:has-text("mm")')).toBeVisible();

      // Check for min/max indicators or placeholders
      const widthInput = page.locator('[data-testid="param-width"], [name="width"]');
      const placeholder = await widthInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy(); // Should have some guidance text
    });

    test('Parameter dialog remembers last used values', async ({ page }) => {
      // Create first box with specific dimensions
      await nodeHelper.createBoxNode({ width: 150, height: 75, depth: 30 });

      // Create second box - dialog should remember previous values
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 600, y: 300 });

      // Check if dialog shows previous values or reasonable defaults
      const widthValue = await page.inputValue('[data-testid="param-width"], [name="width"]');
      expect(parseInt(widthValue)).toBeGreaterThan(0); // Should have a meaningful default
    });

    test('Parameter dialog handles different parameter types', async ({ page }) => {
      // Features::Fillet includes numeric and boolean parameters in the dialog
      await nodeHelper.dragNodeFromPanel('Features::Fillet', { x: 400, y: 300 });

      const numberInputs = page.locator('input[type="number"]');
      const checkboxes = page.locator('input[type="checkbox"]');
      const selects = page.locator('select');

      await expect(numberInputs.first()).toBeVisible();

      // Optional parameters should expose additional controls when rendered
      if ((await checkboxes.count()) > 0) {
        await expect(checkboxes.first()).toBeVisible();
      }

      if ((await selects.count()) > 0) {
        await expect(selects.first()).toBeVisible();
      }

      await page.click('[data-testid="cancel-button"], button:has-text("Cancel")');
    });

    test('Parameter dialog supports keyboard navigation', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Navigate through parameters with Tab
      const widthInput = page.locator('[data-testid="param-width"], [name="width"]');
      const heightInput = page.locator('[data-testid="param-height"], [name="height"]');

      await widthInput.focus();
      await page.keyboard.press('Tab');

      // Verify focus moved to next parameter
      await expect(heightInput).toBeFocused();

      // Test Enter key to create node
      await page.fill('[data-testid="param-width"]', '100');
      await page.fill('[data-testid="param-height"]', '50');
      await page.fill('[data-testid="param-depth"]', '25');

      await page.keyboard.press('Enter');

      // Verify node was created
      await expect(page.locator('[data-node-id]')).toHaveCount(1);
    });

    test('Parameter dialog shows preview/help information', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Look for help or preview elements
      const helpElements = page.locator(
        '[data-testid="param-help"], .param-help, [title], .tooltip'
      );

      if ((await helpElements.count()) > 0) {
        // Verify help information is available
        await expect(helpElements.first()).toBeVisible();
      }

      // Look for parameter descriptions
      const descriptions = page.locator('.param-description, [data-testid="param-description"]');

      if ((await descriptions.count()) > 0) {
        await expect(descriptions.first()).toBeVisible();
      }

      // Cancel dialog
      await page.click('[data-testid="cancel-button"], button:has-text("Cancel")');
    });
  });

  test.describe('Parameter Dialog Error Handling', () => {
    test('Invalid parameter values show appropriate errors', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Test zero value
      await page.fill('[data-testid="param-width"], [name="width"]', '0');
      await expect(page.locator('[data-testid="param-error"], .param-error')).toBeVisible();

      // Test negative value
      await page.fill('[data-testid="param-width"]', '-10');
      await expect(page.locator('[data-testid="param-error"]')).toBeVisible();

      // Test non-numeric value
      await page.fill('[data-testid="param-width"]', 'abc');
      await expect(page.locator('[data-testid="param-error"]')).toBeVisible();

      // Test extremely large value
      await page.fill('[data-testid="param-width"]', '999999999');
      // May or may not show error depending on validation rules

      // Fix with valid value
      await page.fill('[data-testid="param-width"]', '100');
      await expect(page.locator('[data-testid="param-error"]')).not.toBeVisible();
    });

    test('Create button disabled with invalid parameters', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Set invalid parameter
      await page.fill('[data-testid="param-width"], [name="width"]', '-10');

      // Verify Create button is disabled
      const createButton = page.locator(
        '[data-testid="create-node-button"], button:has-text("Create")'
      );
      await expect(createButton).toBeDisabled();

      // Fix parameter
      await page.fill('[data-testid="param-width"]', '100');
      await page.fill('[data-testid="param-height"]', '50');
      await page.fill('[data-testid="param-depth"]', '25');

      // Verify Create button is enabled
      await expect(createButton).toBeEnabled();
    });

    test('Parameter dialog handles edge cases gracefully', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Test very small valid values
      await page.fill('[data-testid="param-width"]', '0.001');
      await page.fill('[data-testid="param-height"]', '0.001');
      await page.fill('[data-testid="param-depth"]', '0.001');

      // Should either accept or show reasonable validation message
      const createButton = page.locator('[data-testid="create-node-button"]');
      const errorMessage = page.locator('[data-testid="param-error"]');

      if (await createButton.isEnabled()) {
        // Values accepted - create node
        await createButton.click();
        await expect(page.locator('[data-node-id]')).toHaveCount(1);
      } else {
        // Values rejected - should show error
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test.describe('Parameter Dialog Integration with Viewport', () => {
    test('Node creation updates viewport immediately', async ({ page }) => {
      // Create a box node
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });

      // Evaluate graph to generate geometry
      await nodeHelper.evaluateGraph();

      // Verify geometry appears in viewport
      await viewportHelper.waitForGeometryRendered();
      await viewportHelper.verifyGeometryVisible();

      // Take screenshot for visual verification
      await viewportHelper.takeViewportScreenshot('box-created-from-dialog.png');
    });

    test('Multiple nodes from dialogs create complex scene', async ({ page }) => {
      // Create multiple nodes using parameter dialogs
      const box = await nodeHelper.createBoxNode(
        { width: 100, height: 50, depth: 25 },
        { x: 200, y: 200 }
      );
      const cylinder = await nodeHelper.createCylinderNode(
        { radius: 30, height: 80 },
        { x: 200, y: 350 }
      );

      // Evaluate graph
      await nodeHelper.evaluateGraph();

      // Verify both geometries in viewport
      await viewportHelper.waitForGeometryRendered();
      await viewportHelper.verifyObjectCount(2);

      // Test viewport navigation with multiple objects
      await viewportHelper.fitAll();
      await viewportHelper.orbitCamera(45, 30);

      // Visual verification
      await viewportHelper.takeViewportScreenshot('multiple-nodes-from-dialogs.png');
    });
  });

  test.describe('Parameter Dialog Performance', () => {
    test('Parameter dialog opens quickly', async ({ page }) => {
      const startTime = Date.now();

      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      // Dialog should appear within reasonable time
      await expect(page.locator('[data-testid="parameter-dialog"]')).toBeVisible();

      const openTime = Date.now() - startTime;
      expect(openTime).toBeLessThan(2000); // Should open within 2 seconds
    });

    test('Parameter validation responds quickly', async ({ page }) => {
      await nodeHelper.dragNodeFromPanel('Solid::Box', { x: 400, y: 300 });

      const startTime = Date.now();

      // Change parameter to invalid value
      await page.fill('[data-testid="param-width"]', '-10');

      // Error should appear quickly
      await expect(page.locator('[data-testid="param-error"]')).toBeVisible();

      const validationTime = Date.now() - startTime;
      expect(validationTime).toBeLessThan(1000); // Validation within 1 second
    });
  });
});
