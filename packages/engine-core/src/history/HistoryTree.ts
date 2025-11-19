import { uuidv4 } from '../utils/uuid';

export interface HistoryNode {
  id: string;
  type: 'operation' | 'parameter' | 'feature';
  operation: string;
  parameters: Record<string, unknown>;
  parentId?: string;
  childrenIds: string[];
  timestamp: number;
  isActive: boolean;
  isSuppressed: boolean;
  error?: string;
  result?: unknown;
}

export interface HistoryState {
  nodes: Map<string, HistoryNode>;
  rootIds: string[];
  currentId?: string;
}

export class ParametricHistoryTree {
  private state: HistoryState;
  private listeners: Set<(state: HistoryState) => void> = new Set();

  constructor() {
    this.state = {
      nodes: new Map(),
      rootIds: [],
    };
  }

  /**
   * Add a new operation to the history tree
   */
  addOperation(operation: string, parameters: Record<string, unknown>, parentId?: string): string {
    const id = uuidv4();
    const node: HistoryNode = {
      id,
      type: 'operation',
      operation,
      parameters,
      parentId,
      childrenIds: [],
      timestamp: Date.now(),
      isActive: true,
      isSuppressed: false,
    };

    this.state.nodes.set(id, node);

    if (parentId) {
      const parent = this.state.nodes.get(parentId);
      if (parent) {
        parent.childrenIds.push(id);
      }
    } else {
      this.state.rootIds.push(id);
    }

    this.state.currentId = id;
    this.notifyListeners();
    return id;
  }

  /**
   * Update parameters of an existing operation
   */
  updateParameters(nodeId: string, parameters: Record<string, unknown>): void {
    const node = this.state.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    node.parameters = { ...node.parameters, ...parameters };
    node.timestamp = Date.now();

    // Mark all dependent nodes for re-evaluation
    this.markDependentsForReevaluation(nodeId);
    this.notifyListeners();
  }

  /**
   * Suppress/unsuppress an operation (temporarily disable)
   */
  suppressOperation(nodeId: string, suppress = true): void {
    const node = this.state.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    node.isSuppressed = suppress;

    // Cascade suppression to children
    if (suppress) {
      this.cascadeSuppression(nodeId, true);
    }

    this.notifyListeners();
  }

  /**
   * Delete an operation and its dependents
   */
  deleteOperation(nodeId: string): void {
    const node = this.state.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    // Recursively delete children
    for (const childId of node.childrenIds) {
      this.deleteOperation(childId);
    }

    // Remove from parent's children
    if (node.parentId) {
      const parent = this.state.nodes.get(node.parentId);
      if (parent) {
        parent.childrenIds = parent.childrenIds.filter((id) => id !== nodeId);
      }
    } else {
      this.state.rootIds = this.state.rootIds.filter((id) => id !== nodeId);
    }

    // Delete the node
    this.state.nodes.delete(nodeId);

    // Update current if needed
    if (this.state.currentId === nodeId) {
      this.state.currentId = node.parentId;
    }

    this.notifyListeners();
  }

  /**
   * Roll back to a specific point in history
   */
  rollbackTo(nodeId: string): void {
    const node = this.state.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    // Find all nodes after this point
    const nodesToRemove = this.findNodesAfter(nodeId);

    // Remove them
    for (const id of nodesToRemove) {
      this.state.nodes.delete(id);
    }

    this.state.currentId = nodeId;
    this.notifyListeners();
  }

  /**
   * Get the ordered list of active operations for evaluation
   */
  getEvaluationOrder(): HistoryNode[] {
    const order: HistoryNode[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = this.state.nodes.get(id);
      if (!node || node.isSuppressed) return;

      order.push(node);

      for (const childId of node.childrenIds) {
        traverse(childId);
      }
    };

    for (const rootId of this.state.rootIds) {
      traverse(rootId);
    }

    return order;
  }

  /**
   * Get tree structure for UI display
   */
  getTreeStructure(): any {
    const buildTree = (id: string): any => {
      const node = this.state.nodes.get(id);
      if (!node) return null;

      return {
        id: node.id,
        label: `${node.operation} ${node.isSuppressed ? '(suppressed)' : ''}`,
        type: node.type,
        operation: node.operation,
        parameters: node.parameters,
        isActive: node.isActive,
        isSuppressed: node.isSuppressed,
        timestamp: node.timestamp,
        error: node.error,
        children: node.childrenIds.map((childId) => buildTree(childId)).filter(Boolean),
      };
    };

    return this.state.rootIds.map((rootId) => buildTree(rootId)).filter(Boolean);
  }

  /**
   * Subscribe to history changes
   */
  subscribe(listener: (state: HistoryState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get a specific node
   */
  getNode(nodeId: string): HistoryNode | undefined {
    return this.state.nodes.get(nodeId);
  }

  /**
   * Get current state
   */
  getState(): HistoryState {
    return this.state;
  }

  /**
   * Restore from serialized state
   */
  restore(state: HistoryState): void {
    this.state = {
      nodes: new Map(state.nodes),
      rootIds: [...state.rootIds],
      currentId: state.currentId,
    };
    this.notifyListeners();
  }

  /**
   * Serialize for persistence
   */
  serialize(): any {
    return {
      nodes: Array.from(this.state.nodes.entries()),
      rootIds: this.state.rootIds,
      currentId: this.state.currentId,
    };
  }

  private markDependentsForReevaluation(nodeId: string): void {
    const node = this.state.nodes.get(nodeId);
    if (!node) return;

    for (const childId of node.childrenIds) {
      const child = this.state.nodes.get(childId);
      if (child) {
        child.isActive = false; // Mark for re-evaluation
        this.markDependentsForReevaluation(childId);
      }
    }
  }

  private cascadeSuppression(nodeId: string, suppress: boolean): void {
    const node = this.state.nodes.get(nodeId);
    if (!node) return;

    for (const childId of node.childrenIds) {
      const child = this.state.nodes.get(childId);
      if (child) {
        child.isSuppressed = suppress;
        this.cascadeSuppression(childId, suppress);
      }
    }
  }

  private findNodesAfter(nodeId: string): Set<string> {
    const result = new Set<string>();
    const node = this.state.nodes.get(nodeId);
    if (!node) return result;

    const timestamp = node.timestamp;

    for (const [id, n] of this.state.nodes) {
      if (n.timestamp > timestamp) {
        result.add(id);
      }
    }

    return result;
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
