import type { NodeDefinition } from '@brepflow/types';

interface SerialPortParams {
  port: string;
  baudRate: string;
  dataBits: string;
  parity: string;
}

interface SerialPortInputs {
  data?: unknown;
}

interface SerialPortOutputs {
  connected: unknown;
  received: unknown;
  buffer: unknown;
}

export const InteroperabilityStreamingSerialPortNode: NodeDefinition<
  SerialPortInputs,
  SerialPortOutputs,
  SerialPortParams
> = {
  id: 'Interoperability::SerialPort',
  type: 'Interoperability::SerialPort',
  category: 'Interoperability',
  label: 'SerialPort',
  description: 'Communicate with serial devices',
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
    received: {
      type: 'string',
      label: 'Received',
    },
    buffer: {
      type: 'string[]',
      label: 'Buffer',
    },
  },
  params: {
    port: {
      type: 'string',
      label: 'Port',
      default: 'COM1',
    },
    baudRate: {
      type: 'enum',
      label: 'Baud Rate',
      default: '9600',
      options: ['9600', '19200', '38400', '57600', '115200'],
    },
    dataBits: {
      type: 'enum',
      label: 'Data Bits',
      default: '8',
      options: ['7', '8'],
    },
    parity: {
      type: 'enum',
      label: 'Parity',
      default: 'none',
      options: ['none', 'even', 'odd'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'serialPort',
      params: {
        data: inputs.data,
        port: params.port,
        baudRate: params.baudRate,
        dataBits: params.dataBits,
        parity: params.parity,
      },
    });

    return {
      connected: results.connected,
      received: results.received,
      buffer: results.buffer,
    };
  },
};
