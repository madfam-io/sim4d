import { NodeDefinition } from '@brepflow/types';

interface Params {
  host: string;
  port: number;
  timeout: number;
}
interface Inputs {
  data?: string;
}
interface Outputs {
  connected: boolean;
  response: string;
  error: string;
}

export const TCPClientNode: NodeDefinition<TCPClientInputs, TCPClientOutputs, TCPClientParams> = {
  type: 'Interoperability::TCPClient',
  category: 'Interoperability',
  subcategory: 'Streaming',

  metadata: {
    label: 'TCPClient',
    description: 'TCP socket client connection',
  },

  params: {
    host: {
      default: 'localhost',
    },
    port: {
      default: 8080,
      min: 1,
      max: 65535,
    },
    timeout: {
      default: 30,
      min: 1,
      max: 300,
    },
  },

  inputs: {
    data: 'string',
  },

  outputs: {
    connected: 'boolean',
    response: 'string',
    error: 'string',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'tcpClient',
      params: {
        data: inputs.data,
        host: params.host,
        port: params.port,
        timeout: params.timeout,
      },
    });

    return {
      connected: result,
      response: result,
      error: result,
    };
  },
};
