import { describe, it, expect } from 'vitest';
import { SolidHelicalSpringNode } from './spring.node';
import { createTestContext } from '../test-utils';

describe('SolidHelicalSpringNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      radius: 50,
      pitch: 20,
      height: 100,
      wireRadius: 5,
      leftHanded: false,
    } as any;

    const result = await SolidHelicalSpringNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
