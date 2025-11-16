import { describe, it, expect } from 'vitest';
import { FabricationLaserMaterialDatabaseNode } from './material-database.node';
import { createTestContext } from '../test-utils';

describe('FabricationLaserMaterialDatabaseNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {} as any;
    const params = {
      material: 'acrylic',
      thickness: 3,
    } as any;

    const result = await FabricationLaserMaterialDatabaseNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
