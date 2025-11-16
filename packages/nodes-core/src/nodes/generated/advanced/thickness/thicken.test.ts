import { describe, it, expect } from 'vitest';
import { AdvancedThicknessThickenNode } from './thicken.node';
import { createTestContext } from '../test-utils';

describe('AdvancedThicknessThickenNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      surface: undefined,
    } as any;
    const params = {
      thickness: 5,
      direction: 'normal',
      autoClose: true,
    } as any;

    const result = await AdvancedThicknessThickenNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
