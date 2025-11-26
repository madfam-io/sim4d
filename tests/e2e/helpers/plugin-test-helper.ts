import { Page, Locator, expect } from '@playwright/test';
import {
  PluginId,
  Plugin,
  PluginInstallOptions,
  PluginExecutionContext,
  PluginPermission,
  PluginStatus,
} from '../../../packages/cloud-services/src/plugins/types';

/**
 * Plugin Test Helper for Sim4D E2E Testing
 * Provides utilities for testing plugin lifecycle, security, and collaboration
 */
export class PluginTestHelper {
  constructor(private page: Page) {}

  // === Plugin Discovery & Marketplace ===

  async openPluginMarketplace(): Promise<void> {
    await this.page.click(
      '[data-testid="plugin-marketplace-button"], [aria-label="Plugin Marketplace"]'
    );
    await expect(this.page.locator('[data-testid="plugin-marketplace"]')).toBeVisible();
  }

  async searchPlugins(query: string): Promise<string[]> {
    await this.page.fill('[data-testid="plugin-search"]', query);
    await this.page.waitForSelector('[data-testid="plugin-search-results"]');

    const pluginCards = this.page.locator('[data-testid="plugin-card"]');
    const count = await pluginCards.count();
    const pluginIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const pluginId = await pluginCards.nth(i).getAttribute('data-plugin-id');
      if (pluginId) pluginIds.push(pluginId);
    }

