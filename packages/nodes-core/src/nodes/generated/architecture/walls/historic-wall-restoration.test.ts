import { describe, it, expect } from 'vitest';
import { ArchitectureWallsHistoricWallRestorationNode } from './historic-wall-restoration.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureWallsHistoricWallRestorationNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      existingWall: undefined,
    } as any;
    const params = {
      period: 'victorian',
      preservationLevel: 'preserve',
    } as any;

    const result = await ArchitectureWallsHistoricWallRestorationNode.evaluate(
      context,
      inputs,
      params
    );
    expect(result).toBeDefined();
  });
});
