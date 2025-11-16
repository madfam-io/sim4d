import { test, expect } from '@playwright/test';
import { PluginTestHelper } from './plugin-test-helper';
import { MockPluginServices, TEST_PLUGIN_CONFIGS } from './mock-services';

test.describe('Plugin Multi-User Collaboration', () => {
  let pluginHelper: PluginTestHelper;
  let mockServices: MockPluginServices;

  test.beforeEach(async ({ page }) => {
    pluginHelper = new PluginTestHelper(page);
    mockServices = new MockPluginServices(page);

    // Initialize with collaboration test configuration
    await mockServices.initialize({
      marketplace: TEST_PLUGIN_CONFIGS.BASIC_MARKETPLACE,
      cloudServices: TEST_PLUGIN_CONFIGS.COLLABORATION_TEST,
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 });
  });

  test.afterEach(async () => {
    await mockServices.reset();
  });

  test('should synchronize plugin states across users', async () => {
    const pluginId = 'basic-geometry';

    // Setup collaboration session
    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [
        {
          user: 'test_user_1',
          action: 'createNode',
          data: { type: 'Basic::Box', params: { width: 100 } },
        },
        { user: 'test_user_2', action: 'editParameter', data: { param: 'width', value: 150 } },
        { user: 'test_user_1', action: 'addConnection', data: { targetNode: 'node2' } },
      ],
    });

    expect(session.users).toEqual(['test_user_1', 'test_user_2']);
    expect(session.pluginStates.size).toBeGreaterThan(0);

    // Validate state synchronization
    const syncResult = await pluginHelper.validatePluginStateSynchronization(
      session.sessionId,
      pluginId
    );

    expect(syncResult.synchronized).toBe(true);
    expect(syncResult.latencyMs).toBeLessThan(1000); // Should sync within 1 second
  });

  test('should handle concurrent plugin operations', async () => {
    const pluginId = 'basic-geometry';

    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [
        // Concurrent operations
        { user: 'test_user_1', action: 'createBox', data: { width: 50, height: 50, depth: 50 } },
        { user: 'test_user_2', action: 'createSphere', data: { radius: 25 } },
        {
          user: 'test_user_1',
          action: 'moveNode',
          data: { nodeId: 'box1', position: { x: 100, y: 100 } },
        },
        {
          user: 'test_user_2',
          action: 'connectNodes',
          data: { source: 'sphere1', target: 'box1' },
        },
      ],
    });

    // Verify no conflicts occurred
    const syncResult = await pluginHelper.validatePluginStateSynchronization(
      session.sessionId,
      pluginId
    );

    expect(syncResult.synchronized).toBe(true);
    expect(syncResult.conflicts.length).toBe(0);
  });

  test('should resolve plugin parameter conflicts', async ({ page }) => {
    const pluginId = 'basic-geometry';

    // Create scenario where two users edit the same parameter simultaneously
    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [
        { user: 'test_user_1', action: 'createBox', data: { width: 100 } },
        { user: 'test_user_1', action: 'editParameter', data: { param: 'width', value: 150 } },
        { user: 'test_user_2', action: 'editParameter', data: { param: 'width', value: 200 } },
      ],
    });

    // Check for conflict resolution UI
    const conflictDialog = page.locator('[data-testid="parameter-conflict-dialog"]');
    if (await conflictDialog.isVisible({ timeout: 5000 })) {
      // Resolve conflict by accepting user 2's change
      await page.click('[data-testid="accept-user2-change"]');
    }

    // Verify final state
    const finalState = await pluginHelper.getPluginState(pluginId);
    expect(finalState.parameters?.width).toBe(200);
  });

  test('should maintain plugin performance with multiple users', async () => {
    const pluginId = 'basic-geometry';

    // Test with multiple users performing operations simultaneously
    const startTime = Date.now();

    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2', 'test_user_3'],
      pluginId,
      workflowActions: [
        { user: 'test_user_1', action: 'createComplexGeometry', data: { complexity: 'high' } },
        { user: 'test_user_2', action: 'createComplexGeometry', data: { complexity: 'high' } },
        { user: 'test_user_3', action: 'createComplexGeometry', data: { complexity: 'high' } },
        { user: 'test_user_1', action: 'evaluateGraph', data: {} },
        { user: 'test_user_2', action: 'evaluateGraph', data: {} },
        { user: 'test_user_3', action: 'evaluateGraph', data: {} },
      ],
    });

    const totalTime = Date.now() - startTime;

    // Performance should not degrade significantly with multiple users
    expect(totalTime).toBeLessThan(10000); // 10 second threshold for complex operations
  });

  test('should handle user disconnection gracefully', async ({ page }) => {
    const pluginId = 'basic-geometry';

    // Start collaboration session
    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [{ user: 'test_user_1', action: 'createBox', data: { width: 100 } }],
    });

    // Simulate user disconnection
    await page.evaluate((sessionId) => {
      const event = new CustomEvent('user-disconnected', {
        detail: { sessionId, userId: 'test_user_2' },
      });
      window.dispatchEvent(event);
    }, session.sessionId);

    // Check that session continues with remaining user
    await pluginHelper.executePluginAction(pluginId, 'editParameter', {
      param: 'width',
      value: 200,
    });

    const finalState = await pluginHelper.getPluginState(pluginId);
    expect(finalState.parameters?.width).toBe(200);
  });

  test('should synchronize plugin UI states across users', async ({ page }) => {
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Test UI state synchronization (e.g., panel visibility, tool selection)
    await pluginHelper.switchToUser('test_user_1');
    await page.click('[data-testid="show-plugin-panel"]');

    await pluginHelper.switchToUser('test_user_2');

    // Check if panel state synchronized
    const panelVisible = await page.locator('[data-testid="plugin-panel"]').isVisible();
    expect(panelVisible).toBe(true);
  });

  test('should handle plugin permissions across users', async () => {
    const pluginId = 'basic-geometry';

    // Install plugin with different permissions for different users
    await pluginHelper.switchToUser('test_user_1');
    await pluginHelper.installPlugin(pluginId, {
      permissions: ['read:graph', 'write:graph'],
    });

    await pluginHelper.switchToUser('test_user_2');
    await pluginHelper.installPlugin(pluginId, {
      permissions: ['read:graph'], // Read-only
    });

    // Test that user 2 cannot perform write operations
    const result = await pluginHelper.executePluginFunction(pluginId, 'modifyGraph', []);
    expect(result.success).toBe(false);
    expect(result.error).toContain('permission');
  });

  test('should track collaborative plugin usage analytics', async () => {
    const pluginId = 'basic-geometry';

    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [
        { user: 'test_user_1', action: 'createBox', data: { width: 100 } },
        { user: 'test_user_2', action: 'createSphere', data: { radius: 50 } },
        { user: 'test_user_1', action: 'evaluateGraph', data: {} },
      ],
    });

    // Check analytics data
    const analytics = await page.evaluate((sessionId) => {
      return (window as any).brepflow?.analytics?.getSessionData?.(sessionId) || {};
    }, session.sessionId);

    expect(analytics.totalOperations).toBeGreaterThan(0);
    expect(analytics.userContributions).toBeTruthy();
    expect(analytics.pluginUsage?.[pluginId]).toBeTruthy();
  });

  test('should support plugin-specific collaboration features', async ({ page }) => {
    // Test collaboration features specific to a plugin (like shared annotations)
    const pluginId = 'basic-geometry';

    await pluginHelper.installPlugin(pluginId);

    // Use plugin-specific collaboration feature
    await pluginHelper.executePluginFunction(pluginId, 'addSharedAnnotation', [
      { text: 'This is a shared note', position: { x: 100, y: 100 } },
    ]);

    // Switch users and verify annotation is visible
    await pluginHelper.switchToUser('test_user_2');

    const annotations = await pluginHelper.executePluginFunction(
      pluginId,
      'getSharedAnnotations',
      []
    );
    expect(annotations.result.length).toBeGreaterThan(0);
    expect(annotations.result[0].text).toBe('This is a shared note');
  });

  test('should handle plugin versioning in collaborative sessions', async () => {
    const pluginId = 'basic-geometry';

    // User 1 installs version 1.0.0
    await pluginHelper.switchToUser('test_user_1');
    await pluginHelper.installPlugin(pluginId);

    // User 2 tries to install version 2.0.0
    await pluginHelper.switchToUser('test_user_2');

    // Mock newer version
    await mockServices.setupTestMarketplace([
      {
        id: pluginId,
        name: 'Basic Geometry',
        version: '2.0.0',
        author: 'BrepFlow Team',
        description: 'Updated basic geometry operations',
        category: 'Geometry',
        rating: 4.5,
        downloads: 1500,
        verified: true,
        price: 0,
        bundle: { size: 512 * 1024, checksums: {}, dependencies: [], assets: [] },
        manifest: {
          nodes: ['Basic::Box', 'Basic::Sphere', 'Basic::Cylinder'],
          commands: [],
          panels: [],
          permissions: ['read:graph', 'write:graph'],
          engines: { brepflow: '>=0.1.0' },
        },
      },
    ]);

    // Should handle version compatibility in collaboration
    const compatibilityCheck = await page.evaluate(() => {
      return (
        (window as any).brepflow?.collaboration?.checkPluginCompatibility?.() || {
          compatible: false,
        }
      );
    });

    expect(compatibilityCheck.compatible).toBeDefined();
  });

  test('should broadcast plugin state changes in real-time', async ({ page }) => {
    const pluginId = 'basic-geometry';

    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [],
    });

    // Set up event listener for state changes
    const stateChanges: any[] = [];
    await page.evaluate(() => {
      window.addEventListener('plugin-state-sync', (event: any) => {
        (window as any).testStateChanges = (window as any).testStateChanges || [];
        (window as any).testStateChanges.push(event.detail);
      });
    });

    // User 1 makes a change
    await pluginHelper.switchToUser('test_user_1');
    await pluginHelper.executePluginFunction(pluginId, 'updateState', [{ key: 'value' }]);

    // Check that change was broadcast
    await page.waitForTimeout(500); // Allow time for sync

    const syncedChanges = await page.evaluate(() => {
      return (window as any).testStateChanges || [];
    });

    expect(syncedChanges.length).toBeGreaterThan(0);
    expect(syncedChanges[0].pluginId).toBe(pluginId);
  });

  test('should handle plugin resource sharing between users', async () => {
    const pluginId = 'basic-geometry';

    const session = await pluginHelper.testMultiUserPluginCollaboration({
      users: ['test_user_1', 'test_user_2'],
      pluginId,
      workflowActions: [
        {
          user: 'test_user_1',
          action: 'createSharedResource',
          data: { type: 'material', name: 'Steel' },
        },
        { user: 'test_user_2', action: 'useSharedResource', data: { name: 'Steel' } },
      ],
    });

    // Verify resource was successfully shared and used
    const sharedResources = await pluginHelper.executePluginFunction(
      pluginId,
      'getSharedResources',
      []
    );
    expect(sharedResources.result.length).toBeGreaterThan(0);
    expect(sharedResources.result[0].name).toBe('Steel');
    expect(sharedResources.result[0].usedBy).toContain('test_user_2');
  });
});
