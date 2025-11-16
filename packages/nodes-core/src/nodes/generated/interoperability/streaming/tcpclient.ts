import type { NodeDefinition } from '@brepflow/types';

interface TCPClientParams {
  host: string;
  port: number;
  timeout: number;
}

interface TCPClientInputs {
  data?: unknown;
}

interface TCPClientOutputs {
  connected: unknown;
  response: unknown;
  error: unknown;
}

export const InteroperabilityStreamingTCPClientNode: NodeDefinition<
  TCPClientInputs,
  TCPClientOutputs,
  TCPClientParams
> = {
  id: 'Interoperability::TCPClient',
  type: 'Interoperability::TCPClient',
  category: 'Interoperability',
  label: 'TCPClient',
  description: 'TCP socket client connection',
  inputs: {
    data: {
      type: 'string',
      label: 'Data',
      optional: true,
    },
  },
  outputs: {
    connected: {
      type: 'boolean',
      label: 'Connected',
    },
    response: {
      type: 'string',
      label: 'Response',
    },
    error: {
      type: 'string',
      label: 'Error',
    },
  },
  params: {
    host: {
      type: 'string',
      label: 'Host',
      default: 'localhost',
    },
    port: {
      type: 'number',
      label: 'Port',
      default: 8080,
      min: 1,
      max: 65535,
    },
    timeout: {
      type: 'number',
      label: 'Timeout',
      default: 30,
      min: 1,
      max: 300,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'tcpClient',
      params: {
        data: inputs.data,
        host: params.host,
        port: params.port,
        timeout: params.timeout,
      },
    });

    return {
      connected: results.connected,
      response: results.response,
      error: results.error,
    };
  },
};
