import type { NodeDefinition } from '@sim4d/types';

interface S3DownloadParams {
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
}

interface S3DownloadInputs {
  key: unknown;
  localPath: unknown;
}

interface S3DownloadOutputs {
  success: unknown;
  fileSize: unknown;
  metadata: unknown;
}

export const InteroperabilityCloudS3DownloadNode: NodeDefinition<
  S3DownloadInputs,
  S3DownloadOutputs,
  S3DownloadParams
> = {
  id: 'Interoperability::S3Download',
  type: 'Interoperability::S3Download',
  category: 'Interoperability',
  label: 'S3Download',
  description: 'Download files from AWS S3',
  inputs: {
    key: {
      type: 'string',
      label: 'Key',
      required: true,
    },
    localPath: {
      type: 'string',
      label: 'Local Path',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    fileSize: {
      type: 'number',
      label: 'File Size',
    },
    metadata: {
      type: 'Properties',
      label: 'Metadata',
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
      type: 's3Download',
      params: {
        key: inputs.key,
        localPath: inputs.localPath,
        bucket: params.bucket,
        accessKey: params.accessKey,
        secretKey: params.secretKey,
        region: params.region,
      },
    });

    return {
      success: results.success,
      fileSize: results.fileSize,
      metadata: results.metadata,
    };
  },
};