    return pluginIds;
  }

  async getPluginDetails(pluginId: PluginId): Promise<Plugin | null> {
    const pluginCard = this.page.locator(`[data-plugin-id="${pluginId}"]`);
    if (!(await pluginCard.isVisible())) return null;

    const name = await pluginCard.locator('[data-testid="plugin-name"]').textContent();
    const version = await pluginCard.locator('[data-testid="plugin-version"]').textContent();
    const description = await pluginCard
      .locator('[data-testid="plugin-description"]')
      .textContent();

    return {
      id: pluginId,
      name: name || '',
      version: version || '1.0.0',
      description: description || '',
      author: 'Test Author',
      permissions: [],
      nodes: [],
      entrypoint: '',
      bundle: new Uint8Array(),
      signature: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // === Plugin Installation & Lifecycle ===

  async installPlugin(
    pluginId: PluginId,
    options: Partial<PluginInstallOptions> = {}
  ): Promise<void> {
    const pluginCard = this.page.locator(`[data-plugin-id="${pluginId}"]`);
    await pluginCard.locator('[data-testid="install-plugin-button"]').click();

    // Handle permission dialog if it appears
    if (
      await this.page
        .locator('[data-testid="plugin-permissions-dialog"]')
        .isVisible({ timeout: 2000 })
    ) {
      if (options.acceptPermissions !== false) {
        await this.page.click('[data-testid="accept-permissions-button"]');
      } else {
        await this.page.click('[data-testid="decline-permissions-button"]');
        return;
      }
    }

    // Wait for installation to complete
    await expect(pluginCard.locator('[data-testid="plugin-status"]')).toHaveText('Installed', {
      timeout: 10000,
    });
  }

  async activatePlugin(pluginId: PluginId): Promise<void> {
    await this.navigateToInstalledPlugins();
    const pluginRow = this.page.locator(`[data-plugin-id="${pluginId}"]`);
    await pluginRow.locator('[data-testid="activate-plugin-button"]').click();
    await expect(pluginRow.locator('[data-testid="plugin-status"]')).toHaveText('Active');
  }

  async deactivatePlugin(pluginId: PluginId): Promise<void> {
    await this.navigateToInstalledPlugins();
    const pluginRow = this.page.locator(`[data-plugin-id="${pluginId}"]`);
    await pluginRow.locator('[data-testid="deactivate-plugin-button"]').click();
    await expect(pluginRow.locator('[data-testid="plugin-status"]')).toHaveText('Installed');
  }

  async uninstallPlugin(pluginId: PluginId): Promise<void> {
    await this.navigateToInstalledPlugins();
    const pluginRow = this.page.locator(`[data-plugin-id="${pluginId}"]`);
    await pluginRow.locator('[data-testid="uninstall-plugin-button"]').click();

    // Confirm uninstall in dialog
    await this.page.click('[data-testid="confirm-uninstall-button"]');

    // Wait for plugin to be removed from list
    await expect(pluginRow).not.toBeVisible();
  }

  async getPluginStatus(pluginId: PluginId): Promise<PluginStatus> {
    await this.navigateToInstalledPlugins();
    const pluginRow = this.page.locator(`[data-plugin-id="${pluginId}"]`);
    const statusText = await pluginRow.locator('[data-testid="plugin-status"]').textContent();

    switch (statusText?.toLowerCase()) {
      case 'active':
        return 'active';
      case 'installed':
        return 'installed';
      case 'error':
        return 'error';
      default:
        return 'inactive';
    }
  }

  async navigateToInstalledPlugins(): Promise<void> {
    await this.page.click('[data-testid="installed-plugins-tab"]');
    await expect(this.page.locator('[data-testid="installed-plugins-list"]')).toBeVisible();
  }

  // === Plugin Node Integration ===

  async getPluginNodes(pluginId: PluginId): Promise<string[]> {
    // Navigate to node panel and look for plugin nodes
    await this.page.click('[data-testid="node-panel-toggle"]');

    // Look for plugin section or filter
    const pluginSection = this.page.locator(`[data-testid="plugin-nodes-${pluginId}"]`);
    if (!(await pluginSection.isVisible())) return [];

    const nodeItems = pluginSection.locator('[data-testid="node-item"]');
    const count = await nodeItems.count();
    const nodeTypes: string[] = [];

    for (let i = 0; i < count; i++) {
      const nodeType = await nodeItems.nth(i).getAttribute('data-node-type');
      if (nodeType) nodeTypes.push(nodeType);
    }

    return nodeTypes;
  }

  async createPluginNode(
    pluginId: PluginId,
    nodeType: string,
    position: { x: number; y: number }
  ): Promise<string> {
    // Drag plugin node from panel to canvas
    const nodeItem = this.page.locator(
      `[data-testid="plugin-nodes-${pluginId}"] [data-node-type="${nodeType}"]`
    );
    await nodeItem.dragTo(this.page.locator('[data-testid="workflow-canvas"]'), {
      targetPosition: position,
    });

    // Wait for node to be created and get its ID
    await this.page.waitForSelector('[data-node-id]');
    const nodeElements = this.page.locator('[data-node-id]');
    const count = await nodeElements.count();
    const lastNode = nodeElements.nth(count - 1);
    const nodeId = await lastNode.getAttribute('data-node-id');

    if (!nodeId) throw new Error('Failed to create plugin node');
    return nodeId;
  }

  async executePluginNode(nodeId: string): Promise<void> {
    // Select node and trigger evaluation
    await this.page.click(`[data-node-id="${nodeId}"]`);
    await this.page.click('[data-testid="evaluate-button"]');

    // Wait for execution to complete
    await expect(
      this.page.locator(`[data-node-id="${nodeId}"]`).locator('[data-testid="node-status"]')
    ).not.toHaveClass(/executing|pending/);
  }

  async getPluginNodeError(nodeId: string): Promise<string | null> {
    const nodeElement = this.page.locator(`[data-node-id="${nodeId}"]`);
    const errorElement = nodeElement.locator('[data-testid="node-error"]');

    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }

    return null;
  }

  // === Security & Permissions Testing ===

  async verifyPluginSandbox(pluginId: PluginId): Promise<boolean> {
    // Check if plugin is running in isolated worker
    const workerInfo = await this.page.evaluate(async (id) => {
      // Access the plugin manager from window (if exposed for testing)
      const pluginManager = (window as any).sim4d?.pluginManager;
      if (!pluginManager) return null;

      const sandbox = pluginManager.getSandbox(id);
      return sandbox
        ? {
            isWorker: sandbox.worker instanceof Worker,
            hasIsolatedMemory: sandbox.memoryIsolated,
            permissions: sandbox.permissions,
          }
        : null;
    }, pluginId);

    return workerInfo?.isWorker && workerInfo?.hasIsolatedMemory;
  }

  async testPluginPermissions(
    pluginId: PluginId,
    permissions: PluginPermission[]
  ): Promise<boolean[]> {
    // Test each permission to see if it's properly enforced
    const results: boolean[] = [];

    for (const permission of permissions) {
      const hasPermission = await this.page.evaluate(
        async (args) => {
          const { pluginId, permission } = args;
          const pluginManager = (window as any).sim4d?.pluginManager;
          if (!pluginManager) return false;

          return pluginManager.checkPermission(pluginId, permission);
        },
        { pluginId, permission }
      );

      results.push(hasPermission);
    }

    return results;
  }

  async attemptUnauthorizedAction(pluginId: PluginId, action: string): Promise<boolean> {
    // Try to perform an action the plugin shouldn't have access to
    const blocked = await this.page.evaluate(
      async (args) => {
        const { pluginId, action } = args;
        const pluginManager = (window as any).sim4d?.pluginManager;
        if (!pluginManager) return false;

        try {
          await pluginManager.executeAction(pluginId, action);
          return false; // Action succeeded (bad)
        } catch (error) {
          return true; // Action blocked (good)
        }
      },
      { pluginId, action }
    );

    return blocked;
  }

  // === Multi-User Collaboration ===

  async simulateMultiUserPlugin(pluginId: PluginId, users: number): Promise<void> {
    // This would require coordination with multiple browser contexts
    // For now, simulate by triggering plugin events
    for (let i = 0; i < users; i++) {
      await this.page.evaluate(
        async (args) => {
          const { pluginId, userId } = args;
          const collaborationManager = (window as any).sim4d?.collaborationManager;
          if (collaborationManager) {
            await collaborationManager.simulateUserPluginAction(pluginId, `user-${userId}`);
          }
        },
        { pluginId, userId: i }
      );
    }
  }

  async verifyPluginSync(pluginId: PluginId): Promise<boolean> {
    // Verify plugin state is synchronized across sessions
    const syncStatus = await this.page.evaluate(async (id) => {
      const syncManager = (window as any).sim4d?.cloudSyncManager;
      if (!syncManager) return false;

      return syncManager.isPluginSynced(id);
    }, pluginId);

    return syncStatus;
  }

  // === Performance & Resource Management ===

  async getPluginResourceUsage(pluginId: PluginId): Promise<{
    memory: number;
    cpu: number;
    networkRequests: number;
  }> {
    const usage = await this.page.evaluate(async (id) => {
      const pluginManager = (window as any).sim4d?.pluginManager;
      if (!pluginManager) return { memory: 0, cpu: 0, networkRequests: 0 };

      return pluginManager.getResourceUsage(id);
    }, pluginId);

    return usage;
  }

  async verifyResourceLimits(pluginId: PluginId): Promise<boolean> {
    const withinLimits = await this.page.evaluate(async (id) => {
      const pluginManager = (window as any).sim4d?.pluginManager;
      if (!pluginManager) return false;

      return pluginManager.checkResourceLimits(id);
    }, pluginId);

    return withinLimits;
  }

  // === Test Utilities ===

  async waitForPluginReady(pluginId: PluginId, timeout: number = 5000): Promise<void> {
    await this.page.waitForFunction(
      (id) => {
        const pluginManager = (window as any).sim4d?.pluginManager;
        return pluginManager && pluginManager.isPluginReady(id);
      },
      pluginId,
      { timeout }
    );
  }

  async cleanupPlugins(): Promise<void> {
    // Remove all test plugins
    await this.page.evaluate(() => {
      const pluginManager = (window as any).sim4d?.pluginManager;
      if (pluginManager) {
        pluginManager.cleanup();
      }
    });
  }

  async takePluginScreenshot(pluginId: PluginId, filename: string): Promise<void> {
    // Focus on plugin-related UI elements
    const pluginArea = this.page.locator(`[data-plugin-area="${pluginId}"]`);
    if (await pluginArea.isVisible()) {
      await pluginArea.screenshot({ path: `test-results/screenshots/${filename}` });
    } else {
      await this.page.screenshot({ path: `test-results/screenshots/${filename}` });
    }
  }

  async verifyPluginCleanup(pluginId: PluginId): Promise<boolean> {
    // Verify no plugin artifacts remain after uninstall
    const isClean = await this.page.evaluate(async (id) => {
      // Check for any remaining DOM elements
      const elements = document.querySelectorAll(`[data-plugin-id="${id}"]`);
      if (elements.length > 0) return false;

      // Check for any remaining workers or resources
      const pluginManager = (window as any).sim4d?.pluginManager;
      if (pluginManager && pluginManager.hasPluginResources(id)) return false;

      return true;
    }, pluginId);

    return isClean;
  }
}
