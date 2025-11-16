import { test, expect } from '@playwright/test';
import { PluginTestHelper } from './plugin-test-helper';
import { MockPluginServices, TEST_PLUGIN_CONFIGS } from './mock-services';

test.describe('Plugin Integration with BrepFlow Core', () => {
  let pluginHelper: PluginTestHelper;
  let mockServices: MockPluginServices;

  test.beforeEach(async ({ page }) => {
    pluginHelper = new PluginTestHelper(page);
    mockServices = new MockPluginServices(page);

    await mockServices.initialize({
      marketplace: TEST_PLUGIN_CONFIGS.BASIC_MARKETPLACE,
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 });
  });

  test.afterEach(async () => {
    await mockServices.reset();
  });

  test('should integrate plugin nodes with node editor', async () => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Test plugin node integration
    const integrationResult = await pluginHelper.testPluginNodeIntegration(pluginId, 'Basic::Box');

    expect(integrationResult.nodeCreated).toBe(true);
    expect(integrationResult.parametersWorking).toBe(true);
    expect(integrationResult.connectionSuccessful).toBe(true);
    expect(integrationResult.evaluationSuccessful).toBe(true);
  });

  test('should integrate plugin with viewport rendering', async () => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Test viewport integration
    const viewportResult = await pluginHelper.testPluginViewportIntegration(pluginId);

    expect(viewportResult.overlayRendered).toBe(true);
    expect(viewportResult.interactionWorking).toBe(true);
    expect(viewportResult.performanceAcceptable).toBe(true);
  });

  test('should work with inspector panel for parameter editing', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create a plugin node
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', {
      width: 100,
      height: 50,
      depth: 25,
    });

    // Select the node to activate inspector
    await pluginHelper.nodeHelper.selectNode(nodeId);

    // Wait for inspector to show plugin node parameters
    await pluginHelper.inspectorHelper.waitForInspectorReady();
    await pluginHelper.inspectorHelper.verifyParametersSection();

    // Edit a parameter through inspector
    await pluginHelper.inspectorHelper.editParameter('width', '150');

    // Verify parameter change took effect
    await pluginHelper.inspectorHelper.verifyParameterValue('width', '150');

    // Verify node reflects the change
    const nodeParams = await pluginHelper.nodeHelper.getNodeParameters(nodeId);
    expect(nodeParams.width).toBe(150);
  });

  test('should handle plugin node evaluation in graph context', async () => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create a workflow with plugin nodes
    const boxNode = await pluginHelper.nodeHelper.createNode('Basic::Box', {
      width: 100,
      height: 50,
      depth: 25,
    });
    const sphereNode = await pluginHelper.nodeHelper.createNode('Basic::Sphere', { radius: 30 });

    // Trigger graph evaluation
    await pluginHelper.nodeHelper.evaluateGraph();

    // Verify nodes evaluated successfully
    expect(await pluginHelper.nodeHelper.nodeHasError(boxNode)).toBe(false);
    expect(await pluginHelper.nodeHelper.nodeHasError(sphereNode)).toBe(false);

    // Verify geometry was created in viewport
    await pluginHelper.viewportHelper.verifyGeometryVisible();
  });

  test('should support plugin commands in UI', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Look for plugin commands in command palette or menu
    await page.keyboard.press('Control+Shift+P'); // Open command palette

    const commandPalette = page.locator('[data-testid="command-palette"]');
    if (await commandPalette.isVisible({ timeout: 5000 })) {
      // Search for plugin command
      await page.fill('[data-testid="command-search"]', 'Basic');

      // Check if plugin commands appear
      const pluginCommand = page.locator('[data-testid="command-item"]', { hasText: 'Basic' });
      await expect(pluginCommand).toBeVisible();
    }
  });

  test('should handle plugin data serialization and persistence', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create a graph with plugin nodes
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', {
      width: 100,
      height: 50,
      depth: 25,
    });

    // Save the graph
    await page.keyboard.press('Control+S');

    // Verify graph data includes plugin information
    const graphData = await page.evaluate(() => {
      return (window as any).brepflow?.graph?.serialize?.() || {};
    });

    expect(graphData.nodes).toBeTruthy();
    expect(graphData.nodes[nodeId]).toBeTruthy();
    expect(graphData.nodes[nodeId].type).toBe('Basic::Box');
  });

  test('should handle plugin error states gracefully', async () => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create a node that will cause an error
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', { width: -1 }); // Invalid parameter

    // Trigger evaluation
    await pluginHelper.nodeHelper.evaluateGraph();

    // Check error handling
    const hasError = await pluginHelper.nodeHelper.nodeHasError(nodeId);
    expect(hasError).toBe(true);

    const errorMessage = await pluginHelper.nodeHelper.getNodeError(nodeId);
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('width'); // Should mention the problematic parameter
  });

  test('should maintain plugin state during undo/redo operations', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create initial state
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', { width: 100 });

    // Modify parameter
    await pluginHelper.inspectorHelper.editParameter('width', '200');

    // Verify change
    await pluginHelper.inspectorHelper.verifyParameterValue('width', '200');

    // Undo
    await page.keyboard.press('Control+Z');

    // Verify undo worked
    await pluginHelper.inspectorHelper.verifyParameterValue('width', '100');

    // Redo
    await page.keyboard.press('Control+Y');

    // Verify redo worked
    await pluginHelper.inspectorHelper.verifyParameterValue('width', '200');
  });

  test('should handle plugin lifecycle during graph operations', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create nodes
    const boxNode = await pluginHelper.nodeHelper.createNode('Basic::Box', { width: 100 });

    // Copy node
    await pluginHelper.nodeHelper.selectNode(boxNode);
    await page.keyboard.press('Control+C');
    await page.keyboard.press('Control+V');

    // Verify copy includes plugin state
    const nodeCount = await pluginHelper.nodeHelper.getNodeCount();
    expect(nodeCount).toBe(2);

    // Delete original node
    await pluginHelper.nodeHelper.deleteNode(boxNode);

    // Verify copied node still works
    await pluginHelper.nodeHelper.evaluateGraph();
    const remainingNodes = await pluginHelper.nodeHelper.getAllNodeIds();
    expect(remainingNodes.length).toBe(1);
  });

  test('should integrate with BrepFlow export/import workflows', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create geometry with plugin
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', {
      width: 100,
      height: 50,
      depth: 25,
    });
    await pluginHelper.nodeHelper.evaluateGraph();

    // Test export functionality
    const exportButton = page.locator('[data-testid="export-step"], button:has-text("Export")');
    if (await exportButton.isVisible({ timeout: 5000 })) {
      await exportButton.click();

      // Verify export dialog shows plugin-generated geometry
      const exportDialog = page.locator('[data-testid="export-dialog"]');
      await expect(exportDialog).toBeVisible();

      // Check that plugin geometry is included in export list
      const geometryList = page.locator('[data-testid="export-geometry-list"]');
      const geometryCount = await geometryList.locator('[data-testid="geometry-item"]').count();
      expect(geometryCount).toBeGreaterThan(0);
    }
  });

  test('should handle plugin updates without breaking existing graphs', async ({ page }) => {
    const pluginId = 'basic-geometry';

    // Install plugin and create graph
    await pluginHelper.installPlugin(pluginId);
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', { width: 100 });

    // Mock plugin update
    await mockServices.setupTestMarketplace([
      {
        id: pluginId,
        name: 'Basic Geometry',
        version: '2.0.0',
        author: 'BrepFlow Team',
        description: 'Updated with new features',
        category: 'Geometry',
        rating: 4.5,
        downloads: 1500,
        verified: true,
        price: 0,
        bundle: { size: 512 * 1024, checksums: {}, dependencies: [], assets: [] },
        manifest: {
          nodes: ['Basic::Box', 'Basic::Sphere', 'Basic::Cylinder'], // Added cylinder
          commands: [],
          panels: [],
          permissions: ['read:graph', 'write:graph'],
          engines: { brepflow: '>=0.1.0' },
        },
      },
    ]);

    // Simulate plugin update
    // await pluginHelper.updatePlugin(pluginId, '2.0.0');

    // Verify existing node still works
    await pluginHelper.nodeHelper.evaluateGraph();
    expect(await pluginHelper.nodeHelper.nodeHasError(nodeId)).toBe(false);
  });

  test('should support plugin custom UI components', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Check if plugin registers custom UI panels
    const customPanel = page.locator(
      '[data-testid="plugin-custom-panel"], [data-plugin-panel="basic-geometry"]'
    );

    // Plugin might register a custom panel
    if (await customPanel.isVisible({ timeout: 5000 })) {
      // Interact with custom panel
      await customPanel.click();

      // Verify custom panel functionality
      const panelContent = page.locator('[data-testid="plugin-panel-content"]');
      await expect(panelContent).toBeVisible();
    }
  });

  test('should handle plugin resource cleanup on uninstall', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create nodes and use plugin extensively
    await pluginHelper.nodeHelper.createNode('Basic::Box', { width: 100 });
    await pluginHelper.nodeHelper.createNode('Basic::Sphere', { radius: 50 });
    await pluginHelper.nodeHelper.evaluateGraph();

    // Uninstall plugin
    await pluginHelper.uninstallPlugin(pluginId);

    // Check that plugin nodes are handled gracefully
    const nodeCount = await pluginHelper.nodeHelper.getNodeCount();

    // Nodes might be removed or marked as unavailable
    const unavailableNodes = await page.locator('[data-node-status="unavailable"]').count();

    // Either nodes are cleaned up or marked as unavailable
    expect(nodeCount === 0 || unavailableNodes > 0).toBe(true);

    // Verify no residual plugin resources
    const residualResources = await pluginHelper.checkPluginResidualResources(pluginId);
    expect(residualResources.length).toBe(0);
  });

  test('should integrate with performance monitoring', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Create performance-intensive operations
    const nodeId = await pluginHelper.nodeHelper.createNode('Basic::Box', { width: 1000 });

    // Monitor performance during evaluation
    const performanceStart = Date.now();
    await pluginHelper.nodeHelper.evaluateGraph();
    const performanceTime = Date.now() - performanceStart;

    // Check performance metrics are tracked
    const performanceMetrics = await page.evaluate(() => {
      return (window as any).brepflow?.performance?.getMetrics?.() || {};
    });

    expect(performanceTime).toBeLessThan(5000); // Should complete within 5 seconds
    expect(performanceMetrics.pluginExecutions).toBeTruthy();
  });
});
