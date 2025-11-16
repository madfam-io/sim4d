/**
 * Reusable test patterns and utilities for plugin developers
 * Provides standardized testing approaches for common plugin scenarios
 */

import { Page, expect } from '@playwright/test';
import { PluginTestHelper } from './plugin-test-helper';

export interface PluginTestPattern {
  name: string;
  description: string;
  setup: (helper: PluginTestHelper) => Promise<void>;
  execute: (helper: PluginTestHelper, context: any) => Promise<any>;
  validate: (result: any) => void;
}

/**
 * Standard test patterns for plugin development
 */
export class PluginTestPatterns {
  private helper: PluginTestHelper;

  constructor(private page: Page) {
    this.helper = new PluginTestHelper(page);
  }

  /**
   * Basic Node Plugin Test Pattern
   * Tests fundamental node creation, parameter editing, and evaluation
   */
  async testBasicNodePlugin(
    pluginId: string,
    nodeType: string,
    params: Record<string, any>
  ): Promise<void> {
    // Install plugin
    await this.helper.installPlugin(pluginId);

    // Create node with parameters
    const nodeId = await this.helper.nodeHelper.createNode(nodeType, params);
    expect(nodeId).toBeTruthy();

    // Verify parameters are set correctly
    const nodeParams = await this.helper.nodeHelper.getNodeParameters(nodeId);
    for (const [key, value] of Object.entries(params)) {
      expect(nodeParams[key]).toBe(value);
    }

    // Evaluate graph
    await this.helper.nodeHelper.evaluateGraph();

    // Verify no errors
    const hasError = await this.helper.nodeHelper.nodeHasError(nodeId);
    expect(hasError).toBe(false);

    // Verify geometry output if applicable
    await this.helper.viewportHelper.verifyGeometryVisible();
  }

