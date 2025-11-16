/**
 * End-to-End Abacus Studio Test
 *
 * Tests the complete workflow from studio UI to exported files
 * Validates the full user journey for creating a parametric abacus
 */

import { test, expect, Page } from '@playwright/test';
import fs from 'fs/promises';
// import path from 'path';

// Test configuration
const TEST_OUTPUT_DIR = './test-outputs/e2e-abacus';
const BASE_URL = process.env.STUDIO_URL || 'http://localhost:5173';

test.describe('Parametric Abacus Studio E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create test output directory
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });

    // Create new page with extended timeout for geometry operations
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    page = await context.newPage();

    // Navigate to BrepFlow studio
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Creates parametric abacus from scratch in studio', async () => {
    // Step 1: Create new project
    await test.step('Create new project', async () => {
      await page.click('[data-testid="new-project"]');
      await page.fill('[data-testid="project-name"]', 'Parametric Abacus Test');
      await page.click('[data-testid="create-project"]');

      // Wait for studio to load
      await page.waitForSelector('[data-testid="node-editor"]');
      await page.waitForSelector('[data-testid="viewport-3d"]');
    });

    // Step 2: Add frame node
    await test.step('Add frame box node', async () => {
      // Open node palette
      await page.click('[data-testid="node-palette"]');
      await page.click('[data-testid="category-solid"]');

      // Add box node for frame
      await page.dragAndDrop('[data-testid="node-box"]', '[data-testid="node-editor"]');

      // Configure frame parameters
      await page.click('[data-testid="node-box-1"]');
      await page.fill('[data-testid="param-width"]', '280'); // 10 rods * 25 spacing + frame
      await page.fill('[data-testid="param-height"]', '300');
      await page.fill('[data-testid="param-depth"]', '20');

      // Verify frame appears in viewport
      await page.waitForSelector('[data-testid="viewport-shape-frame"]');
    });

    // Step 3: Add rod geometry
    await test.step('Add rod cylinder node', async () => {
      // Add cylinder node for rod
      await page.dragAndDrop('[data-testid="node-cylinder"]', '[data-testid="node-editor"]', {
        targetPosition: { x: 200, y: 100 },
      });

      // Configure rod parameters
      await page.click('[data-testid="node-cylinder-1"]');
      await page.fill('[data-testid="param-radius"]', '2');
      await page.fill('[data-testid="param-height"]', '260');

      // Set rod orientation (horizontal)
      await page.fill('[data-testid="param-axis-x"]', '1');
      await page.fill('[data-testid="param-axis-y"]', '0');
      await page.fill('[data-testid="param-axis-z"]', '0');
    });

    // Step 4: Pattern rods
    await test.step('Add linear pattern for rods', async () => {
      // Open patterns category
      await page.click('[data-testid="category-patterns"]');

      // Add linear pattern
      await page.dragAndDrop('[data-testid="node-linear-pattern"]', '[data-testid="node-editor"]', {
        targetPosition: { x: 350, y: 100 },
      });

      // Configure pattern parameters
      await page.click('[data-testid="node-linear-pattern-1"]');
      await page.fill('[data-testid="param-count"]', '10');
      await page.fill('[data-testid="param-spacing"]', '25');
      await page.fill('[data-testid="param-direction-y"]', '1');

      // Connect cylinder to pattern
      await page.hover('[data-testid="node-cylinder-1"] [data-port="shape"]');
      await page.dragAndDrop(
        '[data-testid="node-cylinder-1"] [data-port="shape"]',
        '[data-testid="node-linear-pattern-1"] [data-port="shape"]'
      );

      // Verify 10 rods appear
      await page.waitForSelector('[data-testid="viewport-shape-rods"]');
      const rodCount = await page.locator('[data-testid="viewport-rod"]').count();
      expect(rodCount).toBe(10);
    });

    // Step 5: Add bead geometry
    await test.step('Add bead sphere node', async () => {
      // Add sphere node for bead
      await page.click('[data-testid="category-solid"]');
      await page.dragAndDrop('[data-testid="node-sphere"]', '[data-testid="node-editor"]', {
        targetPosition: { x: 100, y: 250 },
      });

      // Configure bead parameters
      await page.click('[data-testid="node-sphere-1"]');
      await page.fill('[data-testid="param-radius"]', '5');
    });

    // Step 6: Pattern beads in grid
    await test.step('Add rectangular pattern for beads', async () => {
      // Add rectangular pattern
      await page.click('[data-testid="category-patterns"]');
      await page.dragAndDrop(
        '[data-testid="node-rectangular-pattern"]',
        '[data-testid="node-editor"]',
        { targetPosition: { x: 250, y: 250 } }
      );

      // Configure bead pattern
      await page.click('[data-testid="node-rectangular-pattern-1"]');
      await page.fill('[data-testid="param-count-x"]', '8'); // 8 beads per rod
      await page.fill('[data-testid="param-count-y"]', '10'); // 10 rods
      await page.fill('[data-testid="param-spacing-x"]', '15'); // Bead spacing
      await page.fill('[data-testid="param-spacing-y"]', '25'); // Rod spacing

      // Connect sphere to pattern
      await page.dragAndDrop(
        '[data-testid="node-sphere-1"] [data-port="shape"]',
        '[data-testid="node-rectangular-pattern-1"] [data-port="shape"]'
      );

      // Verify 80 beads appear (8 * 10)
      await page.waitForSelector('[data-testid="viewport-shape-beads"]');
      const beadCount = await page.locator('[data-testid="viewport-bead"]').count();
      expect(beadCount).toBe(80);
    });

    // Step 7: Create assembly
    await test.step('Create assembly of all components', async () => {
      // Add assembly node
      await page.click('[data-testid="category-assembly"]');
      await page.dragAndDrop('[data-testid="node-assembly"]', '[data-testid="node-editor"]', {
        targetPosition: { x: 500, y: 200 },
      });

      // Connect all components to assembly
      await page.dragAndDrop(
        '[data-testid="node-box-1"] [data-port="shape"]',
        '[data-testid="node-assembly-1"] [data-port="parts"]'
      );

      await page.dragAndDrop(
        '[data-testid="node-linear-pattern-1"] [data-port="shapes"]',
        '[data-testid="node-assembly-1"] [data-port="parts"]'
      );

      await page.dragAndDrop(
        '[data-testid="node-rectangular-pattern-1"] [data-port="shapes"]',
        '[data-testid="node-assembly-1"] [data-port="parts"]'
      );

      // Verify complete abacus assembly
      await page.waitForSelector('[data-testid="viewport-assembly-complete"]');
    });

    // Step 8: Test parametric behavior
    await test.step('Test parametric updates', async () => {
      // Change bead count parameter
      await page.click('[data-testid="node-rectangular-pattern-1"]');
      await page.fill('[data-testid="param-count-x"]', '6'); // Reduce to 6 beads per rod

      // Verify graph re-evaluates
      await page.waitForSelector('[data-testid="evaluation-complete"]');

      // Check updated bead count (6 * 10 = 60)
      const updatedBeadCount = await page.locator('[data-testid="viewport-bead"]').count();
      expect(updatedBeadCount).toBe(60);

      // Change rod count
      await page.click('[data-testid="node-linear-pattern-1"]');
      await page.fill('[data-testid="param-count"]', '12'); // Increase to 12 rods

      await page.waitForSelector('[data-testid="evaluation-complete"]');

      // Check updated rod and bead counts
      const updatedRodCount = await page.locator('[data-testid="viewport-rod"]').count();
      expect(updatedRodCount).toBe(12);

      const finalBeadCount = await page.locator('[data-testid="viewport-bead"]').count();
      expect(finalBeadCount).toBe(72); // 6 * 12
    });

    // Step 9: Export to multiple formats
    await test.step('Export abacus to multiple formats', async () => {
      // Select assembly node for export
      await page.click('[data-testid="node-assembly-1"]');

      // Export to STEP
      await page.click('[data-testid="export-menu"]');
      await page.click('[data-testid="export-step"]');
      await page.fill('[data-testid="export-filename"]', 'abacus-e2e-test.step');
      await page.click('[data-testid="export-confirm"]');

      // Wait for export completion
      await page.waitForSelector('[data-testid="export-success"]');

      // Export to STL
      await page.click('[data-testid="export-stl"]');
      await page.fill('[data-testid="export-filename"]', 'abacus-e2e-test.stl');
      await page.click('[data-testid="export-confirm"]');

      await page.waitForSelector('[data-testid="export-success"]');

      // Save as .bflow project
      await page.click('[data-testid="save-project"]');
      await page.fill('[data-testid="save-filename"]', 'abacus-e2e-test.bflow.json');
      await page.click('[data-testid="save-confirm"]');

      await page.waitForSelector('[data-testid="save-success"]');
    });

    // Step 10: Validate viewport visualization
    await test.step('Validate 3D viewport visualization', async () => {
      // Test viewport controls
      await page.hover('[data-testid="viewport-3d"]');

      // Rotate view
      await page.mouse.move(960, 540); // Center of viewport
      await page.mouse.down();
      await page.mouse.move(1060, 440); // Drag to rotate
      await page.mouse.up();

      // Zoom in
      await page.mouse.wheel(0, -100);

      // Zoom out
      await page.mouse.wheel(0, 100);

      // Test selection
      await page.click('[data-testid="viewport-bead-0"]');
      await expect(page.locator('[data-testid="selection-highlight"]')).toBeVisible();

      // Test wireframe mode
      await page.click('[data-testid="viewport-wireframe"]');
      await expect(page.locator('[data-testid="viewport-3d"]')).toHaveAttribute(
        'data-mode',
        'wireframe'
      );

      // Back to solid mode
      await page.click('[data-testid="viewport-solid"]');
      await expect(page.locator('[data-testid="viewport-3d"]')).toHaveAttribute(
        'data-mode',
        'solid'
      );
    });
  });

  test('Tests abacus manufacturing validation workflow', async () => {
    // Load pre-built abacus project
    await test.step('Load abacus project', async () => {
      await page.click('[data-testid="open-project"]');
      await page.click('[data-testid="sample-abacus"]');
      await page.waitForSelector('[data-testid="viewport-assembly-complete"]');
    });

    // Run manufacturing validation
    await test.step('Validate for 3D printing', async () => {
      await page.click('[data-testid="manufacturing-menu"]');
      await page.click('[data-testid="validate-3d-printing"]');

      // Configure validation parameters
      await page.selectOption('[data-testid="print-technology"]', 'FDM');
      await page.fill('[data-testid="layer-height"]', '0.2');
      await page.fill('[data-testid="support-angle"]', '45');
      await page.click('[data-testid="run-validation"]');

      // Wait for validation results
      await page.waitForSelector('[data-testid="validation-complete"]');

      // Check validation passed
      await expect(page.locator('[data-testid="validation-status"]')).toHaveText('PASSED');

      // Verify minimal supports required
      const supportCount = await page.locator('[data-testid="support-count"]').textContent();
      expect(parseInt(supportCount || '0')).toBeLessThan(5);
    });

    // Generate toolpath
    await test.step('Generate CNC toolpath', async () => {
      await page.click('[data-testid="manufacturing-menu"]');
      await page.click('[data-testid="generate-toolpath"]');

      // Configure machining parameters
      await page.selectOption('[data-testid="machining-operation"]', 'roughing');
      await page.fill('[data-testid="tool-diameter"]', '6');
      await page.fill('[data-testid="feed-rate"]', '1000');
      await page.click('[data-testid="generate-toolpath"]');

      // Wait for toolpath generation
      await page.waitForSelector('[data-testid="toolpath-complete"]');

      // Verify toolpath visualization
      await expect(page.locator('[data-testid="viewport-toolpath"]')).toBeVisible();
    });

    // Cost estimation
    await test.step('Estimate manufacturing cost', async () => {
      await page.click('[data-testid="manufacturing-menu"]');
      await page.click('[data-testid="cost-estimation"]');

      // Configure cost parameters
      await page.selectOption('[data-testid="manufacturing-process"]', 'cnc_machining');
      await page.selectOption('[data-testid="material"]', 'aluminum_6061');
      await page.fill('[data-testid="quantity"]', '10');
      await page.click('[data-testid="calculate-cost"]');

      // Wait for cost calculation
      await page.waitForSelector('[data-testid="cost-complete"]');

      // Verify cost breakdown
      const totalCost = await page.locator('[data-testid="total-cost"]').textContent();
      expect(parseFloat(totalCost?.replace('$', '') || '0')).toBeGreaterThan(0);

      // Check cost breakdown components
      await expect(page.locator('[data-testid="material-cost"]')).toBeVisible();
      await expect(page.locator('[data-testid="labor-cost"]')).toBeVisible();
      await expect(page.locator('[data-testid="machine-cost"]')).toBeVisible();
    });
  });

  test('Tests collaborative editing simulation', async () => {
    // Simulate multiple users editing the same abacus
    await test.step('Setup collaboration', async () => {
      // Create shared project
      await page.click('[data-testid="new-project"]');
      await page.fill('[data-testid="project-name"]', 'Collaborative Abacus');
      await page.check('[data-testid="enable-collaboration"]');
      await page.click('[data-testid="create-project"]');

      await page.waitForSelector('[data-testid="collaboration-active"]');
    });

    // Simulate parameter changes from different users
    await test.step('Simulate multi-user edits', async () => {
      // User 1 changes bead count
      await page.evaluate(() => {
        window.simulateUserEdit('user1', 'beadCount', 7);
      });

      await page.waitForSelector('[data-testid="remote-change-indicator"]');

      // User 2 changes rod spacing
      await page.evaluate(() => {
        window.simulateUserEdit('user2', 'rodSpacing', 30);
      });

      await page.waitForSelector('[data-testid="conflict-resolution"]');

      // Resolve conflicts
      await page.click('[data-testid="accept-all-changes"]');
      await page.waitForSelector('[data-testid="conflict-resolved"]');
    });

    // Verify final state
    await test.step('Verify collaborative result', async () => {
      // Check that both changes were applied
      const beadCount = await page.locator('[data-testid="viewport-bead"]').count();
      expect(beadCount).toBe(70); // 7 beads * 10 rods

      // Check rod spacing visually
      const firstRod = await page.locator('[data-testid="viewport-rod-0"]').boundingBox();
      const secondRod = await page.locator('[data-testid="viewport-rod-1"]').boundingBox();
      const spacing = Math.abs((secondRod?.y || 0) - (firstRod?.y || 0));
      expect(spacing).toBeCloseTo(30, 1); // 30mm spacing with some tolerance
    });
  });

  test('Tests performance with large abacus configurations', async () => {
    await test.step('Create large abacus', async () => {
      // Create new project
      await page.click('[data-testid="new-project"]');
      await page.fill('[data-testid="project-name"]', 'Large Abacus Performance Test');
      await page.click('[data-testid="create-project"]');

      // Load template with many components
      await page.click('[data-testid="load-template"]');
      await page.click('[data-testid="template-large-abacus"]'); // 20 rods, 15 beads each

      const startTime = Date.now();
      await page.waitForSelector('[data-testid="viewport-assembly-complete"]');
      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);

      // Verify all components loaded
      const beadCount = await page.locator('[data-testid="viewport-bead"]').count();
      expect(beadCount).toBe(300); // 20 * 15
    });

    await test.step('Test real-time parameter updates', async () => {
      // Change parameters and measure update time
      const startTime = Date.now();

      await page.click('[data-testid="node-rectangular-pattern-1"]');
      await page.fill('[data-testid="param-count-x"]', '12'); // Change bead count

      await page.waitForSelector('[data-testid="evaluation-complete"]');
      const updateTime = Date.now() - startTime;

      // Should update within 5 seconds
      expect(updateTime).toBeLessThan(5000);

      // Verify update applied correctly
      const updatedBeadCount = await page.locator('[data-testid="viewport-bead"]').count();
      expect(updatedBeadCount).toBe(240); // 20 * 12
    });

    await test.step('Test viewport performance', async () => {
      // Measure viewport frame rate during interaction
      await page.evaluate(() => {
        window.startPerformanceMonitoring();
      });

      // Perform viewport interactions
      await page.hover('[data-testid="viewport-3d"]');
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(960 + i * 10, 540);
        await page.waitForTimeout(50);
      }

      const performanceData = await page.evaluate(() => {
        return window.getPerformanceData();
      });

      // Should maintain reasonable frame rate
      expect(performanceData.averageFPS).toBeGreaterThan(30);
      expect(performanceData.memoryUsage).toBeLessThan(500 * 1024 * 1024); // 500MB
    });
  });
});

// Helper function to create downloadable test artifacts
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    // Capture screenshot on failure
    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });

    // Capture console logs
    const logs = await page.evaluate(() => {
      return window.getConsoleLogs();
    });
    await testInfo.attach('console-logs', {
      body: JSON.stringify(logs, null, 2),
      contentType: 'application/json',
    });

    // Capture network requests
    const networkLogs = await page.evaluate(() => {
      return window.getNetworkLogs();
    });
    await testInfo.attach('network-logs', {
      body: JSON.stringify(networkLogs, null, 2),
      contentType: 'application/json',
    });
  }
});
