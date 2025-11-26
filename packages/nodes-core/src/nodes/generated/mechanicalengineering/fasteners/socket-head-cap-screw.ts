import type { NodeDefinition } from '@sim4d/types';

interface SocketHeadCapScrewParams {
  diameter: string;
  length: number;
  socketSize: number;
  headDiameter: number;
}

interface SocketHeadCapScrewInputs {
  position: [number, number, number];
}

interface SocketHeadCapScrewOutputs {
  screw: unknown;
  socket: unknown;
}

export const MechanicalEngineeringFastenersSocketHeadCapScrewNode: NodeDefinition<
  SocketHeadCapScrewInputs,
  SocketHeadCapScrewOutputs,
  SocketHeadCapScrewParams
> = {
  id: 'MechanicalEngineering::SocketHeadCapScrew',
  type: 'MechanicalEngineering::SocketHeadCapScrew',
  category: 'MechanicalEngineering',
  label: 'SocketHeadCapScrew',
  description: 'Create socket head cap screw',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    screw: {
      type: 'Shape',
      label: 'Screw',
    },
    socket: {
      type: 'Wire',
      label: 'Socket',
    },
  },
  params: {
    diameter: {
      type: 'enum',
      label: 'Diameter',
      default: 'M5',
      options: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10'],
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 16,
      min: 6,
      max: 100,
    },
    socketSize: {
      type: 'number',
      label: 'Socket Size',
      default: 4,
      min: 2,
      max: 10,
    },
    headDiameter: {
      type: 'number',
      label: 'Head Diameter',
      default: 8.5,
      min: 5,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'socketHeadScrew',
      params: {
        position: inputs.position,
        diameter: params.diameter,
        length: params.length,
        socketSize: params.socketSize,
        headDiameter: params.headDiameter,
      },
    });

    return {
      screw: results.screw,
      socket: results.socket,
    };
  },
};
