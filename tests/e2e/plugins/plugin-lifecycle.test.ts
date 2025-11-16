import { test, expect } from '@playwright/test';
import { PluginTestHelper } from './plugin-test-helper';
import { MockPluginServices, TEST_PLUGIN_CONFIGS } from './mock-services';

test.describe('Plugin Lifecycle Management', () => {
  let pluginHelper: PluginTestHelper;
  let mockServices: MockPluginServices;

  test.beforeEach(async ({ page }) => {
    pluginHelper = new PluginTestHelper(page);
    mockServices = new MockPluginServices(page);

    // Initialize mock services with basic test configuration
    await mockServices.initialize({
      marketplace: TEST_PLUGIN_CONFIGS.BASIC_MARKETPLACE,
    });

    // Navigate to BrepFlow Studio
    await page.goto('/');

    // Wait for app to be ready
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 });
  });

  test.afterEach(async () => {
    await mockServices.reset();
  });

  test('should browse and discover plugins in marketplace', async () => {
    // Test plugin discovery
    const discoveryResults = await pluginHelper.testPluginDiscovery();

    expect(discoveryResults.totalPlugins).toBeGreaterThan(0);
    expect(discoveryResults.categories).toContain('Geometry');
    expect(discoveryResults.searchResults).toBeGreaterThanOrEqual(0);
  });

  test('should install plugin from marketplace', async ({ page }) => {
    const pluginId = 'basic-geometry';

    // Install the plugin
    const context = await pluginHelper.installPlugin(pluginId, {
      source: 'marketplace',
      permissions: ['read:graph', 'write:graph'],
    });

    expect(context.pluginId).toBe(pluginId);
    expect(context.manifest.name).toBe('Basic Geometry');
    expect(context.permissions).toContain('read:graph');

    // Verify plugin appears in installed plugins list
    await pluginHelper.navigateToInstalledPlugins();
    await expect(
      page.locator(`[data-plugin-id="${pluginId}"][data-status="installed"]`)
    ).toBeVisible();
  });

  test('should handle plugin installation with permission requests', async ({ page }) => {
    const pluginId = 'basic-geometry';

    // Mock permission dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('permissions');
      await dialog.accept();
    });

    const context = await pluginHelper.installPlugin(pluginId, {
      permissions: ['read:graph', 'write:graph', 'worker:spawn'],
    });

    expect(context.manifest.permissions).toEqual(
      expect.arrayContaining(['read:graph', 'write:graph'])
    );
  });

  test('should activate and deactivate plugins', async () => {
    const pluginId = 'basic-geometry';

    // Install plugin
    await pluginHelper.installPlugin(pluginId);

    // Test activation
    await pluginHelper.togglePlugin(pluginId, true);

    // Test deactivation
    await pluginHelper.togglePlugin(pluginId, false);
  });

  test('should uninstall plugin completely', async ({ page }) => {
    const pluginId = 'basic-geometry';

    // Install plugin
    await pluginHelper.installPlugin(pluginId);

    // Verify installation
    await expect(
      page.locator(`[data-plugin-id="${pluginId}"][data-status="installed"]`)
    ).toBeVisible();

    // Uninstall plugin
    await pluginHelper.uninstallPlugin(pluginId);

    // Verify plugin is removed
    await expect(
      page.locator(`[data-plugin-id="${pluginId}"][data-status="installed"]`)
    ).not.toBeVisible();
  });

  test('should handle plugin installation failures gracefully', async () => {
    // Mock network failure
    await mockServices.simulateNetworkConditions({ errorRate: 1.0 });

    const pluginId = 'basic-geometry';

    // Attempt installation - should fail
    await expect(async () => {
      await pluginHelper.installPlugin(pluginId);
    }).rejects.toThrow();

    // Verify no partial installation
    const installedPlugins = await pluginHelper.getInstalledPlugins();
    expect(installedPlugins.find((p) => p.id === pluginId)).toBeUndefined();
  });

  test('should validate plugin version compatibility', async () => {
    // This would test against plugins with different engine version requirements
    // Implementation depends on mock plugin configuration
    const pluginId = 'basic-geometry';

    const context = await pluginHelper.installPlugin(pluginId);

    // Verify compatibility check passed
    expect(context.manifest.engines?.brepflow).toBeTruthy();
  });

  test('should handle plugin updates', async () => {
    const pluginId = 'basic-geometry';

    // Install initial version
    await pluginHelper.installPlugin(pluginId);

    // Mock newer version available
    await mockServices.setupTestMarketplace([
      {
        id: pluginId,
        name: 'Basic Geometry',
        version: '2.0.0', // Newer version
        author: 'BrepFlow Team',
        description: 'Updated basic geometry operations',
        category: 'Geometry',
        rating: 4.5,
        downloads: 1500,
        verified: true,
        price: 0,
        bundle: { size: 512 * 1024, checksums: {}, dependencies: [], assets: [] },
        manifest: {
          nodes: ['Basic::Box', 'Basic::Sphere', 'Basic::Cylinder'], // Added node
          commands: [],
          panels: [],
          permissions: ['read:graph', 'write:graph'],
          engines: { brepflow: '>=0.1.0' },
        },
      },
    ]);

    // Test update functionality
    // Note: This would require implementing update functionality in the helper
    // await pluginHelper.updatePlugin(pluginId, '2.0.0');
  });

  test('should track plugin usage metrics', async () => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Execute plugin function
    const result = await pluginHelper.executePluginFunction(pluginId, 'createBox', [
      { width: 10, height: 10, depth: 10 },
    ]);

    expect(result.success).toBe(true);
    expect(result.executionTime).toBeGreaterThan(0);
    expect(result.memoryUsed).toBeGreaterThanOrEqual(0);
  });

  test('should handle plugin rollback on installation failure', async () => {
    const pluginId = 'basic-geometry';

    // Install working version
    await pluginHelper.installPlugin(pluginId);

    // Mock corrupted update
    await mockServices.setupTestMarketplace([
      {
        id: pluginId,
        name: 'Basic Geometry',
        version: '2.0.0',
        author: 'BrepFlow Team',
        description: 'Corrupted version',
        category: 'Geometry',
        rating: 4.5,
        downloads: 1500,
        verified: true,
        price: 0,
        bundle: { size: 0, checksums: { sha256: 'invalid' }, dependencies: [], assets: [] },
        manifest: {
          nodes: ['Basic::Box'],
          commands: [],
          panels: [],
          permissions: ['read:graph', 'write:graph'],
          engines: { brepflow: '>=0.1.0' },
          signature: 'invalid_signature',
        },
      },
    ]);

    // Attempt update - should fail and rollback
    // Implementation would depend on update/rollback functionality
  });
});
