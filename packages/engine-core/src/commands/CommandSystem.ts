import { uuidv4 } from '../utils/uuid';

export interface Command {
  id: string;
  type: string;
  timestamp: number;
  description: string;
  execute(): Promise<unknown> | unknown;
  undo(): Promise<void> | void;
  redo?(): Promise<void> | void;
}

export interface CommandGroup {
  id: string;
  commands: Command[];
  description: string;
  timestamp: number;
}

export class CommandSystem {
  private undoStack: (Command | CommandGroup)[] = [];
  private redoStack: (Command | CommandGroup)[] = [];
  private currentGroup?: CommandGroup;
  private maxHistorySize = 100;
  private listeners: Set<(state: CommandSystemState) => void> = new Set();

  /**
   * Execute a command and add it to the undo stack
   */
  async execute(command: Command): Promise<unknown> {
    try {
      const result = await command.execute();

      // Add to current group or directly to undo stack
      if (this.currentGroup) {
        this.currentGroup.commands.push(command);
      } else {
        this.undoStack.push(command);
      }

      // Clear redo stack when new command is executed
      this.redoStack = [];

      // Limit history size
      this.trimHistory();
      this.notifyListeners();

      return result;
    } catch (error) {
      commandLogger.error(`Failed to execute command ${command.type}:`, error);
      throw error;
    }
  }

  /**
   * Start a command group for batching multiple operations
   */
  startGroup(description: string): string {
    const id = uuidv4();
    this.currentGroup = {
      id,
      commands: [],
      description,
      timestamp: Date.now(),
    };
    return id;
  }

  /**
   * End the current command group
   */
  endGroup(): void {
    if (this.currentGroup && this.currentGroup.commands.length > 0) {
      this.undoStack.push(this.currentGroup);
      this.redoStack = [];
      this.trimHistory();
      this.notifyListeners();
    }
    this.currentGroup = undefined;
  }

  /**
   * Undo the last command or command group
   */
  async undo(): Promise<boolean> {
    const item = this.undoStack.pop();
    if (!item) return false;

    try {
      if ('commands' in item) {
        // Undo command group in reverse order
        for (let i = item.commands.length - 1; i >= 0; i--) {
          await item.commands[i].undo();
        }
      } else {
        // Undo single command
        await item.undo();
      }

      this.redoStack.push(item);
      this.notifyListeners();
      return true;
    } catch (error) {
      commandLogger.error('Failed to undo command:', error);
      // Re-add to undo stack if undo failed
      this.undoStack.push(item);
      throw error;
    }
  }

  /**
   * Redo the last undone command or command group
   */
  async redo(): Promise<boolean> {
    const item = this.redoStack.pop();
    if (!item) return false;

    try {
      if ('commands' in item) {
        // Redo command group in original order
        for (const command of item.commands) {
          if (command.redo) {
            await command.redo();
          } else {
            await command.execute();
          }
        }
      } else {
        // Redo single command
        if (item.redo) {
          await item.redo();
        } else {
          await item.execute();
        }
      }

      this.undoStack.push(item);
      this.notifyListeners();
      return true;
    } catch (error) {
      commandLogger.error('Failed to redo command:', error);
      // Re-add to redo stack if redo failed
      this.redoStack.push(item);
      throw error;
    }
  }

  /**
   * Clear all command history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.currentGroup = undefined;
    this.notifyListeners();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get command history for UI display
   */
  getHistory(): CommandSystemState {
    return {
      undoStack: this.undoStack.map((item) => ({
        id: 'commands' in item ? item.id : item.id,
        description: 'commands' in item ? item.description : item.description,
        type: 'commands' in item ? 'group' : 'command',
        timestamp: 'commands' in item ? item.timestamp : item.timestamp,
        commandCount: 'commands' in item ? item.commands.length : 1,
      })),
      redoStack: this.redoStack.map((item) => ({
        id: 'commands' in item ? item.id : item.id,
        description: 'commands' in item ? item.description : item.description,
        type: 'commands' in item ? 'group' : 'command',
        timestamp: 'commands' in item ? item.timestamp : item.timestamp,
        commandCount: 'commands' in item ? item.commands.length : 1,
      })),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentGroup: this.currentGroup
        ? {
            id: this.currentGroup.id,
            description: this.currentGroup.description,
            commandCount: this.currentGroup.commands.length,
          }
        : undefined,
    };
  }

  /**
   * Subscribe to command system changes
   */
  subscribe(listener: (state: CommandSystemState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Set maximum history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    this.trimHistory();
  }

  private trimHistory(): void {
    while (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    while (this.redoStack.length > this.maxHistorySize) {
      this.redoStack.shift();
    }
  }

  private notifyListeners(): void {
    const state = this.getHistory();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export interface CommandSystemState {
  undoStack: {
    id: string;
    description: string;
    type: 'command' | 'group';
    timestamp: number;
    commandCount: number;
  }[];
  redoStack: {
    id: string;
    description: string;
    type: 'command' | 'group';
    timestamp: number;
    commandCount: number;
  }[];
  canUndo: boolean;
  canRedo: boolean;
  currentGroup?: {
    id: string;
    description: string;
    commandCount: number;
  };
}

// Common command implementations
export class GraphCommand implements Command {
  id = uuidv4();
  timestamp = Date.now();

  constructor(
    public type: string,
    public description: string,
    private executeFunc: () => unknown,
    private undoFunc: () => void,
    private redoFunc?: () => void
  ) {}

  async execute(): Promise<unknown> {
    return this.executeFunc();
  }

  async undo(): Promise<void> {
    this.undoFunc();
  }

  async redo(): Promise<void> {
    if (this.redoFunc) {
      this.redoFunc();
    } else {
      await this.execute();
    }
  }
}

export class NodeCommand extends GraphCommand {
  constructor(
    operation: string,
    nodeId: string,
    executeFunc: () => unknown,
    undoFunc: () => void,
    redoFunc?: () => void
  ) {
    super(
      `node.${operation}`,
      `${operation} node ${nodeId.slice(0, 8)}`,
      executeFunc,
      undoFunc,
      redoFunc
    );
  }
}

export class ParameterCommand extends GraphCommand {
  constructor(
    nodeId: string,
    paramName: string,
    oldValue: unknown,
    newValue: unknown,
    executeFunc: () => unknown,
    undoFunc: () => void
  ) {
    super(
      'parameter.update',
      `Update ${paramName}: ${oldValue} → ${newValue}`,
      executeFunc,
      undoFunc
    );
  }
}
