import type { GraphInstance, NodeInstance, Edge } from '@sim4d/types';

export interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

export class UndoRedoManager {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxHistorySize = 100;

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  execute(command: Command): void {
    // Remove any commands after current index (they're being overwritten)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new command
    this.history.push(command);

    // Execute the command
    command.execute();

    // Update index
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): void {
    if (!this.canUndo()) return;

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
  }

  redo(): void {
    if (!this.canRedo()) return;

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistory(): Command[] {
    return this.history.slice(0, this.currentIndex + 1);
  }
}

// Command implementations
export class AddNodeCommand implements Command {
  constructor(
    private node: NodeInstance,
    private addFn: (node: Omit<NodeInstance, 'id'>) => NodeInstance,
    private removeFn: (nodeId: string) => void
  ) {}

  execute(): void {
    this.addFn(this.node);
  }

  undo(): void {
    this.removeFn(this.node.id);
  }

  get description(): string {
    return `Add ${this.node.type} node`;
  }
}

export class RemoveNodeCommand implements Command {
  constructor(
    private node: NodeInstance,
    private addFn: (node: Omit<NodeInstance, 'id'>) => NodeInstance,
    private removeFn: (nodeId: string) => void
  ) {}

  execute(): void {
    this.removeFn(this.node.id);
  }

  undo(): void {
    this.addFn(this.node);
  }

  get description(): string {
    return `Remove ${this.node.type} node`;
  }
}

export class UpdateNodeCommand implements Command {
  constructor(
    private nodeId: string,
    private oldState: Partial<NodeInstance>,
    private newState: Partial<NodeInstance>,
    private updateFn: (nodeId: string, updates: Partial<NodeInstance>) => void
  ) {}

  execute(): void {
    this.updateFn(this.nodeId, this.newState);
  }

  undo(): void {
    this.updateFn(this.nodeId, this.oldState);
  }

  get description(): string {
    return `Update node parameters`;
  }
}

export class AddEdgeCommand implements Command {
  constructor(
    private edge: Edge,
    private addFn: (edge: Omit<Edge, 'id'>) => Edge,
    private removeFn: (edgeId: string) => void
  ) {}

  execute(): void {
    this.addFn(this.edge);
  }

  undo(): void {
    this.removeFn(this.edge.id);
  }

  get description(): string {
    return `Connect nodes`;
  }
}

export class RemoveEdgeCommand implements Command {
  constructor(
    private edge: Edge,
    private addFn: (edge: Omit<Edge, 'id'>) => Edge,
    private removeFn: (edgeId: string) => void
  ) {}

  execute(): void {
    this.removeFn(this.edge.id);
  }

  undo(): void {
    this.addFn(this.edge);
  }

  get description(): string {
    return `Disconnect nodes`;
  }
}
