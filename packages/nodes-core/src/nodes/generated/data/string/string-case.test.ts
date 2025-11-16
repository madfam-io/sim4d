import { describe, it, expect } from 'vitest';
import { DataStringStringCaseNode } from './string-case.node';
import { createTestContext } from '../test-utils';

describe('DataStringStringCaseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      string: undefined,
    } as any;
    const params = {
      case: 'lower',
    } as any;

    const result = await DataStringStringCaseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
