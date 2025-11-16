import { describe, it, expect } from 'vitest';
import { SketchCurvesHyperbolaNode } from './hyperbola.node';
import { createTestContext } from '../test-utils';

describe('SketchCurvesHyperbolaNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      majorRadius: 50,
      minorRadius: 30,
      startParam: -2,
      endParam: 2,
    } as any;

    const result = await SketchCurvesHyperbolaNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
