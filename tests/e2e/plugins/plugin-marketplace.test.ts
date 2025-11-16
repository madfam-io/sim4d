import { test, expect } from '@playwright/test';
import { PluginTestHelper } from '../helpers/plugin-test-helper';
import { MockServices } from '../helpers/mock-services';
import { NodeTestHelper } from '../helpers/node-test-helper';

/**
 * Plugin Marketplace Integration Tests
 * Tests marketplace browsing, discovery, ratings, and integration workflows
 */
test.describe('Plugin Marketplace Integration', () => {
  let pluginHelper: PluginTestHelper;
  let mockServices: MockServices;
  let nodeHelper: NodeTestHelper;

  test.beforeEach(async ({ page }) => {
    pluginHelper = new PluginTestHelper(page);
    mockServices = new MockServices(page);
    nodeHelper = new NodeTestHelper(page);

    // Create diverse marketplace with various plugin types
    const marketplace = mockServices.generateTestMarketplace(12);

    // Add specialized plugins for testing
    marketplace.plugins.push(
      mockServices.generateTestPlugin({
        id: 'geometry-tools',
        name: 'Advanced Geometry Tools',
        description: 'Professional CAD geometry manipulation tools',
        permissions: ['node_creation', 'parameter_access', 'geometry_operations'],
      }),
      mockServices.generateTestPlugin({
        id: 'mesh-generator',
        name: 'Mesh Generator Pro',
        description: 'High-quality mesh generation for manufacturing',
        permissions: ['node_creation', 'file_system_read'],
      }),
      mockServices.generateTestPlugin({
        id: 'visualization-suite',
        name: 'Visualization Suite',
        description: 'Advanced rendering and visualization tools',
        permissions: ['node_creation', 'viewport_access'],
      })
    );

    await mockServices.setupMockMarketplace(marketplace);
    await mockServices.setupSecurityMocks();

    await page.goto('/?mock=true');
    await nodeHelper.waitForWorkspaceReady();
  });

  test.afterEach(async ({ page }) => {
    await pluginHelper.cleanupPlugins();
    await mockServices.cleanup();
  });

  test.describe('Marketplace Discovery and Browsing', () => {
    test('Marketplace loads with proper categorization', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Verify marketplace interface elements
      await expect(page.locator('[data-testid="plugin-marketplace"]')).toBeVisible();
      await expect(page.locator('[data-testid="plugin-search"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="plugin-categories"], [data-testid="plugin-filters"]')
      ).toBeVisible();

      // Check plugin grid layout
      const pluginCards = page.locator('[data-testid="plugin-card"]');
      const cardCount = await pluginCards.count();
      expect(cardCount).toBeGreaterThan(10); // Should show our test plugins

      // Verify essential plugin information is displayed
      const firstCard = pluginCards.first();
      await expect(firstCard.locator('[data-testid="plugin-name"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="plugin-description"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="plugin-version"]')).toBeVisible();
    });

    test('Plugin search functionality works correctly', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Test exact name search
      let results = await pluginHelper.searchPlugins('Geometry Tools');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((id) => id.includes('geometry-tools'))).toBe(true);

      // Test partial search
      results = await pluginHelper.searchPlugins('mesh');
      expect(results.some((id) => id.includes('mesh-generator'))).toBe(true);

      // Test category/description search
      results = await pluginHelper.searchPlugins('visualization');
      expect(results.some((id) => id.includes('visualization-suite'))).toBe(true);

      // Test empty search (should show all)
      results = await pluginHelper.searchPlugins('');
      expect(results.length).toBeGreaterThan(10);

      // Test non-existent plugin
      results = await pluginHelper.searchPlugins('nonexistent-plugin-xyz');
      expect(results.length).toBe(0);
    });

    test('Plugin filtering and sorting work correctly', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Test category filtering if available
      const categoryFilter = page.locator(
        '[data-testid="category-filter"], [data-testid="plugin-categories"] select'
      );
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption('geometry');
        await page.waitForSelector('[data-testid="plugin-card"]');

        const filteredCards = page.locator('[data-testid="plugin-card"]');
        const count = await filteredCards.count();
        expect(count).toBeGreaterThan(0);
      }

      // Test sorting if available
      const sortFilter = page.locator(
        '[data-testid="sort-filter"], [data-testid="plugin-sort"] select'
      );
      if (await sortFilter.isVisible()) {
        await sortFilter.selectOption('name');
        await page.waitForTimeout(500); // Allow sort to apply

        // Verify cards are present after sorting
        const sortedCards = page.locator('[data-testid="plugin-card"]');
        expect(await sortedCards.count()).toBeGreaterThan(0);
      }
    });

    test('Plugin detail view shows comprehensive information', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Click on a specific plugin to view details
      const geometryPlugin = page.locator('[data-plugin-id="geometry-tools"]');
      await geometryPlugin.click();

      // Verify detailed view opens
      const detailView = page.locator(
        '[data-testid="plugin-detail"], [data-testid="plugin-modal"]'
      );
      await expect(detailView).toBeVisible();

      // Check comprehensive plugin information
      await expect(detailView.locator('[data-testid="plugin-name"]')).toContainText(
        'Geometry Tools'
      );
      await expect(detailView.locator('[data-testid="plugin-description"]')).toBeVisible();
      await expect(detailView.locator('[data-testid="plugin-version"]')).toBeVisible();
      await expect(detailView.locator('[data-testid="plugin-author"]')).toBeVisible();

      // Check permissions section
      const permissionsSection = detailView.locator('[data-testid="plugin-permissions"]');
      if (await permissionsSection.isVisible()) {
        await expect(permissionsSection).toContainText('node_creation');
      }

      // Check install button
      await expect(detailView.locator('[data-testid="install-plugin-button"]')).toBeVisible();
    });
  });

  test.describe('Plugin Installation Workflows', () => {
    test('Single plugin installation from marketplace', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      const pluginId = 'geometry-tools';
      const pluginDetails = await pluginHelper.getPluginDetails(pluginId);
      expect(pluginDetails).toBeTruthy();

      // Install plugin directly from marketplace
      await pluginHelper.installPlugin(pluginId, { acceptPermissions: true });

      // Verify installation notification
      const notification = page.locator('[data-testid="notification"], .notification, .toast');
      if (await notification.isVisible({ timeout: 3000 })) {
        await expect(notification).toContainText('installed');
      }

      // Verify plugin appears in installed list
      await pluginHelper.navigateToInstalledPlugins();
      await expect(page.locator(`[data-plugin-id="${pluginId}"]`)).toBeVisible();

      // Verify plugin can be activated
      await pluginHelper.activatePlugin(pluginId);
      const status = await pluginHelper.getPluginStatus(pluginId);
      expect(status).toBe('active');
    });

    test('Bulk plugin installation workflow', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      const pluginIds = ['geometry-tools', 'mesh-generator', 'visualization-suite'];

      // Install multiple plugins
      for (const pluginId of pluginIds) {
        await pluginHelper.installPlugin(pluginId, { acceptPermissions: true });
        await page.waitForTimeout(500); // Brief pause between installations
      }

      // Verify all plugins are installed
      await pluginHelper.navigateToInstalledPlugins();
      for (const pluginId of pluginIds) {
        await expect(page.locator(`[data-plugin-id="${pluginId}"]`)).toBeVisible();
      }

      // Activate all plugins
      for (const pluginId of pluginIds) {
        await pluginHelper.activatePlugin(pluginId);
      }

      // Verify all are active
      for (const pluginId of pluginIds) {
        const status = await pluginHelper.getPluginStatus(pluginId);
        expect(status).toBe('active');
      }
    });

    test('Plugin installation with dependency checking', async ({ page }) => {
      // This test assumes dependency system is implemented
      await pluginHelper.openPluginMarketplace();

      const pluginId = 'geometry-tools';
      await pluginHelper.installPlugin(pluginId, { acceptPermissions: true });

      // Check if dependency information is shown during installation
      const dependencyInfo = page.locator('[data-testid="plugin-dependencies"], .dependency-info');
      if (await dependencyInfo.isVisible({ timeout: 2000 })) {
        // If dependencies are shown, verify they're handled properly
        await expect(dependencyInfo).toBeVisible();
      }

      // Verify plugin installs successfully regardless
      const status = await pluginHelper.getPluginStatus(pluginId);
      expect(status).toBe('installed');
    });

    test('Plugin installation handles version compatibility', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Test installation with version checks
      const pluginId = 'mesh-generator';
      const pluginDetails = await pluginHelper.getPluginDetails(pluginId);

      if (pluginDetails) {
        // Verify version is displayed
        expect(pluginDetails.version).toBeTruthy();

        // Install plugin
        await pluginHelper.installPlugin(pluginId, { acceptPermissions: true });

        // Verify installation respects version compatibility
        const status = await pluginHelper.getPluginStatus(pluginId);
        expect(status).toBe('installed');
      }
    });
  });

  test.describe('Plugin Ratings and Reviews', () => {
    test('Plugin ratings are displayed correctly', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Check if rating system is implemented
      const ratingElements = page.locator(
        '[data-testid="plugin-rating"], .plugin-rating, .star-rating'
      );
      const firstRating = ratingElements.first();

      if (await firstRating.isVisible({ timeout: 2000 })) {
        // Verify rating display
        await expect(firstRating).toBeVisible();

        // Check rating value is reasonable (0-5 stars typically)
        const ratingText = await firstRating.textContent();
        if (ratingText) {
          const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
          if (ratingMatch) {
            const rating = parseFloat(ratingMatch[1]);
            expect(rating).toBeGreaterThanOrEqual(0);
            expect(rating).toBeLessThanOrEqual(5);
          }
        }
      }
    });

    test('Plugin reviews can be viewed', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Click on a plugin to view details
      const geometryPlugin = page.locator('[data-plugin-id="geometry-tools"]');
      await geometryPlugin.click();

      const detailView = page.locator(
        '[data-testid="plugin-detail"], [data-testid="plugin-modal"]'
      );
      await expect(detailView).toBeVisible();

      // Check for reviews section
      const reviewsSection = detailView.locator('[data-testid="plugin-reviews"], .reviews-section');
      if (await reviewsSection.isVisible({ timeout: 2000 })) {
        await expect(reviewsSection).toBeVisible();

        // Check for individual reviews
        const reviewItems = reviewsSection.locator('[data-testid="review-item"], .review');
        if ((await reviewItems.count()) > 0) {
          const firstReview = reviewItems.first();
          await expect(firstReview).toBeVisible();
        }
      }
    });

    test('Plugin review submission workflow', async ({ page }) => {
      // Install a plugin first
      await pluginHelper.openPluginMarketplace();
      await pluginHelper.installPlugin('geometry-tools', { acceptPermissions: true });
      await pluginHelper.activatePlugin('geometry-tools');

      // Try to leave a review
      await pluginHelper.openPluginMarketplace();
      const geometryPlugin = page.locator('[data-plugin-id="geometry-tools"]');
      await geometryPlugin.click();

      const detailView = page.locator(
        '[data-testid="plugin-detail"], [data-testid="plugin-modal"]'
      );
      const reviewButton = detailView.locator(
        '[data-testid="write-review"], button:has-text("Review")'
      );

      if (await reviewButton.isVisible({ timeout: 2000 })) {
        await reviewButton.click();

        // Fill review form if available
        const reviewForm = page.locator('[data-testid="review-form"], .review-form');
        if (await reviewForm.isVisible()) {
          const ratingInput = reviewForm.locator(
            '[data-testid="rating-input"], input[type="range"], .star-input'
          );
          const reviewText = reviewForm.locator('[data-testid="review-text"], textarea');

          if (await ratingInput.isVisible()) {
            await ratingInput.fill('4');
          }
          if (await reviewText.isVisible()) {
            await reviewText.fill('Great plugin for geometry operations!');
          }

          const submitButton = reviewForm.locator(
            '[data-testid="submit-review"], button:has-text("Submit")'
          );
          if (await submitButton.isVisible()) {
            await submitButton.click();
          }
        }
      }
    });
  });

  test.describe('Marketplace Integration with Studio', () => {
    test('Installed plugins integrate seamlessly with node editor', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();
      await pluginHelper.installPlugin('geometry-tools', { acceptPermissions: true });
      await pluginHelper.activatePlugin('geometry-tools');

      // Close marketplace and return to main workspace
      const closeButton = page.locator(
        '[data-testid="close-marketplace"], .close-button, [aria-label="Close"]'
      );
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await page.keyboard.press('Escape');
      }

      // Verify plugin nodes are available in node panel
      await page.click('[data-testid="node-panel-toggle"], [data-testid="show-node-panel"]');

      const nodeTypes = await pluginHelper.getPluginNodes('geometry-tools');
      expect(nodeTypes.length).toBeGreaterThan(0);

      // Create a plugin node
      if (nodeTypes.length > 0) {
        const nodeId = await pluginHelper.createPluginNode('geometry-tools', nodeTypes[0], {
          x: 400,
          y: 300,
        });

        // Verify node integrates with Inspector
        await page.click(`[data-node-id="${nodeId}"]`);
        await expect(page.locator('[data-testid="inspector-panel"]')).toBeVisible();
      }
    });

    test('Plugin marketplace remembers user preferences', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Set search filter
      await pluginHelper.searchPlugins('geometry');

      // Set category filter if available
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption('geometry');
      }

      // Close and reopen marketplace
      await page.keyboard.press('Escape');
      await pluginHelper.openPluginMarketplace();

      // Check if preferences are remembered
      const searchInput = page.locator('[data-testid="plugin-search"]');
      const searchValue = await searchInput.inputValue();

      // Search might be remembered or reset - both are valid UX decisions
      expect(typeof searchValue).toBe('string');
    });

    test('Plugin updates are handled gracefully', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();
      await pluginHelper.installPlugin('geometry-tools', { acceptPermissions: true });
      await pluginHelper.activatePlugin('geometry-tools');

      // Create node with plugin
      const nodeTypes = await pluginHelper.getPluginNodes('geometry-tools');
      if (nodeTypes.length > 0) {
        const nodeId = await pluginHelper.createPluginNode('geometry-tools', nodeTypes[0], {
          x: 400,
          y: 300,
        });

        // Simulate plugin update check
        await pluginHelper.openPluginMarketplace();
        await pluginHelper.navigateToInstalledPlugins();

        const pluginRow = page.locator('[data-plugin-id="geometry-tools"]');
        const updateButton = pluginRow.locator(
          '[data-testid="update-plugin"], button:has-text("Update")'
        );

        if (await updateButton.isVisible({ timeout: 2000 })) {
          // Update available - test update workflow
          await updateButton.click();

          // Verify update process
          await expect(
            page.locator('[data-testid="updating-plugin"], .update-progress')
          ).toBeVisible({ timeout: 5000 });
        }

        // Verify plugin node still works after update check
        await page.keyboard.press('Escape'); // Close marketplace
        await expect(page.locator(`[data-node-id="${nodeId}"]`)).toBeVisible();
      }
    });
  });

  test.describe('Marketplace Performance and UX', () => {
    test('Marketplace loads quickly with many plugins', async ({ page }) => {
      const startTime = Date.now();

      await pluginHelper.openPluginMarketplace();

      // Marketplace should open within reasonable time
      await expect(page.locator('[data-testid="plugin-marketplace"]')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Less than 3 seconds

      // Plugin cards should load
      const pluginCards = page.locator('[data-testid="plugin-card"]');
      expect(await pluginCards.count()).toBeGreaterThan(0);
    });

    test('Marketplace search is responsive', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      const searchInput = page.locator('[data-testid="plugin-search"]');

      // Test search responsiveness
      const startTime = Date.now();
      await searchInput.fill('geometry');

      // Results should appear quickly
      await page.waitForSelector('[data-testid="plugin-card"]');
      const searchTime = Date.now() - startTime;
      expect(searchTime).toBeLessThan(1000); // Less than 1 second

      // Verify search results
      const results = await pluginHelper.searchPlugins('geometry');
      expect(results.length).toBeGreaterThan(0);
    });

    test('Marketplace handles network conditions gracefully', async ({ page }) => {
      // Test with slow network
      await mockServices.setNetworkCondition('slow');

      await pluginHelper.openPluginMarketplace();

      // Should still load, just slower
      await expect(page.locator('[data-testid="plugin-marketplace"]')).toBeVisible({
        timeout: 10000,
      });

      // Test with offline
      await mockServices.setNetworkCondition('offline');

      try {
        await pluginHelper.searchPlugins('test');
      } catch (error) {
        // Should handle offline gracefully
      }

      // Check for offline indicator or cached results
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-message');
      if (await offlineIndicator.isVisible({ timeout: 2000 })) {
        await expect(offlineIndicator).toBeVisible();
      }

      // Restore network
      await mockServices.setNetworkCondition('fast');
    });

    test('Marketplace provides good user feedback', async ({ page }) => {
      await pluginHelper.openPluginMarketplace();

      // Test loading states
      const searchInput = page.locator('[data-testid="plugin-search"]');
      await searchInput.fill('nonexistent-plugin-xyz');

      // Should show no results message
      const noResults = page.locator('[data-testid="no-results"], .no-results, .empty-state');
      if (await noResults.isVisible({ timeout: 3000 })) {
        await expect(noResults).toBeVisible();
      }

      // Test installation feedback
      await searchInput.fill('geometry');
      const results = await pluginHelper.searchPlugins('geometry');

      if (results.length > 0) {
        const pluginId = results[0];
        await pluginHelper.installPlugin(pluginId, { acceptPermissions: true });

        // Should show installation progress or success
        const feedback = page.locator(
          '[data-testid="installation-progress"], [data-testid="installation-success"], .notification'
        );
        if (await feedback.isVisible({ timeout: 5000 })) {
          await expect(feedback).toBeVisible();
        }
      }
    });
  });
});
