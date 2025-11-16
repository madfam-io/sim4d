import type { NodeDefinition } from '@brepflow/types';

interface S3UploadParams {
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
}

interface S3UploadInputs {
  filePath: unknown;
  key: unknown;
}

interface S3UploadOutputs {
  success: unknown;
  url: unknown;
  etag: unknown;
}

export const InteroperabilityCloudS3UploadNode: NodeDefinition<
  S3UploadInputs,
  S3UploadOutputs,
  S3UploadParams
> = {
  id: 'Interoperability::S3Upload',
  category: 'Interoperability',
  label: 'S3Upload',
  description: 'Upload files to AWS S3',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
    key: {
      type: 'string',
      label: 'Key',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    url: {
      type: 'string',
      label: 'Url',
    },
    etag: {
      type: 'string',
      label: 'Etag',
    },
  },
  params: {
    bucket: {
      type: 'string',
      label: 'Bucket',
      default: '',
    },
    accessKey: {
      type: 'string',
      label: 'Access Key',
      default: '',
    },
    secretKey: {
      type: 'string',
      label: 'Secret Key',
      default: '',
    },
    region: {
      type: 'string',
      label: 'Region',
      default: 'us-east-1',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 's3Upload',
      params: {
        filePath: inputs.filePath,
        key: inputs.key,
        bucket: params.bucket,
        accessKey: params.accessKey,
        secretKey: params.secretKey,
        region: params.region,
      },
    });

    return {
      success: results.success,
      url: results.url,
      etag: results.etag,
    };
  },
};
