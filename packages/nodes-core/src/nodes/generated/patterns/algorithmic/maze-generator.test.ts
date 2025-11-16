import { describe, it, expect } from 'vitest';
import { PatternsAlgorithmicMazeGeneratorNode } from './maze-generator.node';
import { createTestContext } from '../test-utils';

describe('PatternsAlgorithmicMazeGeneratorNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      boundary: undefined,
    } as any;
    const params = {
      algorithm: 'recursive-backtracker',
      width: 20,
      height: 20,
    } as any;

    const result = await PatternsAlgorithmicMazeGeneratorNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