  /**
   * Parameter Validation Test Pattern
   * Tests parameter constraints and validation
   */
  async testParameterValidation(
    pluginId: string,
    nodeType: string,
    validParams: Record<string, any>,
    invalidParams: Record<string, any>
  ): Promise<void> {
    await this.helper.installPlugin(pluginId);

    // Test valid parameters
    const validNodeId = await this.helper.nodeHelper.createNode(nodeType, validParams);
    await this.helper.nodeHelper.evaluateGraph();
    expect(await this.helper.nodeHelper.nodeHasError(validNodeId)).toBe(false);

    // Test invalid parameters
    const invalidNodeId = await this.helper.nodeHelper.createNode(nodeType, invalidParams);
    await this.helper.nodeHelper.evaluateGraph();
    expect(await this.helper.nodeHelper.nodeHasError(invalidNodeId)).toBe(true);

    // Verify error message is meaningful
    const errorMessage = await this.helper.nodeHelper.getNodeError(invalidNodeId);
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).not.toBe('Unknown error');
  }

  /**
   * Node Connection Test Pattern
   * Tests input/output connections between nodes
   */
  async testNodeConnections(
    pluginId: string,
    sourceConfig: { type: string; params: Record<string, any>; output: string },
    targetConfig: { type: string; params: Record<string, any>; input: string }
  ): Promise<void> {
    await this.helper.installPlugin(pluginId);

    // Create source node
    const sourceNode = await this.helper.nodeHelper.createNode(
      sourceConfig.type,
      sourceConfig.params
    );

    // Create target node
    const targetNode = await this.helper.nodeHelper.createNode(
      targetConfig.type,
      targetConfig.params
    );

    // Connect nodes
    await this.helper.nodeHelper.connectNodes({
      sourceId: sourceNode,
      sourceOutput: sourceConfig.output,
      targetId: targetNode,
      targetInput: targetConfig.input,
    });

    // Verify connection
    await this.helper.nodeHelper.verifyNodeConnected({
      sourceId: sourceNode,
      sourceOutput: sourceConfig.output,
      targetId: targetNode,
      targetInput: targetConfig.input,
    });

    // Evaluate graph
    await this.helper.nodeHelper.evaluateGraph();

    // Verify both nodes work correctly
    expect(await this.helper.nodeHelper.nodeHasError(sourceNode)).toBe(false);
    expect(await this.helper.nodeHelper.nodeHasError(targetNode)).toBe(false);
  }

  /**
   * Performance Test Pattern
   * Tests plugin performance under various loads
   */
  async testPluginPerformance(
    pluginId: string,
    operations: Array<{ action: string; params: any; expectedMaxTime: number }>
  ): Promise<{ [operation: string]: number }> {
    await this.helper.installPlugin(pluginId);

    const performanceResults: { [operation: string]: number } = {};

    for (const operation of operations) {
      const startTime = Date.now();

      const result = await this.helper.executePluginFunction(pluginId, operation.action, [
        operation.params,
      ]);

      const executionTime = Date.now() - startTime;
      performanceResults[operation.action] = executionTime;

      // Verify operation succeeded
      expect(result.success).toBe(true);

      // Verify performance meets expectations
      expect(executionTime).toBeLessThan(operation.expectedMaxTime);
    }

    return performanceResults;
  }

  /**
   * Memory Management Test Pattern
   * Tests for memory leaks and proper cleanup
   */
  async testMemoryManagement(
    pluginId: string,
    stressOperations: number = 100
  ): Promise<{
    memoryLeak: boolean;
    maxMemoryUsed: number;
    finalMemoryUsed: number;
  }> {
    await this.helper.installPlugin(pluginId);

    const initialMemory = await this.helper.getPluginMemoryUsage(pluginId);
    let maxMemoryUsed = initialMemory;

    // Perform stress operations
    for (let i = 0; i < stressOperations; i++) {
      await this.helper.executePluginFunction(pluginId, 'createTestGeometry', [
        { complexity: 'medium' },
      ]);

      const currentMemory = await this.helper.getPluginMemoryUsage(pluginId);
      maxMemoryUsed = Math.max(maxMemoryUsed, currentMemory);

      // Periodic cleanup
      if (i % 10 === 0) {
        await this.helper.executePluginFunction(pluginId, 'cleanup', []);
      }
    }

    // Final cleanup
    await this.helper.executePluginFunction(pluginId, 'cleanup', []);
    await this.page.waitForTimeout(1000); // Allow garbage collection

    const finalMemoryUsed = await this.helper.getPluginMemoryUsage(pluginId);

    // Check for memory leak (final memory should be close to initial)
    const memoryLeak = finalMemoryUsed > initialMemory * 2;

    return {
      memoryLeak,
      maxMemoryUsed,
      finalMemoryUsed,
    };
  }

  /**
   * Error Handling Test Pattern
   * Tests plugin behavior under error conditions
   */
  async testErrorHandling(
    pluginId: string,
    errorScenarios: Array<{ scenario: string; action: string; params: any; expectedError: string }>
  ): Promise<void> {
    await this.helper.installPlugin(pluginId);

    for (const scenario of errorScenarios) {
      // Execute operation that should cause error
      const result = await this.helper.executePluginFunction(pluginId, scenario.action, [
        scenario.params,
      ]);

      // Verify error occurred
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      // Verify error message is appropriate
      if (scenario.expectedError) {
        expect(result.error).toContain(scenario.expectedError);
      }

      // Verify plugin is still functional after error
      const healthCheck = await this.helper.executePluginFunction(pluginId, 'healthCheck', []);
      expect(healthCheck.success).toBe(true);
    }
  }

  /**
   * Security Test Pattern
   * Tests plugin security boundaries and permissions
   */
  async testSecurityBoundaries(
    pluginId: string,
    maliciousOperations: Array<{ operation: string; shouldFail: boolean }>
  ): Promise<void> {
    await this.helper.installPlugin(pluginId, { allowUnsigned: true });

    for (const operation of maliciousOperations) {
      const result = await this.helper.executePluginFunction(pluginId, operation.operation, []);

      if (operation.shouldFail) {
        expect(result.success).toBe(false);
        expect(result.error).toContain('permission');
      } else {
        expect(result.success).toBe(true);
      }
    }

    // Verify sandbox isolation
    const isolation = await this.helper.validateSandboxIsolation(pluginId);
    expect(isolation.memoryIsolated).toBe(true);
    expect(isolation.storageIsolated).toBe(true);
  }

  /**
   * Collaboration Test Pattern
   * Tests plugin behavior in multi-user scenarios
   */
  async testCollaboration(
    pluginId: string,
    userActions: Array<{ user: string; action: string; params: any }>
  ): Promise<void> {
    const session = await this.helper.testMultiUserPluginCollaboration({
      users: ['user1', 'user2'],
      pluginId,
      workflowActions: userActions.map((action) => ({
        user: action.user,
        action: action.action,
        data: action.params,
      })),
    });

    // Verify synchronization
    const syncResult = await this.helper.validatePluginStateSynchronization(
      session.sessionId,
      pluginId
    );
    expect(syncResult.synchronized).toBe(true);
    expect(syncResult.latencyMs).toBeLessThan(2000);
  }

  /**
   * Plugin Lifecycle Test Pattern
   * Tests complete plugin lifecycle from install to uninstall
   */
  async testPluginLifecycle(pluginId: string): Promise<void> {
    // Test installation
    const context = await this.helper.installPlugin(pluginId);
    expect(context.pluginId).toBe(pluginId);

    // Test activation
    await this.helper.togglePlugin(pluginId, true);

    // Test functionality
    const result = await this.helper.executePluginFunction(pluginId, 'test', []);
    expect(result.success).toBe(true);

    // Test deactivation
    await this.helper.togglePlugin(pluginId, false);

    // Test uninstallation
    await this.helper.uninstallPlugin(pluginId);

    // Verify cleanup
    const residualResources = await this.helper.checkPluginResidualResources(pluginId);
    expect(residualResources.length).toBe(0);
  }

  /**
   * Custom Test Pattern Builder
   * Allows creation of domain-specific test patterns
   */
  createCustomPattern(
    name: string,
    setup: (helper: PluginTestHelper) => Promise<void>,
    operations: Array<(helper: PluginTestHelper) => Promise<any>>,
    validation: (results: any[]) => void
  ): PluginTestPattern {
    return {
      name,
      description: `Custom test pattern: ${name}`,
      setup,
      execute: async (helper: PluginTestHelper, context: any) => {
        const results = [];
        for (const operation of operations) {
          const result = await operation(helper);
          results.push(result);
        }
        return results;
      },
      validate: validation,
    };
  }

  /**
   * Batch Test Runner
   * Runs multiple test patterns in sequence
   */
  async runTestPatterns(
    patterns: PluginTestPattern[],
    context: any = {}
  ): Promise<{
    passed: number;
    failed: number;
    results: Array<{ pattern: string; success: boolean; error?: string }>;
  }> {
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const pattern of patterns) {
      try {
        await pattern.setup(this.helper);
        const result = await pattern.execute(this.helper, context);
        pattern.validate(result);

        results.push({ pattern: pattern.name, success: true });
        passed++;
      } catch (error) {
        results.push({
          pattern: pattern.name,
          success: false,
          error: error.message,
        });
        failed++;
      }
    }

    return { passed, failed, results };
  }
}

