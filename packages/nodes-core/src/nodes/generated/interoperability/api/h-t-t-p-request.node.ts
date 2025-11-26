import { NodeDefinition } from '@sim4d/types';

interface Params {
  method: string;
  url: string;
  timeout: number;
  retries: number;
}
interface Inputs {
  headers?: Properties;
  body?: Properties;
}
interface Outputs {
  response: Properties;
  statusCode: number;
  headers: Properties;
}

export const HTTPRequestNode: NodeDefinition<
  HTTPRequestInputs,
  HTTPRequestOutputs,
  HTTPRequestParams
> = {
  type: 'Interoperability::HTTPRequest',
  category: 'Interoperability',
  subcategory: 'API',

  metadata: {
    label: 'HTTPRequest',
    description: 'Make HTTP REST API requests',
  },

  params: {
    method: {
      default: 'GET',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    url: {
      default: '',
      description: 'API endpoint URL',
    },
    timeout: {
      default: 30,
      min: 1,
      max: 300,
    },
    retries: {
      default: 3,
      min: 0,
      max: 10,
    },
  },

  inputs: {
    headers: 'Properties',
    body: 'Properties',
  },

  outputs: {
    response: 'Properties',
    statusCode: 'number',
    headers: 'Properties',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      response: result,
      statusCode: result,
      headers: result,
    };
  },
};
