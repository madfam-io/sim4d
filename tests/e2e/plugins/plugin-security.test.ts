import { test, expect } from '@playwright/test';
import { PluginTestHelper } from './plugin-test-helper';
import { MockPluginServices, TEST_PLUGIN_CONFIGS } from './mock-services';

test.describe('Plugin Security and Sandboxing', () => {
  let pluginHelper: PluginTestHelper;
  let mockServices: MockPluginServices;

  test.beforeEach(async ({ page }) => {
    pluginHelper = new PluginTestHelper(page);
    mockServices = new MockPluginServices(page);

    // Initialize with security test configuration
    await mockServices.initialize({
      marketplace: TEST_PLUGIN_CONFIGS.SECURITY_TEST,
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 });
  });

  test.afterEach(async () => {
    await mockServices.reset();
  });

  test('should enforce sandbox memory isolation', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    const isolationResults = await pluginHelper.validateSandboxIsolation(pluginId);

    expect(isolationResults.memoryIsolated).toBe(true);
  });

  test('should restrict network access based on allowlist', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    const isolationResults = await pluginHelper.validateSandboxIsolation(pluginId);

    expect(isolationResults.networkRestricted).toBe(true);
  });

  test('should isolate plugin storage from main app', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    const isolationResults = await pluginHelper.validateSandboxIsolation(pluginId);

    expect(isolationResults.storageIsolated).toBe(true);
  });

  test('should isolate Web Worker execution', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    const isolationResults = await pluginHelper.validateSandboxIsolation(pluginId);

    expect(isolationResults.workerIsolated).toBe(true);
  });

  test('should reject plugins with invalid signatures', async () => {
    const pluginId = 'security-test-plugin';

    await expect(async () => {
      await pluginHelper.installPlugin(pluginId, { allowUnsigned: false });
    }).rejects.toThrow(/signature/i);
  });

  test('should enforce permission restrictions', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Test that plugin cannot access denied permissions
    const deniedPermissions = ['native:code', 'system:info'];
    const isRestricted = await pluginHelper.validatePermissionEnforcement(
      pluginId,
      deniedPermissions
    );

    expect(isRestricted).toBe(true);
  });

  test('should validate plugin signature verification', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    const signatureResult = await pluginHelper.validatePluginSignature(pluginId);

    expect(signatureResult.isValid).toBe(false); // This plugin has invalid signature
    expect(signatureResult.trusted).toBe(false);
  });

  test('should prevent plugin from accessing main app DOM', async ({ page }) => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Execute plugin code that tries to access main app DOM
    const result = await pluginHelper.executePluginFunction(pluginId, 'tryAccessMainDOM', []);

    // Should fail or return restricted access
    expect(result.success).toBe(false);
  });

  test('should enforce resource limits', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    const resourceResults = await pluginHelper.testPluginResourceManagement(pluginId);

    expect(resourceResults.timeoutHandling).toBe(true);
    expect(resourceResults.resourceCleanup).toBe(true);
  });

  test('should prevent plugin from modifying other plugins', async () => {
    const pluginId1 = 'security-test-plugin';
    const pluginId2 = 'basic-geometry';

    // Install both plugins
    await pluginHelper.installPlugin(pluginId1, { allowUnsigned: true });

    // Add basic geometry plugin to marketplace for this test
    await mockServices.setupTestMarketplace([
      ...TEST_PLUGIN_CONFIGS.SECURITY_TEST.plugins,
      {
        id: 'basic-geometry',
        name: 'Basic Geometry',
        version: '1.0.0',
        author: 'BrepFlow Team',
        description: 'Basic geometry operations',
        category: 'Geometry',
        rating: 4.5,
        downloads: 1000,
        verified: true,
        price: 0,
        bundle: { size: 512 * 1024, checksums: {}, dependencies: [], assets: [] },
        manifest: {
          nodes: ['Basic::Box'],
          commands: [],
          panels: [],
          permissions: ['read:graph', 'write:graph'],
          engines: { brepflow: '>=0.1.0' },
        },
      },
    ]);

    await pluginHelper.installPlugin(pluginId2);

    // Try to have plugin1 interfere with plugin2
    const result = await pluginHelper.executePluginFunction(pluginId1, 'interferewithOtherPlugin', [
      pluginId2,
    ]);

    // Should fail due to isolation
    expect(result.success).toBe(false);
  });

  test('should detect and prevent malicious behavior', async ({ page }) => {
    const pluginId = 'security-test-plugin';

    // Install plugin with monitoring
    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Monitor for security violations
    const securityViolations: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('security violation')) {
        securityViolations.push(msg.text());
      }
    });

    // Try to execute malicious operations
    await pluginHelper.executePluginFunction(pluginId, 'attemptDataExfiltration', []);
    await pluginHelper.executePluginFunction(pluginId, 'tryEscapeSandbox', []);

    // Should have detected violations
    expect(securityViolations.length).toBeGreaterThan(0);
  });

  test('should handle plugin crashes gracefully', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Execute function that causes plugin to crash
    const result = await pluginHelper.executePluginFunction(pluginId, 'crashPlugin', []);

    // Should handle crash gracefully
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();

    // Plugin should still be manageable (can be uninstalled)
    await expect(async () => {
      await pluginHelper.uninstallPlugin(pluginId);
    }).not.toThrow();
  });

  test('should enforce content security policy for plugin UI', async ({ page }) => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Check CSP headers are applied to plugin content
    const cspHeader = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.getAttribute('content') : null;
    });

    expect(cspHeader).toBeTruthy();
    expect(cspHeader).toContain('script-src');
  });

  test('should audit plugin permissions usage', async () => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Execute various plugin functions
    await pluginHelper.executePluginFunction(pluginId, 'useFilePermission', []);
    await pluginHelper.executePluginFunction(pluginId, 'useNetworkPermission', []);

    // Check audit log for permission usage
    const auditLog = await page.evaluate(() => {
      return (window as any).brepflow?.pluginManager?.getAuditLog?.(pluginId) || [];
    });

    expect(auditLog.length).toBeGreaterThan(0);
    expect(auditLog.some((entry: any) => entry.permission === 'read:files')).toBe(true);
  });

  test('should prevent plugin from persisting data outside sandbox', async ({ page }) => {
    const pluginId = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId, { allowUnsigned: true });

    // Try to persist data outside sandbox
    await pluginHelper.executePluginFunction(pluginId, 'tryPersistGlobalData', []);

    // Check that no global data was persisted
    const globalData = await page.evaluate(() => {
      return (window as any).maliciousPluginData;
    });

    expect(globalData).toBeUndefined();
  });

  test('should implement proper plugin communication boundaries', async () => {
    const pluginId1 = 'security-test-plugin';

    await pluginHelper.installPlugin(pluginId1, { allowUnsigned: true });

    // Test that plugin can only communicate through approved channels
    const result = await pluginHelper.executePluginFunction(
      pluginId1,
      'testCommunicationChannels',
      []
    );

    expect(result.success).toBe(true);
    expect(result.result.approvedChannelsOnly).toBe(true);
  });
});