/**
 * Predefined test patterns for common plugin types
 */
export const STANDARD_PLUGIN_PATTERNS = {
  GEOMETRY_NODE: (nodeType: string, params: Record<string, any>) => ({
    name: 'Geometry Node Test',
    description: 'Tests basic geometry node functionality',
    setup: async (helper: PluginTestHelper) => {
      await helper.nodeHelper.waitForWorkspaceReady();
    },
    execute: async (helper: PluginTestHelper, context: { pluginId: string }) => {
      return await helper.testPluginNodeIntegration(context.pluginId, nodeType);
    },
    validate: (result: any) => {
      expect(result.nodeCreated).toBe(true);
      expect(result.parametersWorking).toBe(true);
      expect(result.evaluationSuccessful).toBe(true);
    },
  }),

  VIEWPORT_INTEGRATION: {
    name: 'Viewport Integration Test',
    description: 'Tests plugin integration with 3D viewport',
    setup: async (helper: PluginTestHelper) => {
      await helper.viewportHelper.waitForViewportReady();
    },
    execute: async (helper: PluginTestHelper, context: { pluginId: string }) => {
      return await helper.testPluginViewportIntegration(context.pluginId);
    },
    validate: (result: any) => {
      expect(result.overlayRendered).toBe(true);
      expect(result.performanceAcceptable).toBe(true);
    },
  },

  SECURITY_VALIDATION: {
    name: 'Security Validation Test',
    description: 'Tests plugin security boundaries and isolation',
    setup: async (helper: PluginTestHelper) => {},
    execute: async (helper: PluginTestHelper, context: { pluginId: string }) => {
      return await helper.validateSandboxIsolation(context.pluginId);
    },
    validate: (result: any) => {
      expect(result.memoryIsolated).toBe(true);
      expect(result.storageIsolated).toBe(true);
      expect(result.workerIsolated).toBe(true);
    },
  },
};

/**
 * Plugin Test Suite Builder
 * Helps create comprehensive test suites for plugin validation
 */
export class PluginTestSuiteBuilder {
  private patterns: PluginTestPattern[] = [];

  addStandardPatterns(pluginType: 'geometry' | 'ui' | 'utility'): this {
    switch (pluginType) {
      case 'geometry':
        this.patterns.push(STANDARD_PLUGIN_PATTERNS.GEOMETRY_NODE('Plugin::DefaultNode', {}));
        this.patterns.push(STANDARD_PLUGIN_PATTERNS.VIEWPORT_INTEGRATION);
        break;
      case 'ui':
        this.patterns.push(STANDARD_PLUGIN_PATTERNS.VIEWPORT_INTEGRATION);
        break;
      case 'utility':
        this.patterns.push(STANDARD_PLUGIN_PATTERNS.SECURITY_VALIDATION);
        break;
    }
    return this;
  }

  addCustomPattern(pattern: PluginTestPattern): this {
    this.patterns.push(pattern);
    return this;
  }

  addSecurityTests(): this {
    this.patterns.push(STANDARD_PLUGIN_PATTERNS.SECURITY_VALIDATION);
    return this;
  }

  build(): PluginTestPattern[] {
    return [...this.patterns];
  }
}
