import { Page, Locator, expect } from '@playwright/test';
import { NodeTestHelper } from '../helpers/node-test-helper';
import { ViewportTestHelper } from '../helpers/viewport-test-helper';
import { InspectorTestHelper } from '../helpers/inspector-test-helper';

export interface PluginTestContext {
  pluginId: string;
  manifest: PluginManifest;
  permissions: PluginPermission[];
  sandbox: PluginSandboxConfig;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  nodes?: string[];
  commands?: string[];
  panels?: string[];
  permissions?: PluginPermission[];
}

export enum PluginPermission {
  READ_GRAPH = 'read:graph',
  WRITE_GRAPH = 'write:graph',
  READ_FILES = 'read:files',
  WRITE_FILES = 'write:files',
  NETWORK_FETCH = 'network:fetch',
  WORKER_SPAWN = 'worker:spawn',
  UI_MODAL = 'ui:modal',
  UI_NOTIFICATION = 'ui:notification',
  UI_PANEL = 'ui:panel',
}

export interface PluginSandboxConfig {
  memoryLimit: number;
  timeoutMs: number;
  networkAllowlist: string[];
  storageQuota: number;
  isolated: boolean;
}

export interface PluginExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  memoryUsed: number;
}

export interface CollaborationSession {
  sessionId: string;
  users: string[];
  pluginStates: Map<string, any>;
}

/**
 * Comprehensive helper class for plugin ecosystem testing in BrepFlow Studio
 * Provides methods for plugin lifecycle, security validation, marketplace simulation,
 * multi-user collaboration, and execution isolation testing
 */
export class PluginTestHelper {
  private nodeHelper: NodeTestHelper;
  private viewportHelper: ViewportTestHelper;
  private inspectorHelper: InspectorTestHelper;
  private mockMarketplace: MockPluginMarketplace;
  private pluginRegistry: Map<string, PluginTestContext> = new Map();

  constructor(private page: Page) {
    this.nodeHelper = new NodeTestHelper(page);
    this.viewportHelper = new ViewportTestHelper(page);
    this.inspectorHelper = new InspectorTestHelper(page);
    this.mockMarketplace = new MockPluginMarketplace();
  }

  /**
   * === PLUGIN LIFECYCLE MANAGEMENT ===
   */

  /**
   * Wait for plugin marketplace to be ready
   */
  async waitForMarketplaceReady(): Promise<void> {
    await this.page.waitForSelector('[data-testid="plugin-marketplace"], .plugin-marketplace', {
      timeout: 15000,
    });

    // Wait for marketplace to load plugins
    await this.page.waitForSelector('[data-testid="marketplace-ready"], .marketplace-loaded', {
      timeout: 10000,
    });

    await this.page.waitForTimeout(1000);
  }

  /**
   * Browse and search plugins in marketplace
   */
  async browseMarketplace(searchQuery?: string): Promise<PluginManifest[]> {
    await this.waitForMarketplaceReady();

    if (searchQuery) {
      const searchInput = this.page.locator(
        '[data-testid="marketplace-search"], input[placeholder*="Search plugins"]'
      );
      await searchInput.fill(searchQuery);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(1000);
    }

    // Get plugin cards from marketplace
    const pluginCards = await this.page.locator('[data-testid="plugin-card"], .plugin-card').all();
    const plugins: PluginManifest[] = [];

    for (const card of pluginCards) {
      const manifest = await this.extractPluginManifestFromCard(card);
      plugins.push(manifest);
    }

    return plugins;
  }

  /**
   * Install plugin from marketplace
   */
  async installPlugin(
    pluginId: string,
    options: {
      permissions?: PluginPermission[];
      source?: 'marketplace' | 'local' | 'url';
      allowUnsigned?: boolean;
    } = {}
  ): Promise<PluginTestContext> {
    // Navigate to plugin details if in marketplace
    if (options.source !== 'local') {
      await this.navigateToPluginDetails(pluginId);
    }

    // Click install button
    const installButton = this.page.locator(
      `[data-testid="install-plugin-${pluginId}"], button:has-text("Install")`
    );
    await expect(installButton).toBeVisible();
    await installButton.click();

    // Handle permission dialog if present
    if (options.permissions && options.permissions.length > 0) {
      await this.handlePermissionDialog(options.permissions);
    }

    // Wait for installation to complete
    await this.waitForPluginInstallation(pluginId);

    // Verify plugin is installed
    const manifest = await this.getInstalledPluginManifest(pluginId);
    const context: PluginTestContext = {
      pluginId,
      manifest,
      permissions: options.permissions || [],
      sandbox: await this.getPluginSandboxConfig(pluginId),
    };

    this.pluginRegistry.set(pluginId, context);
    return context;
  }

  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    // Navigate to installed plugins
    await this.navigateToInstalledPlugins();

