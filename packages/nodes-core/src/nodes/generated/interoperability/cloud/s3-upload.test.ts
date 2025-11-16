import { describe, it, expect } from 'vitest';
import { InteroperabilityCloudS3UploadNode } from './s3-upload.node';
import { createTestContext } from '../test-utils';

describe('InteroperabilityCloudS3UploadNode', () => {
  it('should evaluate without throwing', async () => {
    const context = createTestContext();
    const inputs = {
      filePath: undefined,
      key: undefined,
    } as any;
    const params = {
      bucket: '',
      accessKey: '',
      secretKey: '',
      region: 'us-east-1',
    } as any;

    const result = await InteroperabilityCloudS3UploadNode.evaluate(context, inputs, params);
    expect(result).toBeDefined();
  });
});
