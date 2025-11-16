import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsWoodJoistFloorNode } from './wood-joist-floor.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsWoodJoistFloorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      floorBoundary: undefined,
    } as any;
    const params = {
      joistDepth: 250,
      joistSpacing: 400,
      subfloorThickness: 18,
    } as any;

    const result = await ArchitectureFloorsWoodJoistFloorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