    // Find plugin and click uninstall
    const uninstallButton = this.page.locator(
      `[data-testid="uninstall-${pluginId}"], [data-plugin-id="${pluginId}"] button:has-text("Uninstall")`
    );
    await expect(uninstallButton).toBeVisible();
    await uninstallButton.click();

    // Confirm uninstallation if dialog appears
    const confirmButton = this.page.locator(
      '[data-testid="confirm-uninstall"], button:has-text("Confirm")'
    );
    if (await confirmButton.isVisible({ timeout: 2000 })) {
      await confirmButton.click();
    }

    // Wait for uninstallation to complete
    await this.waitForPluginUninstallation(pluginId);

    this.pluginRegistry.delete(pluginId);
  }

  /**
   * Activate/deactivate plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<void> {
    await this.navigateToInstalledPlugins();

    const toggleButton = this.page.locator(
      `[data-testid="toggle-${pluginId}"], [data-plugin-id="${pluginId}"] [data-testid="plugin-toggle"]`
    );

    const currentState = (await toggleButton.getAttribute('data-enabled')) === 'true';
    if (currentState !== enabled) {
      await toggleButton.click();

      // Wait for toggle to complete
      await this.page.waitForSelector(`[data-plugin-id="${pluginId}"][data-enabled="${enabled}"]`, {
        timeout: 5000,
      });
    }
  }

  /**
   * === SECURITY SANDBOX VALIDATION ===
   */

  /**
   * Test plugin security sandbox isolation
   */
  async validateSandboxIsolation(pluginId: string): Promise<{
    memoryIsolated: boolean;
    networkRestricted: boolean;
    storageIsolated: boolean;
    workerIsolated: boolean;
  }> {
    const context = this.pluginRegistry.get(pluginId);
    if (!context) throw new Error(`Plugin ${pluginId} not found in registry`);

    const results = {
      memoryIsolated: false,
      networkRestricted: false,
      storageIsolated: false,
      workerIsolated: false,
    };

    // Test memory isolation
    results.memoryIsolated = await this.testMemoryIsolation(pluginId);

    // Test network restrictions
    results.networkRestricted = await this.testNetworkRestrictions(
      pluginId,
      context.sandbox.networkAllowlist
    );

    // Test storage isolation
    results.storageIsolated = await this.testStorageIsolation(pluginId);

    // Test worker isolation
    results.workerIsolated = await this.testWorkerIsolation(pluginId);

    return results;
  }

  /**
   * Test permission enforcement
   */
  async validatePermissionEnforcement(
    pluginId: string,
    deniedPermissions: PluginPermission[]
  ): Promise<boolean> {
    const testResults: boolean[] = [];

    for (const permission of deniedPermissions) {
      try {
        const hasAccess = await this.testPermissionAccess(pluginId, permission);
        testResults.push(!hasAccess); // Should NOT have access
      } catch (error) {
        // Error is expected for denied permissions
        testResults.push(true);
      }
    }

    return testResults.every((result) => result === true);
  }

  /**
   * Test plugin signature verification
   */
  async validatePluginSignature(pluginId: string): Promise<{
    isValid: boolean;
    trusted: boolean;
    signatureInfo?: any;
  }> {
    return await this.page.evaluate(async (id) => {
      const pluginManager = (window as any).brepflow?.pluginManager;
      if (!pluginManager) return { isValid: false, trusted: false };

      return await pluginManager.verifyPluginSignature(id);
    }, pluginId);
  }

  /**
   * === MARKETPLACE WORKFLOWS ===
   */

  /**
   * Test plugin discovery and filtering
   */
  async testPluginDiscovery(): Promise<{
    totalPlugins: number;
    categories: string[];
    searchResults: number;
  }> {
    await this.waitForMarketplaceReady();

    // Get total plugins
    const totalPlugins = await this.page.locator('[data-testid="plugin-card"]').count();

    // Get categories
    const categoryElements = await this.page
      .locator('[data-testid="plugin-category"], .plugin-category')
      .all();
    const categories: string[] = [];
    for (const element of categoryElements) {
      const text = await element.textContent();
      if (text) categories.push(text.trim());
    }

    // Test search
    await this.page.fill('[data-testid="marketplace-search"]', 'geometry');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);

    const searchResults = await this.page.locator('[data-testid="plugin-card"]').count();

    return { totalPlugins, categories, searchResults };
  }

  /**
   * Test plugin rating and reviews system
   */
  async testPluginRatings(pluginId: string): Promise<{
    hasRatings: boolean;
    averageRating: number;
    reviewCount: number;
  }> {
    await this.navigateToPluginDetails(pluginId);

    const ratingsSection = this.page.locator('[data-testid="plugin-ratings"], .plugin-ratings');
    const hasRatings = await ratingsSection.isVisible();

    let averageRating = 0;
    let reviewCount = 0;

    if (hasRatings) {
      const ratingText = await this.page.locator('[data-testid="average-rating"]').textContent();
      const countText = await this.page.locator('[data-testid="review-count"]').textContent();

      averageRating = parseFloat(ratingText || '0');
      reviewCount = parseInt(countText?.replace(/\D/g, '') || '0');
    }

    return { hasRatings, averageRating, reviewCount };
  }

  /**
   * === MULTI-USER COLLABORATION ===
   */

  /**
   * Simulate multi-user plugin collaboration
   */
  async testMultiUserPluginCollaboration(sessionConfig: {
    users: string[];
    pluginId: string;
    workflowActions: Array<{ user: string; action: string; data: any }>;
  }): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      sessionId: `collab_${Date.now()}`,
      users: sessionConfig.users,
      pluginStates: new Map(),
    };

    // Initialize collaboration session
    await this.initializeCollaborationSession(session);

    // Install plugin for all users
    for (const user of sessionConfig.users) {
      await this.switchToUser(user);
      await this.installPlugin(sessionConfig.pluginId);
    }

    // Execute workflow actions
    for (const action of sessionConfig.workflowActions) {
      await this.switchToUser(action.user);
      await this.executePluginAction(sessionConfig.pluginId, action.action, action.data);

      // Capture plugin state after action
      const state = await this.getPluginState(sessionConfig.pluginId);
      session.pluginStates.set(`${action.user}_${action.action}`, state);
    }

    return session;
  }

  /**
   * Test plugin state synchronization across users
   */
  async validatePluginStateSynchronization(
    sessionId: string,
    pluginId: string
  ): Promise<{
    synchronized: boolean;
    conflicts: any[];
    latencyMs: number;
  }> {
    const startTime = Date.now();

    // Trigger state change from user 1
    await this.switchToUser('user1');
    const initialState = { param1: Math.random() };
    await this.setPluginState(pluginId, initialState);

    // Check state propagation to user 2
    await this.switchToUser('user2');

    let synchronized = false;
    const maxWaitTime = 5000;
    const checkInterval = 100;
    let elapsed = 0;

    while (elapsed < maxWaitTime && !synchronized) {
      const user2State = await this.getPluginState(pluginId);
      synchronized = JSON.stringify(user2State) === JSON.stringify(initialState);

      if (!synchronized) {
        await this.page.waitForTimeout(checkInterval);
        elapsed += checkInterval;
      }
    }

    const latencyMs = Date.now() - startTime;

    return {
      synchronized,
      conflicts: [], // NOTE: Conflict detection not yet implemented for plugin tests.
      latencyMs,
    };
  }

  /**
   * === PLUGIN EXECUTION & ISOLATION ===
   */

  /**
   * Execute plugin function and measure performance
   */
  async executePluginFunction(
    pluginId: string,
    functionName: string,
    args: any[] = []
  ): Promise<PluginExecutionResult> {
    const startTime = Date.now();

    try {
      const result = await this.page.evaluate(
        async (data) => {
          const { pluginId, functionName, args } = data;
          const pluginManager = (window as any).brepflow?.pluginManager;

          if (!pluginManager) throw new Error('Plugin manager not available');

          return await pluginManager.executePlugin(pluginId, functionName, args);
        },
        { pluginId, functionName, args }
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        result,
        executionTime,
        memoryUsed: await this.getPluginMemoryUsage(pluginId),
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        executionTime,
        memoryUsed: 0,
      };
    }
  }

  /**
   * Test plugin resource management
   */
  async testPluginResourceManagement(pluginId: string): Promise<{
    memoryLeaks: boolean;
    timeoutHandling: boolean;
    resourceCleanup: boolean;
  }> {
    const results = {
      memoryLeaks: false,
      timeoutHandling: false,
      resourceCleanup: false,
    };

    // Test memory leaks
    const initialMemory = await this.getPluginMemoryUsage(pluginId);

    // Execute multiple operations
    for (let i = 0; i < 10; i++) {
      await this.executePluginFunction(pluginId, 'testMemoryOperation', []);
    }

    const finalMemory = await this.getPluginMemoryUsage(pluginId);
    results.memoryLeaks = finalMemory > initialMemory * 2; // Threshold for leak detection

    // Test timeout handling
    try {
      await this.executePluginFunction(pluginId, 'longRunningOperation', []);
      results.timeoutHandling = false; // Should have timed out
    } catch (error) {
      results.timeoutHandling = error.message.includes('timeout');
    }

    // Test resource cleanup
    await this.uninstallPlugin(pluginId);
    const residualResources = await this.checkPluginResidualResources(pluginId);
    results.resourceCleanup = residualResources.length === 0;

    return results;
  }

  /**
   * === INTEGRATION WITH EXISTING HELPERS ===
   */

  /**
   * Test plugin node integration with node editor
   */
  async testPluginNodeIntegration(
    pluginId: string,
    nodeType: string
  ): Promise<{
    nodeCreated: boolean;
    parametersWorking: boolean;
    connectionSuccessful: boolean;
    evaluationSuccessful: boolean;
  }> {
    const results = {
      nodeCreated: false,
      parametersWorking: false,
      connectionSuccessful: false,
      evaluationSuccessful: false,
    };

    try {
      // Wait for workspace to be ready
      await this.nodeHelper.waitForWorkspaceReady();

      // Create plugin node
      const nodeId = await this.nodeHelper.createNode(nodeType, {}, { x: 400, y: 300 });
      results.nodeCreated = !!nodeId;

      if (nodeId) {
        // Test parameter editing
        await this.inspectorHelper.editParameter('testParam', '100');
        results.parametersWorking = true;

        // Create another node to test connections
        const box = await this.nodeHelper.createBoxNode(
          { width: 50, height: 50, depth: 50 },
          { x: 200, y: 300 }
        );

        // Test connection
        await this.nodeHelper.connectNodes({
          sourceId: box,
          sourceOutput: 'output',
          targetId: nodeId,
          targetInput: 'input',
        });
        results.connectionSuccessful = true;

        // Test evaluation
        await this.nodeHelper.evaluateGraph();
        results.evaluationSuccessful = !(await this.nodeHelper.nodeHasError(nodeId));
      }
    } catch (error) {
      console.error('Plugin node integration test failed:', error);
    }

    return results;
  }

  /**
   * Test plugin viewport integration
   */
  async testPluginViewportIntegration(pluginId: string): Promise<{
    overlayRendered: boolean;
    interactionWorking: boolean;
    performanceAcceptable: boolean;
  }> {
    const results = {
      overlayRendered: false,
      interactionWorking: false,
      performanceAcceptable: false,
    };

    try {
      await this.viewportHelper.waitForViewportReady();

      // Test overlay rendering
      await this.executePluginFunction(pluginId, 'addViewportOverlay', [
        {
          type: 'line',
          data: [
            [0, 0, 0],
            [100, 100, 100],
          ],
        },
      ]);
      await this.page.waitForTimeout(1000);
      results.overlayRendered = await this.hasViewportOverlay(pluginId);

      // Test interaction
      await this.viewportHelper.clickGeometry();
      const interactionResult = await this.executePluginFunction(
        pluginId,
        'getLastInteraction',
        []
      );
      results.interactionWorking = interactionResult.success;

      // Test performance
      const performanceStart = Date.now();
      for (let i = 0; i < 5; i++) {
        await this.viewportHelper.orbitCamera(10, 10);
      }
      const performanceTime = Date.now() - performanceStart;
      results.performanceAcceptable = performanceTime < 2000; // 2 second threshold
    } catch (error) {
      console.error('Plugin viewport integration test failed:', error);
    }

    return results;
  }

  // === PRIVATE HELPER METHODS ===

  private async extractPluginManifestFromCard(card: Locator): Promise<PluginManifest> {
    const id = (await card.getAttribute('data-plugin-id')) || '';
    const name = (await card.locator('[data-testid="plugin-name"]').textContent()) || '';
    const version = (await card.locator('[data-testid="plugin-version"]').textContent()) || '1.0.0';
    const author = (await card.locator('[data-testid="plugin-author"]').textContent()) || '';
    const description =
      (await card.locator('[data-testid="plugin-description"]').textContent()) || '';

    return { id, name, version, author, description };
  }

  private async navigateToPluginDetails(pluginId: string): Promise<void> {
    await this.page.click(`[data-plugin-id="${pluginId}"]`);
    await this.page.waitForSelector(`[data-testid="plugin-details-${pluginId}"]`, {
      timeout: 5000,
    });
  }

  private async handlePermissionDialog(permissions: PluginPermission[]): Promise<void> {
    const permissionDialog = this.page.locator('[data-testid="permission-dialog"]');
    if (await permissionDialog.isVisible({ timeout: 5000 })) {
      // Check required permissions
      for (const permission of permissions) {
        const checkbox = this.page.locator(`[data-permission="${permission}"]`);
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }
      }

      // Accept permissions
      await this.page.click('[data-testid="accept-permissions"]');
    }
  }

  private async waitForPluginInstallation(pluginId: string): Promise<void> {
    await this.page.waitForSelector(`[data-testid="plugin-installed-${pluginId}"]`, {
      timeout: 30000,
    });
  }

  private async waitForPluginUninstallation(pluginId: string): Promise<void> {
    await this.page.waitForSelector(`[data-testid="plugin-installed-${pluginId}"]`, {
      state: 'hidden',
      timeout: 15000,
    });
  }

  private async navigateToInstalledPlugins(): Promise<void> {
    await this.page.click('[data-testid="installed-plugins-tab"]');
    await this.page.waitForSelector('[data-testid="installed-plugins-list"]', { timeout: 5000 });
  }

  private async getInstalledPluginManifest(pluginId: string): Promise<PluginManifest> {
    return await this.page.evaluate((id) => {
      const pluginManager = (window as any).brepflow?.pluginManager;
      return pluginManager?.getPlugin(id)?.manifest || {};
    }, pluginId);
  }

  private async getPluginSandboxConfig(pluginId: string): Promise<PluginSandboxConfig> {
    return await this.page.evaluate((id) => {
      const pluginManager = (window as any).brepflow?.pluginManager;
      return (
        pluginManager?.getPluginSandbox(id) || {
          memoryLimit: 64 * 1024 * 1024,
          timeoutMs: 30000,
          networkAllowlist: [],
          storageQuota: 10 * 1024 * 1024,
          isolated: true,
        }
      );
    }, pluginId);
  }

  private async testMemoryIsolation(pluginId: string): Promise<boolean> {
    try {
      const result = await this.executePluginFunction(pluginId, 'testMemoryAccess', []);
      return result.success && result.result.isolated === true;
    } catch {
      return true; // Exception indicates proper isolation
    }
  }

  private async testNetworkRestrictions(pluginId: string, allowlist: string[]): Promise<boolean> {
    try {
      const result = await this.executePluginFunction(pluginId, 'testNetworkAccess', []);
      return result.success && result.result.restricted === true;
    } catch {
      return true; // Exception indicates proper restriction
    }
  }

  private async testStorageIsolation(pluginId: string): Promise<boolean> {
    try {
      const result = await this.executePluginFunction(pluginId, 'testStorageAccess', []);
      return result.success && result.result.isolated === true;
    } catch {
      return true; // Exception indicates proper isolation
    }
  }

  private async testWorkerIsolation(pluginId: string): Promise<boolean> {
    try {
      const result = await this.executePluginFunction(pluginId, 'testWorkerAccess', []);
      return result.success && result.result.isolated === true;
    } catch {
      return true; // Exception indicates proper isolation
    }
  }

  private async testPermissionAccess(
    pluginId: string,
    permission: PluginPermission
  ): Promise<boolean> {
    const result = await this.executePluginFunction(pluginId, 'testPermission', [permission]);
    return result.success && result.result.hasAccess === true;
  }

  private async initializeCollaborationSession(session: CollaborationSession): Promise<void> {
    await this.page.evaluate((sessionData) => {
      (window as any).brepflowTestSession = sessionData;
    }, session);
  }

  private async switchToUser(userId: string): Promise<void> {
    await this.page.evaluate((id) => {
      (window as any).brepflowCurrentUser = id;
    }, userId);
  }

  private async executePluginAction(pluginId: string, action: string, data: any): Promise<void> {
    await this.executePluginFunction(pluginId, action, [data]);
  }

  private async getPluginState(pluginId: string): Promise<any> {
    return await this.page.evaluate((id) => {
      const pluginManager = (window as any).brepflow?.pluginManager;
      return pluginManager?.getPluginState(id) || {};
    }, pluginId);
  }

  private async setPluginState(pluginId: string, state: any): Promise<void> {
    await this.page.evaluate(
      (data) => {
        const { pluginId, state } = data;
        const pluginManager = (window as any).brepflow?.pluginManager;
        pluginManager?.setPluginState(pluginId, state);
      },
      { pluginId, state }
    );
  }

  private async getPluginMemoryUsage(pluginId: string): Promise<number> {
    return await this.page.evaluate((id) => {
      const pluginManager = (window as any).brepflow?.pluginManager;
      return pluginManager?.getPluginMemoryUsage(id) || 0;
    }, pluginId);
  }

  private async checkPluginResidualResources(pluginId: string): Promise<string[]> {
    return await this.page.evaluate((id) => {
      const resources: string[] = [];

      // Check for remaining DOM elements
      const elements = document.querySelectorAll(`[data-plugin="${id}"]`);
      if (elements.length > 0) resources.push('DOM elements');

      // Check for remaining event listeners
      const listeners = (window as any).brepflowPluginListeners?.[id];
      if (listeners && listeners.length > 0) resources.push('Event listeners');

      // Check for remaining storage
      const storageKeys = Object.keys(localStorage).filter((key) => key.includes(id));
      if (storageKeys.length > 0) resources.push('Local storage');

      return resources;
    }, pluginId);
  }

  private async hasViewportOverlay(pluginId: string): Promise<boolean> {
    return await this.page.evaluate((id) => {
      const viewport = (window as any).brepflow?.viewport;
      return viewport?.hasPluginOverlay(id) || false;
    }, pluginId);
  }
}

/**
 * Mock plugin marketplace for testing
 */
class MockPluginMarketplace {
  private plugins: PluginManifest[] = [
    {
      id: 'test-geometry-plugin',
      name: 'Test Geometry Plugin',
      version: '1.0.0',
      author: 'Test Author',
      description: 'A test plugin for geometry operations',
      nodes: ['TestGeometry::Box', 'TestGeometry::Cylinder'],
      permissions: [PluginPermission.READ_GRAPH, PluginPermission.WRITE_GRAPH],
    },
    {
      id: 'test-collaboration-plugin',
      name: 'Test Collaboration Plugin',
      version: '2.1.0',
      author: 'Collaboration Team',
      description: 'A test plugin for collaboration features',
      commands: ['shareNode', 'syncState'],
      permissions: [PluginPermission.NETWORK_FETCH, PluginPermission.UI_NOTIFICATION],
    },
  ];

  getPlugins(): PluginManifest[] {
    return this.plugins;
  }

  searchPlugins(query: string): PluginManifest[] {
    return this.plugins.filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(query.toLowerCase()) ||
        plugin.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  getPlugin(id: string): PluginManifest | null {
    return this.plugins.find((plugin) => plugin.id === id) || null;
  }
}
