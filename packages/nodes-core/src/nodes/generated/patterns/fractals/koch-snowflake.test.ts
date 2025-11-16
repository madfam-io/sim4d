import { describe, it, expect } from 'vitest';
import { PatternsFractalsKochSnowflakeNode } from './koch-snowflake.node';
import { createTestContext } from '../test-utils';

describe('PatternsFractalsKochSnowflakeNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      triangle: undefined,
    } as any;
    const params = {
      iterations: 4,
    } as any;

    const result = await PatternsFractalsKochSnowflakeNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
