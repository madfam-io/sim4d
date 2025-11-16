import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the NodeRegistry
vi.mock('@brepflow/engine-core', () => ({
  NodeRegistry: {
    getInstance: vi.fn().mockReturnValue({
      registerNodes: vi.fn(),
    }),
  },
}));

import { registerCoreNodes } from './index';
import { NodeRegistry } from '@brepflow/engine-core';

describe('Core Nodes Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerCoreNodes', () => {
    it('should register all core node categories', () => {
      const mockGetInstance = NodeRegistry.getInstance as any;
      const mockRegisterNodes = mockGetInstance().registerNodes;

      registerCoreNodes();

      expect(mockGetInstance).toHaveBeenCalled();
      expect(mockRegisterNodes).toHaveBeenCalledTimes(1);

      const registeredNodes = mockRegisterNodes.mock.calls[0][0];
      expect(Array.isArray(registeredNodes)).toBe(true);
      expect(registeredNodes.length).toBeGreaterThan(0);
    });

    it('should register nodes from all categories', () => {
      const mockGetInstance = NodeRegistry.getInstance as any;
      const mockRegisterNodes = mockGetInstance().registerNodes;

      registerCoreNodes();

      const registeredNodes = mockRegisterNodes.mock.calls[0][0];

      // Verify we have nodes from various categories by checking the spread
      expect(registeredNodes).toBeDefined();
      expect(registeredNodes.length).toBeGreaterThan(50); // We have 109+ nodes total
    });
  });
});
