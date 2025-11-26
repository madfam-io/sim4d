import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  UndoRedoManager,
  Command,
  AddNodeCommand,
  RemoveNodeCommand,
  UpdateNodeCommand,
  AddEdgeCommand,
  RemoveEdgeCommand,
} from './undo-redo';
import type { NodeInstance, Edge } from '@sim4d/types';

describe('UndoRedoManager', () => {
  let manager: UndoRedoManager;

  beforeEach(() => {
    manager = new UndoRedoManager();
  });

  describe('Basic Operations', () => {
    it('should initialize with empty history', () => {
      expect(manager.canUndo()).toBe(false);
      expect(manager.canRedo()).toBe(false);
      expect(manager.getHistory()).toHaveLength(0);
    });

    it('should execute command and add to history', () => {
      const executeMock = vi.fn();
      const undoMock = vi.fn();

      const command: Command = {
        execute: executeMock,
        undo: undoMock,
        description: 'Test command',
      };

      manager.execute(command);

      expect(executeMock).toHaveBeenCalledOnce();
      expect(manager.canUndo()).toBe(true);
      expect(manager.canRedo()).toBe(false);
      expect(manager.getHistory()).toHaveLength(1);
    });

    it('should undo last command', () => {
      const executeMock = vi.fn();
      const undoMock = vi.fn();

      const command: Command = {
        execute: executeMock,
        undo: undoMock,
        description: 'Test command',
      };

      manager.execute(command);
      manager.undo();

      expect(undoMock).toHaveBeenCalledOnce();
      expect(manager.canUndo()).toBe(false);
      expect(manager.canRedo()).toBe(true);
    });

    it('should redo undone command', () => {
      const executeMock = vi.fn();
      const undoMock = vi.fn();

      const command: Command = {
        execute: executeMock,
        undo: undoMock,
        description: 'Test command',
      };

      manager.execute(command);
      manager.undo();
      manager.redo();

      expect(executeMock).toHaveBeenCalledTimes(2); // Once on execute, once on redo
      expect(manager.canUndo()).toBe(true);
      expect(manager.canRedo()).toBe(false);
    });

    it('should clear history', () => {
      const command: Command = {
        execute: vi.fn(),
        undo: vi.fn(),
        description: 'Test command',
      };

      manager.execute(command);
      expect(manager.getHistory()).toHaveLength(1);

      manager.clear();

      expect(manager.getHistory()).toHaveLength(0);
      expect(manager.canUndo()).toBe(false);
      expect(manager.canRedo()).toBe(false);
    });

    it('should handle multiple commands', () => {
      const commands: Command[] = [
        { execute: vi.fn(), undo: vi.fn(), description: 'Command 1' },
        { execute: vi.fn(), undo: vi.fn(), description: 'Command 2' },
        { execute: vi.fn(), undo: vi.fn(), description: 'Command 3' },
      ];

      commands.forEach((cmd) => manager.execute(cmd));

      expect(manager.getHistory()).toHaveLength(3);

      // Undo all
      manager.undo();
      expect(commands[2].undo).toHaveBeenCalled();

      manager.undo();
      expect(commands[1].undo).toHaveBeenCalled();

      manager.undo();
      expect(commands[0].undo).toHaveBeenCalled();

      expect(manager.canUndo()).toBe(false);

      // Redo all
      manager.redo();
      expect(commands[0].execute).toHaveBeenCalledTimes(2);

      manager.redo();
      expect(commands[1].execute).toHaveBeenCalledTimes(2);

      manager.redo();
      expect(commands[2].execute).toHaveBeenCalledTimes(2);

      expect(manager.canRedo()).toBe(false);
    });

    it('should overwrite future history when executing after undo', () => {
      const command1: Command = {
        execute: vi.fn(),
        undo: vi.fn(),
        description: 'Command 1',
      };

      const command2: Command = {
        execute: vi.fn(),
        undo: vi.fn(),
        description: 'Command 2',
      };

      const command3: Command = {
        execute: vi.fn(),
        undo: vi.fn(),
        description: 'Command 3',
      };

      manager.execute(command1);
      manager.execute(command2);
      manager.undo(); // Undo command2

      expect(manager.canRedo()).toBe(true);

      manager.execute(command3); // This should overwrite the redo history

      expect(manager.canRedo()).toBe(false);
      expect(manager.getHistory()).toHaveLength(2);
      expect(manager.getHistory()[0].description).toBe('Command 1');
      expect(manager.getHistory()[1].description).toBe('Command 3');
    });

    it('should limit history size', () => {
      // Create 150 commands (more than max history size of 100)
      for (let i = 0; i < 150; i++) {
        manager.execute({
          execute: vi.fn(),
          undo: vi.fn(),
          description: `Command ${i}`,
        });
      }

      // Should only keep last 100 commands
      expect(manager.getHistory().length).toBeLessThanOrEqual(100);
    });

    it('should not undo when history is empty', () => {
      expect(manager.canUndo()).toBe(false);
      manager.undo(); // Should not throw
      expect(manager.canUndo()).toBe(false);
    });

    it('should not redo when there is nothing to redo', () => {
      expect(manager.canRedo()).toBe(false);
      manager.redo(); // Should not throw
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('AddNodeCommand', () => {
    it('should execute add node operation', () => {
      const node: NodeInstance = {
        id: 'node-1',
        type: 'Solid::Box',
        position: { x: 100, y: 100 },
        params: { width: 100, height: 100, depth: 100 },
        inputs: {},
        dirty: false,
      };

      const addFn = vi.fn().mockReturnValue(node);
      const removeFn = vi.fn();

      const command = new AddNodeCommand(node, addFn, removeFn);

      command.execute();

      expect(addFn).toHaveBeenCalledWith(node);
      expect(command.description).toBe('Add Solid::Box node');
    });

    it('should undo add node operation', () => {
      const node: NodeInstance = {
        id: 'node-1',
        type: 'Solid::Cylinder',
        position: { x: 0, y: 0 },
        params: { radius: 50, height: 100 },
        inputs: {},
        dirty: false,
      };

      const addFn = vi.fn().mockReturnValue(node);
      const removeFn = vi.fn();

      const command = new AddNodeCommand(node, addFn, removeFn);

      command.execute();
      command.undo();

      expect(removeFn).toHaveBeenCalledWith('node-1');
    });
  });

  describe('RemoveNodeCommand', () => {
    it('should execute remove node operation', () => {
      const node: NodeInstance = {
        id: 'node-2',
        type: 'Solid::Sphere',
        position: { x: 50, y: 50 },
        params: { radius: 25 },
        inputs: {},
        dirty: false,
      };

      const addFn = vi.fn();
      const removeFn = vi.fn();

      const command = new RemoveNodeCommand(node, addFn, removeFn);

      command.execute();

      expect(removeFn).toHaveBeenCalledWith('node-2');
      expect(command.description).toBe('Remove Solid::Sphere node');
    });

    it('should undo remove node operation', () => {
      const node: NodeInstance = {
        id: 'node-2',
        type: 'Boolean::Union',
        position: { x: 200, y: 200 },
        params: {},
        inputs: {},
        dirty: false,
      };

      const addFn = vi.fn();
      const removeFn = vi.fn();

      const command = new RemoveNodeCommand(node, addFn, removeFn);

      command.execute();
      command.undo();

      expect(addFn).toHaveBeenCalledWith(node);
    });
  });

  describe('UpdateNodeCommand', () => {
    it('should execute update node operation', () => {
      const nodeId = 'node-3';
      const oldState = { position: { x: 0, y: 0 }, params: { width: 50 } };
      const newState = { position: { x: 100, y: 100 }, params: { width: 100 } };

      const updateFn = vi.fn();

      const command = new UpdateNodeCommand(nodeId, oldState, newState, updateFn);

      command.execute();

      expect(updateFn).toHaveBeenCalledWith(nodeId, newState);
      expect(command.description).toBe('Update node parameters');
    });

    it('should undo update node operation', () => {
      const nodeId = 'node-3';
      const oldState = { params: { radius: 25 } };
      const newState = { params: { radius: 50 } };

      const updateFn = vi.fn();

      const command = new UpdateNodeCommand(nodeId, oldState, newState, updateFn);

      command.execute();
      command.undo();

      expect(updateFn).toHaveBeenCalledWith(nodeId, oldState);
    });
  });

  describe('AddEdgeCommand', () => {
    it('should execute add edge operation', () => {
      const edge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        sourceHandle: 'output',
        target: 'node-2',
        targetHandle: 'input',
      };

      const addFn = vi.fn().mockReturnValue(edge);
      const removeFn = vi.fn();

      const command = new AddEdgeCommand(edge, addFn, removeFn);

      command.execute();

      expect(addFn).toHaveBeenCalledWith(edge);
      expect(command.description).toBe('Connect nodes');
    });

    it('should undo add edge operation', () => {
      const edge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        sourceHandle: 'output',
        target: 'node-2',
        targetHandle: 'input',
      };

      const addFn = vi.fn().mockReturnValue(edge);
      const removeFn = vi.fn();

      const command = new AddEdgeCommand(edge, addFn, removeFn);

      command.execute();
      command.undo();

      expect(removeFn).toHaveBeenCalledWith('edge-1');
    });
  });

  describe('RemoveEdgeCommand', () => {
    it('should execute remove edge operation', () => {
      const edge: Edge = {
        id: 'edge-2',
        source: 'node-3',
        sourceHandle: 'output',
        target: 'node-4',
        targetHandle: 'input',
      };

      const addFn = vi.fn();
      const removeFn = vi.fn();

      const command = new RemoveEdgeCommand(edge, addFn, removeFn);

      command.execute();

      expect(removeFn).toHaveBeenCalledWith('edge-2');
      expect(command.description).toBe('Disconnect nodes');
    });

    it('should undo remove edge operation', () => {
      const edge: Edge = {
        id: 'edge-2',
        source: 'node-3',
        sourceHandle: 'output',
        target: 'node-4',
        targetHandle: 'input',
      };

      const addFn = vi.fn();
      const removeFn = vi.fn();

      const command = new RemoveEdgeCommand(edge, addFn, removeFn);

      command.execute();
      command.undo();

      expect(addFn).toHaveBeenCalledWith(edge);
    });
  });

  describe('Integration with UndoRedoManager', () => {
    it('should handle complex command sequence', () => {
      const nodes: NodeInstance[] = [];
      const edges: Edge[] = [];

      // Mock functions
      const addNode = vi.fn((node: NodeInstance) => {
        nodes.push(node);
        return node;
      });

      const removeNode = vi.fn((id: string) => {
        const index = nodes.findIndex((n) => n.id === id);
        if (index >= 0) nodes.splice(index, 1);
      });

      const addEdge = vi.fn((edge: Edge) => {
        edges.push(edge);
        return edge;
      });

      const removeEdge = vi.fn((id: string) => {
        const index = edges.findIndex((e) => e.id === id);
        if (index >= 0) edges.splice(index, 1);
      });

      // Create nodes
      const node1: NodeInstance = {
        id: 'node-1',
        type: 'Solid::Box',
        position: { x: 0, y: 0 },
        params: {},
        inputs: {},
        dirty: false,
      };

      const node2: NodeInstance = {
        id: 'node-2',
        type: 'Boolean::Union',
        position: { x: 100, y: 0 },
        params: {},
        inputs: {},
        dirty: false,
      };

      // Create edge
      const edge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        sourceHandle: 'output',
        target: 'node-2',
        targetHandle: 'input',
      };

      // Execute commands
      manager.execute(new AddNodeCommand(node1, addNode, removeNode));
      expect(nodes).toHaveLength(1);

      manager.execute(new AddNodeCommand(node2, addNode, removeNode));
      expect(nodes).toHaveLength(2);

      manager.execute(new AddEdgeCommand(edge, addEdge, removeEdge));
      expect(edges).toHaveLength(1);

      // Undo all
      manager.undo(); // Remove edge
      expect(edges).toHaveLength(0);

      manager.undo(); // Remove node2
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('node-1');

      manager.undo(); // Remove node1
      expect(nodes).toHaveLength(0);

      // Redo all
      manager.redo(); // Add node1
      expect(nodes).toHaveLength(1);

      manager.redo(); // Add node2
      expect(nodes).toHaveLength(2);

      manager.redo(); // Add edge
      expect(edges).toHaveLength(1);
    });
  });
});
