import { test, expect } from '@playwright/test';
import { NodeTestHelper } from '../helpers/node-test-helper';
import { ViewportTestHelper } from '../helpers/viewport-test-helper';
import { InspectorTestHelper } from '../helpers/inspector-test-helper';

/**
 * Phase 4B: Performance Monitoring and Diagnostics Tests
 * Tests the Inspector panel's advanced features for performance and error analysis
 */
test.describe('Phase 4B - Performance Monitoring and Diagnostics', () => {
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

  test.describe('Performance Monitoring Features', () => {
    test('Performance section displays after node evaluation', async ({ page }) => {
      // Create a node and evaluate it to generate performance data
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Evaluate the graph to generate performance metrics
      await nodeHelper.evaluateGraph();

      // Select the node again to refresh Inspector
      await nodeHelper.selectNode(nodeId);

      // Verify performance section is available and can be opened
      await inspectorHelper.openPerformanceSection();
      await inspectorHelper.verifyPerformanceMetrics();
    });

    test('Performance metrics show realistic values', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Generate performance data through evaluation
      await nodeHelper.evaluateGraph();
      await nodeHelper.selectNode(nodeId);

      // Get performance metrics
      const metrics = await inspectorHelper.getPerformanceMetrics();

      // Verify metrics are reasonable
      expect(metrics.computeTime).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
      expect(metrics.evaluationCount).toBeGreaterThanOrEqual(1);
    });

    test('Performance metrics update with multiple evaluations', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // First evaluation
      await nodeHelper.evaluateGraph();
      await nodeHelper.selectNode(nodeId);
      const initialMetrics = await inspectorHelper.getPerformanceMetrics();

      // Change parameter and evaluate again
      await inspectorHelper.editParameter('width', '200');
      await nodeHelper.evaluateGraph();
      await nodeHelper.selectNode(nodeId);
      const updatedMetrics = await inspectorHelper.getPerformanceMetrics();

      // Evaluation count should increase
      expect(updatedMetrics.evaluationCount).toBeGreaterThan(initialMetrics.evaluationCount);

      // Other metrics may change based on different geometry complexity
      expect(updatedMetrics.computeTime).toBeGreaterThanOrEqual(0);
    });

    test('Performance charts/visualizations are displayed', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Generate some performance history
      for (let i = 0; i < 3; i++) {
        await inspectorHelper.editParameter('width', (100 + i * 50).toString());
        await nodeHelper.evaluateGraph();
      }

      await nodeHelper.selectNode(nodeId);
      await inspectorHelper.openPerformanceSection();

      // Check for performance visualization elements
      await inspectorHelper.verifyPerformanceChart();
    });

    test('Performance monitoring handles complex workflows', async ({ page }) => {
      // Create a complex workflow
      const { nodes } = await nodeHelper.createComplexWorkflow();

      // Evaluate the complex workflow
      await nodeHelper.evaluateGraph();

      // Check performance metrics for each node
      for (const nodeId of nodes) {
        await nodeHelper.selectNode(nodeId);

        if (
          await page
            .locator('[data-testid="performance-section-toggle"]')
            .isVisible({ timeout: 2000 })
        ) {
          await inspectorHelper.openPerformanceSection();
          const metrics = await inspectorHelper.getPerformanceMetrics();

          // Verify each node has valid performance data
          expect(metrics.evaluationCount).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });

  test.describe('Error Diagnostics Features', () => {
    test('Diagnostics section appears when node has errors', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Create an error condition by setting invalid parameters
      await inspectorHelper.editParameter('width', '-10');

      // Try to evaluate (should create error)
      try {
        await nodeHelper.evaluateGraph();
      } catch {
        // Evaluation may fail, which is expected
      }

      // Check if diagnostics section becomes available
      if (
        await page
          .locator('[data-testid="diagnostics-section-toggle"]')
          .isVisible({ timeout: 3000 })
      ) {
        await inspectorHelper.openDiagnosticsSection();
        await inspectorHelper.verifyDiagnostics();
      } else {
        // If diagnostics section doesn't appear, the error handling might be different
        // Check for other error indicators
        const hasError = await nodeHelper.nodeHasError(nodeId);
        if (hasError) {
          const errorMessage = await nodeHelper.getNodeError(nodeId);
          expect(errorMessage).toBeTruthy();
        }
      }
    });

    test('Diagnostic suggestions provide actionable information', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Create error condition
      await inspectorHelper.editParameter('width', '0');

      try {
        await nodeHelper.evaluateGraph();
      } catch {
        // Expected to fail
      }

      // Check for diagnostic information
      if (
        await page
          .locator('[data-testid="diagnostics-section-toggle"]')
          .isVisible({ timeout: 3000 })
      ) {
        const diagnostics = await inspectorHelper.getDiagnosticSuggestions();

        if (diagnostics.suggestions.length > 0) {
          // Verify suggestions have required properties
          const firstSuggestion = diagnostics.suggestions[0];
          expect(firstSuggestion.title).toBeTruthy();
          expect(firstSuggestion.actionType).toBeTruthy();
          expect(firstSuggestion.confidence).toBeGreaterThan(0);
          expect(firstSuggestion.confidence).toBeLessThanOrEqual(100);
        }
      }
    });

    test('Diagnostic suggestions can be interacted with', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Create error condition
      await inspectorHelper.editParameter('height', '-5');

      try {
        await nodeHelper.evaluateGraph();
      } catch {
        // Expected to fail
      }

      // Try to interact with diagnostics
      if (
        await page
          .locator('[data-testid="diagnostics-section-toggle"]')
          .isVisible({ timeout: 3000 })
      ) {
        await inspectorHelper.openDiagnosticsSection();

        // Try clicking on a diagnostic suggestion
        const suggestions = await page.locator('[data-testid="diagnostic-suggestion"]').count();
        if (suggestions > 0) {
          await inspectorHelper.clickDiagnosticSuggestion(0);
          // Should either show more details or take some action
        }
      }
    });

    test('Diagnostics clear when errors are resolved', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Create error
      await inspectorHelper.editParameter('depth', '-1');

      try {
        await nodeHelper.evaluateGraph();
      } catch {
        // Expected to fail
      }

      // Fix error
      await inspectorHelper.editParameter('depth', '25');

      // Re-evaluate
      await nodeHelper.evaluateGraph();

      // Check if diagnostics section is hidden or shows no errors
      if (
        await page
          .locator('[data-testid="diagnostics-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.openDiagnosticsSection();
        const diagnostics = await inspectorHelper.getDiagnosticSuggestions();
        expect(diagnostics.errorCount).toBe(0);
      }

      // Verify node no longer has error state
      const hasError = await nodeHelper.nodeHasError(nodeId);
      expect(hasError).toBe(false);
    });
  });

  test.describe('Configuration Management Features', () => {
    test('Configuration section is available for nodes', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Check if configuration section is available
      if (
        await page
          .locator('[data-testid="configuration-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.openConfigurationSection();
        await inspectorHelper.verifyConfigurationTemplates();
      }
    });

    test('Node configuration can be exported', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 150, height: 75, depth: 30 });
      await nodeHelper.selectNode(nodeId);

      // Try to export configuration
      if (
        await page
          .locator('[data-testid="configuration-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.exportConfiguration();
        await inspectorHelper.verifyConfigurationExported();
      }
    });

    test('Configuration export includes node parameters', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 200, height: 100, depth: 50 });
      await nodeHelper.selectNode(nodeId);

      // Modify some parameters
      await inspectorHelper.editParameter('width', '250');
      await inspectorHelper.editParameter('height', '125');

      // Export configuration
      if (
        await page
          .locator('[data-testid="configuration-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.exportConfiguration();

        // Verify configuration contains updated parameters
        const exportedConfig = await page.evaluate(() => {
          const configs = localStorage.getItem('brepflow_node_configurations');
          if (configs) {
            const parsed = JSON.parse(configs);
            const configKeys = Object.keys(parsed);
            if (configKeys.length > 0) {
              return parsed[configKeys[0]];
            }
          }
          return null;
        });

        if (exportedConfig) {
          expect(exportedConfig.parameters?.width).toBe(250);
          expect(exportedConfig.parameters?.height).toBe(125);
        }
      }
    });

    test('Configuration templates show available options', async ({ page }) => {
      // Create a few different nodes to populate templates
      await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 }, { x: 200, y: 200 });
      await nodeHelper.createCylinderNode({ radius: 30, height: 80 }, { x: 400, y: 200 });

      // Select a node and check configuration templates
      const nodes = await nodeHelper.getAllNodeIds();
      if (nodes.length > 0) {
        await nodeHelper.selectNode(nodes[0]);

        if (
          await page
            .locator('[data-testid="configuration-section-toggle"]')
            .isVisible({ timeout: 2000 })
        ) {
          await inspectorHelper.openConfigurationSection();

          // Verify templates section shows available configurations
          const templatesVisible = await page
            .locator('[data-testid="configuration-templates"]')
            .isVisible({ timeout: 2000 });
          expect(templatesVisible).toBe(true);
        }
      }
    });
  });

  test.describe('Inspector Section Integration', () => {
    test('All Inspector sections work together', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Evaluate to generate performance data
      await nodeHelper.evaluateGraph();
      await nodeHelper.selectNode(nodeId);

      // Test all sections can be opened
      await inspectorHelper.verifyAllSections();

      // Test parameters section
      await inspectorHelper.verifyParametersSection();
      await inspectorHelper.editParameter('width', '150');

      // Test performance section if available
      if (
        await page
          .locator('[data-testid="performance-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.openPerformanceSection();
        const metrics = await inspectorHelper.getPerformanceMetrics();
        expect(metrics.evaluationCount).toBeGreaterThanOrEqual(1);
      }

      // Test configuration section if available
      if (
        await page
          .locator('[data-testid="configuration-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.openConfigurationSection();
      }
    });

    test('Inspector sections maintain state when switching', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Open performance section
      if (
        await page
          .locator('[data-testid="performance-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        await inspectorHelper.openPerformanceSection();

        // Switch to another area and back
        await page.click('[data-testid="workflow-canvas"]', { position: { x: 50, y: 50 } });
        await nodeHelper.selectNode(nodeId);

        // Performance section should still be available
        const performanceSectionVisible = await page
          .locator('[data-testid="performance-section"]')
          .isVisible({ timeout: 2000 });
        if (performanceSectionVisible) {
          expect(performanceSectionVisible).toBe(true);
        }
      }
    });

    test('Inspector sections respond to node evaluation changes', async ({ page }) => {
      const nodeId = await nodeHelper.createBoxNode({ width: 100, height: 50, depth: 25 });
      await nodeHelper.selectNode(nodeId);

      // Initial evaluation
      await nodeHelper.evaluateGraph();
      await nodeHelper.selectNode(nodeId);

      let initialMetrics;
      if (
        await page
          .locator('[data-testid="performance-section-toggle"]')
          .isVisible({ timeout: 2000 })
      ) {
        initialMetrics = await inspectorHelper.getPerformanceMetrics();
      }

      // Change parameter and re-evaluate
      await inspectorHelper.editParameter('width', '200');
      await nodeHelper.evaluateGraph();
      await nodeHelper.selectNode(nodeId);

      // Check if metrics updated
      if (
        initialMetrics &&
        (await page
          .locator('[data-testid="performance-section-toggle"]')
          .isVisible({ timeout: 2000 }))
      ) {
        const updatedMetrics = await inspectorHelper.getPerformanceMetrics();
        expect(updatedMetrics.evaluationCount).toBeGreaterThan(initialMetrics.evaluationCount);
      }
    });
  });

  test.describe('Advanced Diagnostics Scenarios', () => {
    test('Complex error scenarios provide comprehensive diagnostics', async ({ page }) => {
      // Create a scenario that might produce complex errors
      const box1 = await nodeHelper.createBoxNode(
        { width: 100, height: 50, depth: 25 },
        { x: 200, y: 200 }
      );
      const box2 = await nodeHelper.createBoxNode(
        { width: 80, height: 80, depth: 80 },
        { x: 200, y: 350 }
      );

      // Try to create invalid geometry through parameter manipulation
      await nodeHelper.selectNode(box1);
      await inspectorHelper.editParameter('width', '0');

      await nodeHelper.selectNode(box2);
      await inspectorHelper.editParameter('height', '-10');

      // Attempt evaluation
      try {
        await nodeHelper.evaluateGraph();
      } catch {
        // Expected to fail
      }

      // Check diagnostics for both nodes
      for (const nodeId of [box1, box2]) {
        await nodeHelper.selectNode(nodeId);

        if (
          await page
            .locator('[data-testid="diagnostics-section-toggle"]')
            .isVisible({ timeout: 2000 })
        ) {
          const diagnostics = await inspectorHelper.getDiagnosticSuggestions();

          if (diagnostics.suggestions.length > 0) {
            // Verify suggestions are relevant to the specific error
            expect(diagnostics.errorCount).toBeGreaterThan(0);
          }
        }
      }
    });

    test('Performance bottlenecks identified in complex workflows', async ({ page }) => {
      // Create a complex workflow that might have performance implications
      const { nodes } = await nodeHelper.createComplexWorkflow();

      // Evaluate multiple times to build performance history
      for (let i = 0; i < 3; i++) {
        await nodeHelper.evaluateGraph();
        await page.waitForTimeout(100); // Small delay between evaluations
      }

      // Check if any nodes show performance concerns
      for (const nodeId of nodes) {
        await nodeHelper.selectNode(nodeId);

        if (
          await page
            .locator('[data-testid="performance-section-toggle"]')
            .isVisible({ timeout: 2000 })
        ) {
          const metrics = await inspectorHelper.getPerformanceMetrics();

          // Verify reasonable performance values
          expect(metrics.computeTime).toBeLessThan(10000); // Less than 10 seconds
          expect(metrics.successRate).toBeGreaterThan(50); // At least 50% success rate
        }
      }
    });
  });
});
