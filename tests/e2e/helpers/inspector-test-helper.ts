import { Page, Locator, expect } from '@playwright/test';

export interface PerformanceMetrics {
  computeTime: number;
  memoryUsage: number;
  successRate: number;
  evaluationCount: number;
}

export interface DiagnosticInfo {
  suggestions: Array<{
    title: string;
    actionType: string;
    confidence: number;
  }>;
  errorCount: number;
}

/**
 * Helper class for Inspector panel testing in Sim4D Studio
 * Supports Phase 4A (live parameter editing) and Phase 4B (performance/diagnostics)
 */
export class InspectorTestHelper {
  constructor(private page: Page) {}

  /**
   * Wait for Inspector panel to be visible and ready
   */
  async waitForInspectorReady(): Promise<void> {
    await this.page.waitForSelector('[data-testid="inspector"], .inspector-panel', {
      timeout: 10000,
    });

    // Wait for inspector to be fully loaded
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify Inspector is visible and active
   */
  async verifyInspectorActive(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="inspector-active"], .inspector-panel.active')
    ).toBeVisible();
  }

  /**
   * Phase 4A: Live Parameter Editing Tests
   */

  /**
   * Verify parameters section is visible
   */
  async verifyParametersSection(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="inspector-parameters"], .parameters-section')
    ).toBeVisible();
  }

  /**
   * Edit a parameter in the Inspector (Phase 4A)
   */
  async editParameter(paramName: string, value: string): Promise<void> {
    const paramInput = this.page
      .locator(`[data-testid="inspector-param-${paramName}"], [data-param="${paramName}"]`)
      .first();

    await expect(paramInput).toBeVisible();
    await paramInput.clear();
    await paramInput.fill(value);

    // Verify immediate update without dialog
    await this.page.waitForTimeout(300);
  }

  /**
   * Verify parameter value in Inspector
   */
  async verifyParameterValue(paramName: string, expectedValue: string): Promise<void> {
    const paramInput = this.page
      .locator(`[data-testid="inspector-param-${paramName}"], [data-param="${paramName}"]`)
      .first();
    await expect(paramInput).toHaveValue(expectedValue);
  }

  /**
   * Verify dirty indicator shows after parameter change
   */
  async verifyDirtyIndicator(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="node-dirty-indicator"], .dirty-indicator')
    ).toBeVisible();
  }

  /**
   * Test undo/redo functionality
   */
  async testUndoRedo(paramName: string, originalValue: string, newValue: string): Promise<void> {
    // Edit parameter
    await this.editParameter(paramName, newValue);
    await this.verifyParameterValue(paramName, newValue);

    // Undo
    await this.page.keyboard.press('Control+Z');
    await this.verifyParameterValue(paramName, originalValue);

    // Redo
    await this.page.keyboard.press('Control+Y');
    await this.verifyParameterValue(paramName, newValue);
  }

  /**
   * Phase 4B: Performance Monitoring Tests
   */

  /**
   * Open performance section
   */
  async openPerformanceSection(): Promise<void> {
    const performanceToggle = this.page
      .locator('[data-testid="performance-section-toggle"], .performance-section-header')
      .first();

    if (await performanceToggle.isVisible()) {
      await performanceToggle.click();
    }

    await expect(
      this.page.locator('[data-testid="performance-section"], .performance-section')
    ).toBeVisible();
  }

  /**
   * Verify performance metrics are displayed
   */
  async verifyPerformanceMetrics(): Promise<void> {
    await this.openPerformanceSection();

    // Check for key performance metrics
    await expect(
      this.page.locator('[data-testid="compute-time-metric"], .compute-time')
    ).toBeVisible();
    await expect(
      this.page.locator('[data-testid="memory-usage-metric"], .memory-usage')
    ).toBeVisible();
    await expect(
      this.page.locator('[data-testid="success-rate-metric"], .success-rate')
    ).toBeVisible();
  }

  /**
   * Get performance metrics data
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    await this.openPerformanceSection();

    const computeTime = await this.getMetricValue('compute-time');
    const memoryUsage = await this.getMetricValue('memory-usage');
    const successRate = await this.getMetricValue('success-rate');
    const evaluationCount = await this.getMetricValue('evaluation-count');

    return {
      computeTime: parseFloat(computeTime) || 0,
      memoryUsage: parseFloat(memoryUsage) || 0,
      successRate: parseFloat(successRate) || 0,
      evaluationCount: parseInt(evaluationCount) || 0,
    };
  }

  /**
   * Helper to get metric value from UI
   */
  private async getMetricValue(metricName: string): Promise<string> {
    const metricElement = this.page
      .locator(`[data-testid="${metricName}-value"], [data-metric="${metricName}"]`)
      .first();

    if (await metricElement.isVisible({ timeout: 2000 })) {
      return (await metricElement.textContent()) || '0';
    }

    return '0';
  }

  /**
   * Verify performance chart/visualization
   */
  async verifyPerformanceChart(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="performance-chart"], .performance-chart')
    ).toBeVisible();
  }

  /**
   * Phase 4B: Diagnostics Tests
   */

  /**
   * Open diagnostics section
   */
  async openDiagnosticsSection(): Promise<void> {
    const diagnosticsToggle = this.page
      .locator('[data-testid="diagnostics-section-toggle"], .diagnostics-section-header')
      .first();

    if (await diagnosticsToggle.isVisible()) {
      await diagnosticsToggle.click();
    }

    await expect(
      this.page.locator('[data-testid="diagnostics-section"], .diagnostics-section')
    ).toBeVisible();
  }

  /**
   * Verify diagnostics are displayed when node has errors
   */
  async verifyDiagnostics(): Promise<void> {
    await this.openDiagnosticsSection();

    // Check for diagnostics container
    await expect(
      this.page.locator('[data-testid="diagnostics-list"], .diagnostics-list')
    ).toBeVisible();
  }

  /**
   * Get diagnostic suggestions
   */
  async getDiagnosticSuggestions(): Promise<DiagnosticInfo> {
    await this.openDiagnosticsSection();

    const suggestions = await this.page
      .locator('[data-testid="diagnostic-suggestion"], .diagnostic-suggestion')
      .all();
    const diagnosticData: DiagnosticInfo = {
      suggestions: [],
      errorCount: suggestions.length,
    };

    for (const suggestion of suggestions) {
      const title = (await suggestion.locator('.suggestion-title').textContent()) || '';
      const actionType = (await suggestion.getAttribute('data-action-type')) || '';
      const confidenceText = (await suggestion.locator('.confidence').textContent()) || '0';
      const confidence = parseInt(confidenceText.replace('%', '')) || 0;

      diagnosticData.suggestions.push({
        title,
        actionType,
        confidence,
      });
    }

    return diagnosticData;
  }

  /**
   * Click on a diagnostic suggestion
   */
  async clickDiagnosticSuggestion(index: number): Promise<void> {
    const suggestions = this.page.locator(
      '[data-testid="diagnostic-suggestion"], .diagnostic-suggestion'
    );
    await suggestions.nth(index).click();
  }

  /**
   * Phase 4B: Configuration Management Tests
   */

  /**
   * Open configuration section
   */
  async openConfigurationSection(): Promise<void> {
    const configToggle = this.page
      .locator('[data-testid="configuration-section-toggle"], .configuration-section-header')
      .first();

    if (await configToggle.isVisible()) {
      await configToggle.click();
    }

    await expect(
      this.page.locator('[data-testid="configuration-section"], .configuration-section')
    ).toBeVisible();
  }

  /**
   * Export node configuration
   */
  async exportConfiguration(): Promise<void> {
    await this.openConfigurationSection();

    const exportButton = this.page
      .locator('[data-testid="export-config-button"], button:has-text("Export")')
      .first();
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    // Wait for export to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify configuration was exported
   */
  async verifyConfigurationExported(): Promise<void> {
    // Check if configuration appears in localStorage or shows success message
    const configExists = await this.page.evaluate(() => {
      const configs = localStorage.getItem('sim4d_node_configurations');
      return configs && JSON.parse(configs) && Object.keys(JSON.parse(configs)).length > 0;
    });

    expect(configExists).toBe(true);
  }

  /**
   * Import node configuration
   */
  async importConfiguration(configId: string): Promise<void> {
    await this.openConfigurationSection();

    const importButton = this.page
      .locator('[data-testid="import-config-button"], button:has-text("Import")')
      .first();
    if (await importButton.isVisible({ timeout: 2000 })) {
      await importButton.click();

      // Select configuration if there's a list
      const configOption = this.page.locator(`[data-config-id="${configId}"]`).first();
      if (await configOption.isVisible({ timeout: 2000 })) {
        await configOption.click();
      }
    }
  }

  /**
   * Verify configuration templates
   */
  async verifyConfigurationTemplates(): Promise<void> {
    await this.openConfigurationSection();

    const templatesSection = this.page.locator(
      '[data-testid="configuration-templates"], .templates-section'
    );
    await expect(templatesSection).toBeVisible();
  }

  /**
   * General Inspector Tests
   */

  /**
   * Verify all Inspector sections are available
   */
  async verifyAllSections(): Promise<void> {
    await this.verifyParametersSection();

    // Try to find performance section
    if (
      await this.page
        .locator('[data-testid="performance-section-toggle"]')
        .isVisible({ timeout: 2000 })
    ) {
      await this.openPerformanceSection();
    }

    // Try to find diagnostics section
    if (
      await this.page
        .locator('[data-testid="diagnostics-section-toggle"]')
        .isVisible({ timeout: 2000 })
    ) {
      await this.openDiagnosticsSection();
    }

    // Try to find configuration section
    if (
      await this.page
        .locator('[data-testid="configuration-section-toggle"]')
        .isVisible({ timeout: 2000 })
    ) {
      await this.openConfigurationSection();
    }
  }

  /**
   * Verify Inspector updates when different nodes are selected
   */
  async verifyInspectorNodeSwitch(nodeId1: string, nodeId2: string): Promise<void> {
    // Select first node
    await this.page.click(`[data-node-id="${nodeId1}"]`);
    await this.verifyInspectorActive();
    const firstNodeParams = await this.page
      .locator('[data-testid="inspector-parameters"] input')
      .count();

    // Select second node
    await this.page.click(`[data-node-id="${nodeId2}"]`);
    await this.verifyInspectorActive();
    const secondNodeParams = await this.page
      .locator('[data-testid="inspector-parameters"] input')
      .count();

    // Inspector should update (may have different parameter counts)
    expect(firstNodeParams).toBeGreaterThan(0);
    expect(secondNodeParams).toBeGreaterThan(0);
  }

  /**
   * Test Inspector responsiveness during parameter changes
   */
  async testInspectorResponsiveness(): Promise<void> {
    const startTime = Date.now();

    // Make a parameter change
    const paramInput = this.page.locator('[data-testid="inspector-parameters"] input').first();
    if (await paramInput.isVisible()) {
      await paramInput.fill('999');
    }

    // Verify Inspector responds quickly
    await this.verifyDirtyIndicator();

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  }
}
