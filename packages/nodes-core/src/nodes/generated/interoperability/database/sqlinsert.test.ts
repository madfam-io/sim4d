import { describe, it, expect } from 'vitest';
import { InteroperabilityDatabaseSQLInsertNode } from './sqlinsert.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityDatabaseSQLInsertNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      data: undefined,
    } as any;
    const params = {
      connectionString: '',
      tableName: '',
      batchSize: 100,
    } as any;

    const result = await InteroperabilityDatabaseSQLInsertNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
