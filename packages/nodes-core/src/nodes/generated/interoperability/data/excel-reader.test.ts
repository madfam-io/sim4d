import { describe, it, expect } from 'vitest';
import { InteroperabilityDataExcelReaderNode } from './excel-reader.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityDataExcelReaderNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      filePath: undefined,
    } as any;
    const params = {
      sheetName: '',
      hasHeader: true,
      range: '',
    } as any;

    const result = await InteroperabilityDataExcelReaderNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
