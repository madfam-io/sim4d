import type { NodeDefinition } from '@sim4d/types';

interface HTTPRequestParams {
  method: string;
  url: string;
  timeout: number;
  retries: number;
}

interface HTTPRequestInputs {
  headers?: unknown;
  body?: unknown;
}

interface HTTPRequestOutputs {
  response: unknown;
  statusCode: unknown;
  headers: unknown;
}

export const InteroperabilityAPIHTTPRequestNode: NodeDefinition<
  HTTPRequestInputs,
  HTTPRequestOutputs,
  HTTPRequestParams
> = {
  id: 'Interoperability::HTTPRequest',
  category: 'Interoperability',
  label: 'HTTPRequest',
  description: 'Make HTTP REST API requests',
  inputs: {
    headers: {
      type: 'Properties',
      label: 'Headers',
      optional: true,
    },
    body: {
      type: 'Properties',
      label: 'Body',
      optional: true,
    },
  },
  outputs: {
    response: {
      type: 'Properties',
      label: 'Response',
    },
    statusCode: {
      type: 'number',
      label: 'Status Code',
    },
    headers: {
      type: 'Properties',
      label: 'Headers',
    },
  },
  params: {
    method: {
      type: 'enum',
      label: 'Method',
      default: 'GET',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    url: {
      type: 'string',
      label: 'Url',
      default: '',
    },
    timeout: {
      type: 'number',
      label: 'Timeout',
      default: 30,
      min: 1,
      max: 300,
    },
    retries: {
      type: 'number',
      label: 'Retries',
      default: 3,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'httpRequest',
      params: {
        headers: inputs.headers,
        body: inputs.body,
        method: params.method,
        url: params.url,
        timeout: params.timeout,
        retries: params.retries,
      },
    });

    return {
      response: results.response,
      statusCode: results.statusCode,
      headers: results.headers,
    };
  },
};
