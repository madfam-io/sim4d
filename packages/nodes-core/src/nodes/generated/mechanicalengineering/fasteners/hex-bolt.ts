import type { NodeDefinition } from '@sim4d/types';

interface HexBoltParams {
  diameter: string;
  length: number;
  threadPitch: number;
  headHeight: number;
}

interface HexBoltInputs {
  position: [number, number, number];
  direction?: [number, number, number];
}

interface HexBoltOutputs {
  bolt: unknown;
  thread: unknown;
}

export const MechanicalEngineeringFastenersHexBoltNode: NodeDefinition<
  HexBoltInputs,
  HexBoltOutputs,
  HexBoltParams
> = {
  id: 'MechanicalEngineering::HexBolt',
  type: 'MechanicalEngineering::HexBolt',
  category: 'MechanicalEngineering',
  label: 'HexBolt',
  description: 'Create hex head bolt',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
    direction: {
      type: 'Vector',
      label: 'Direction',
      optional: true,
    },
  },
  outputs: {
    bolt: {
      type: 'Shape',
      label: 'Bolt',
    },
    thread: {
      type: 'Wire',
      label: 'Thread',
    },
  },
  params: {
    diameter: {
      type: 'enum',
      label: 'Diameter',
      default: 'M6',
      options: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'],
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 20,
      min: 5,
      max: 200,
    },
    threadPitch: {
      type: 'number',
      label: 'Thread Pitch',
      default: 1,
      min: 0.5,
      max: 3,
      step: 0.25,
    },
    headHeight: {
      type: 'number',
      label: 'Head Height',
      default: 4,
      min: 2,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'hexBolt',
      params: {
        position: inputs.position,
        direction: inputs.direction,
        diameter: params.diameter,
        length: params.length,
        threadPitch: params.threadPitch,
        headHeight: params.headHeight,
      },
    });

    return {
      bolt: results.bolt,
      thread: results.thread,
    };
  },
};
