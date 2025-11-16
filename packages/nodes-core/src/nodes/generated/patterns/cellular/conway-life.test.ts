import { describe, it, expect } from 'vitest';
import { PatternsCellularConwayLifeNode } from './conway-life.node';
import { createTestContext } from '../test-utils';

describe('PatternsCellularConwayLifeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      initialCells: undefined,
    } as any;
    const params = {
      generations: 10,
      cellSize: 1,
    } as any;

    const result = await PatternsCellularConwayLifeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
