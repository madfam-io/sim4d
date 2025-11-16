import { describe, it, expect } from 'vitest';
import { SurfaceAnalysisReflectionLinesNode } from './reflection-lines.node';
import { createTestContext } from '../test-utils';

describe('SurfaceAnalysisReflectionLinesNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      lineCount: 10,
      viewDirection: [0, 0, 1],
    } as any;

    const result = await SurfaceAnalysisReflectionLinesNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
