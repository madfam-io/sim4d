import { describe, it, expect } from 'vitest';
import { ArchitectureFloorsRaisedFloorNode } from './raised-floor.node';
import { createTestContext } from '../test-utils';

describe('ArchitectureFloorsRaisedFloorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      roomBoundary: undefined,
    } as any;
    const params = {
      height: 300,
      panelSize: 600,
      loadRating: 1250,
    } as any;

    const result = await ArchitectureFloorsRaisedFloorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
