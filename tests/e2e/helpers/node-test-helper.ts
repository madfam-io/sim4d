import { Page, Locator, expect } from '@playwright/test';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeParameters {
  [key: string]: string | number | boolean;
}

export interface NodeConnection {
  sourceId: string;
  sourceOutput: string;
  targetId: string;
  targetInput: string;
}

/**
 * Helper class for node manipulation in Sim4D Studio tests
 * Provides high-level operations for creating, editing, and connecting nodes
 */
export class NodeTestHelper {
  constructor(private page: Page) {}

  /**
   * Wait for the workspace to be ready for interaction
   */
  async waitForWorkspaceReady(): Promise<void> {
    // Wait for the main app container
    await this.page.waitForSelector('[data-testid="app-ready"], .app-container', {
      timeout: 30000,
    });

    // Wait for the node panel to be visible
    await this.page.waitForSelector('[data-testid="node-panel"], .node-panel', {
      timeout: 10000,
    });

    // Wait for the workflow canvas
    await this.page.waitForSelector('[data-testid="workflow-canvas"], .workflow-canvas', {
      timeout: 10000,
    });

    // Wait a bit for any initialization to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Drag a node from the panel to the canvas
   */
  async dragNodeFromPanel(nodeType: string, position: NodePosition): Promise<string> {
    // Find the node in the panel
    const nodeSelector = `[data-node-type="${nodeType}"], [data-testid="node-${nodeType.toLowerCase().replace(/[:]/g, '-')}"]`;
    const nodeElement = this.page.locator(nodeSelector).first();

    await expect(nodeElement).toBeVisible({ timeout: 5000 });

    // Find the canvas target
    const canvas = this.page.locator('[data-testid="workflow-canvas"], .workflow-canvas').first();
    await expect(canvas).toBeVisible();

    // Perform drag and drop
    await nodeElement.dragTo(canvas, {
      targetPosition: position,
    });

    // Wait for node to appear on canvas and return its ID
    await this.page.waitForSelector('[data-node-id]', { timeout: 5000 });

    // Return the ID of the last created node
    return await this.getLastCreatedNodeId();
  }

  /**
   * Create a specific node type with parameters
   */
  async createNode(
    nodeType: string,
    parameters: NodeParameters,
    position?: NodePosition
  ): Promise<string> {
    const nodePosition = position || { x: 400, y: 300 };

    // Drag node from panel
    const nodeId = await this.dragNodeFromPanel(nodeType, nodePosition);

    // If parameters are provided, fill them
    if (Object.keys(parameters).length > 0) {
      await this.fillNodeParameters(parameters);
    }

    return nodeId;
  }

  /**
   * Create a Box node (common operation)
   */
  async createBoxNode(
    params: { width: number; height: number; depth: number },
    position?: NodePosition
  ): Promise<string> {
    return await this.createNode(
      'Solid::Box',
      {
        width: params.width,
        height: params.height,
        depth: params.depth,
      },
      position
    );
  }

  /**
   * Create a Cylinder node (common operation)
   */
  async createCylinderNode(
    params: { radius: number; height: number },
    position?: NodePosition
  ): Promise<string> {
    return await this.createNode(
      'Solid::Cylinder',
      {
        radius: params.radius,
        height: params.height,
      },
      position
    );
  }

  /**
   * Fill parameter dialog or inline parameters
   */
  async fillNodeParameters(parameters: NodeParameters): Promise<void> {
    for (const [paramName, value] of Object.entries(parameters)) {
      const paramSelector = `[data-testid="param-${paramName}"], [name="${paramName}"], input[placeholder*="${paramName}"]`;
      const paramInput = this.page.locator(paramSelector).first();

      if (await paramInput.isVisible({ timeout: 2000 })) {
        await paramInput.clear();
        await paramInput.fill(String(value));
      }
    }

    // If there's a create/apply button, click it
    const applyButton = this.page
      .locator(
        '[data-testid="apply-parameters"], [data-testid="create-node"], button:has-text("Apply"), button:has-text("Create")'
      )
      .first();
    if (await applyButton.isVisible({ timeout: 2000 })) {
      await applyButton.click();
    }
  }

  /**
   * Select a node on the canvas
   */
  async selectNode(nodeId: string): Promise<void> {
    const nodeSelector = `[data-node-id="${nodeId}"]`;
    await this.page.click(nodeSelector);

    // Wait for selection to be visible
    await this.page.waitForSelector(
      `${nodeSelector}.selected, ${nodeSelector}[data-selected="true"]`,
      {
        timeout: 3000,
      }
    );
  }

  /**
   * Get parameters of a node
   */
  async getNodeParameters(nodeId: string): Promise<Record<string, any>> {
    return await this.page.evaluate((id) => {
      // This assumes there's a global sim4d object with graph access
      const node = (window as any).sim4d?.graph?.getNode?.(id);
      return node?.params || {};
    }, nodeId);
  }

  /**
   * Connect two nodes
   */
  async connectNodes(connection: NodeConnection): Promise<void> {
    const sourceNode = `[data-node-id="${connection.sourceId}"]`;
    const targetNode = `[data-node-id="${connection.targetId}"]`;

    // Find output handle on source node
    const outputHandle = this.page
      .locator(
        `${sourceNode} [data-output="${connection.sourceOutput}"], ${sourceNode} .output-handle`
      )
      .first();

    // Find input handle on target node
    const inputHandle = this.page
      .locator(
        `${targetNode} [data-input="${connection.targetInput}"], ${targetNode} .input-handle`
      )
      .first();

    // Drag from output to input
    await outputHandle.dragTo(inputHandle);

    // Wait for connection to be established
    await this.page.waitForSelector('.react-flow__edge', { timeout: 3000 });
  }

  /**
   * Verify node connection exists
   */
  async verifyNodeConnected(connection: NodeConnection): Promise<void> {
    const isConnected = await this.page.evaluate((conn) => {
      const graph = (window as any).sim4d?.graph;
      if (!graph) return false;

      const edges = graph.getEdges?.() || [];
      return edges.some(
        (edge: any) =>
          edge.source === conn.sourceId &&
          edge.target === conn.targetId &&
          edge.sourceHandle === conn.sourceOutput &&
          edge.targetHandle === conn.targetInput
      );
    }, connection);

    expect(isConnected).toBe(true);
  }

  /**
   * Delete a node
   */
  async deleteNode(nodeId: string): Promise<void> {
    await this.selectNode(nodeId);
    await this.page.keyboard.press('Delete');

    // Wait for node to be removed
    await expect(this.page.locator(`[data-node-id="${nodeId}"]`)).not.toBeVisible({
      timeout: 3000,
    });
  }

  /**
   * Get the ID of the last created node
   */
  async getLastCreatedNodeId(): Promise<string> {
    return await this.page.evaluate(() => {
      const nodes = document.querySelectorAll('[data-node-id]');
      if (nodes.length === 0) return '';

      // Return the last node's ID
      const lastNode = nodes[nodes.length - 1];
      return lastNode.getAttribute('data-node-id') || '';
    });
  }

  /**
   * Get all node IDs on the canvas
   */
  async getAllNodeIds(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const nodes = document.querySelectorAll('[data-node-id]');
      return Array.from(nodes)
        .map((node) => node.getAttribute('data-node-id'))
        .filter(Boolean) as string[];
    });
  }

  /**
   * Wait for node evaluation to complete
   */
  async waitForEvaluation(): Promise<void> {
    // Wait for any loading indicators to disappear
    await this.page.waitForSelector('[data-testid="evaluating"], .evaluating', {
      state: 'hidden',
      timeout: 30000,
    });

    // Wait for evaluation complete indicator
    await this.page.waitForSelector('[data-testid="evaluation-complete"]', { timeout: 30000 });

    // Additional wait for geometry rendering
    await this.page.waitForTimeout(1000);
  }

  /**
   * Trigger graph evaluation
   */
  async evaluateGraph(): Promise<void> {
    const evaluateButton = this.page
      .locator(
        '[data-testid="evaluate"], [data-testid="evaluate-graph"], button:has-text("Evaluate")'
      )
      .first();

    if (await evaluateButton.isVisible({ timeout: 2000 })) {
      await evaluateButton.click();
    }

    await this.waitForEvaluation();
  }

  /**
   * Create a complex workflow for testing
   */
  async createComplexWorkflow(): Promise<{ nodes: string[]; connections: NodeConnection[] }> {
    const box1 = await this.createBoxNode(
      { width: 100, height: 50, depth: 25 },
      { x: 200, y: 200 }
    );
    const box2 = await this.createBoxNode({ width: 80, height: 80, depth: 80 }, { x: 200, y: 350 });
    const cylinder = await this.createCylinderNode({ radius: 30, height: 100 }, { x: 200, y: 500 });

    // Add union operation if available
    let union = '';
    try {
      union = await this.createNode('Boolean::Union', {}, { x: 500, y: 300 });
    } catch {
      // Union node might not be available in current implementation
    }

    const nodes = [box1, box2, cylinder];
    if (union) nodes.push(union);

    const connections: NodeConnection[] = [];
    if (union) {
      connections.push(
        { sourceId: box1, sourceOutput: 'output', targetId: union, targetInput: 'input1' },
        { sourceId: box2, sourceOutput: 'output', targetId: union, targetInput: 'input2' }
      );
    }

    return { nodes, connections };
  }

  /**
   * Get node count on canvas
   */
  async getNodeCount(): Promise<number> {
    return await this.page.locator('[data-node-id]').count();
  }

  /**
   * Check if node has error state
   */
  async nodeHasError(nodeId: string): Promise<boolean> {
    const node = this.page.locator(`[data-node-id="${nodeId}"]`);
    return await node.locator('.error, [data-error="true"]').isVisible({ timeout: 1000 });
  }

  /**
   * Get node error message if any
   */
  async getNodeError(nodeId: string): Promise<string | null> {
    try {
      const errorElement = this.page.locator(
        `[data-node-id="${nodeId}"] .error-message, [data-node-id="${nodeId}"] [data-testid="error-message"]`
      );
      if (await errorElement.isVisible({ timeout: 1000 })) {
        return await errorElement.textContent();
      }
    } catch {
      // No error found
    }
    return null;
  }
}
