import type { NodeDefinition } from '@brepflow/types';

interface EscapeStairParams {
  enclosure: string;
  width: number;
}

interface EscapeStairInputs {
  stairwell: unknown;
  floors: number;
}

interface EscapeStairOutputs {
  escapeStair: unknown;
}

export const ArchitectureStairsEscapeStairNode: NodeDefinition<
  EscapeStairInputs,
  EscapeStairOutputs,
  EscapeStairParams
> = {
  id: 'Architecture::EscapeStair',
  type: 'Architecture::EscapeStair',
  category: 'Architecture',
  label: 'EscapeStair',
  description: 'Fire escape staircase',
  inputs: {
    stairwell: {
      type: 'Wire',
      label: 'Stairwell',
      required: true,
    },
    floors: {
      type: 'Number',
      label: 'Floors',
      required: true,
    },
  },
  outputs: {
    escapeStair: {
      type: 'Shape',
      label: 'Escape Stair',
    },
  },
  params: {
    enclosure: {
      type: 'enum',
      label: 'Enclosure',
      default: 'enclosed',
      options: ['open', 'enclosed', 'pressurized'],
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 1200,
      min: 1100,
      max: 1500,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'escapeStair',
      params: {
        stairwell: inputs.stairwell,
        floors: inputs.floors,
        enclosure: params.enclosure,
        width: params.width,
      },
    });

    return {
      escapeStair: result,
    };
  },
};
