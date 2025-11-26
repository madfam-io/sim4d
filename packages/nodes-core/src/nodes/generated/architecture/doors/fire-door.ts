import type { NodeDefinition } from '@sim4d/types';

interface FireDoorParams {
  rating: string;
  closer: boolean;
  panic: boolean;
}

interface FireDoorInputs {
  opening: unknown;
}

interface FireDoorOutputs {
  fireDoor: unknown;
}

export const ArchitectureDoorsFireDoorNode: NodeDefinition<
  FireDoorInputs,
  FireDoorOutputs,
  FireDoorParams
> = {
  id: 'Architecture::FireDoor',
  type: 'Architecture::FireDoor',
  category: 'Architecture',
  label: 'FireDoor',
  description: 'Fire-rated door',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    fireDoor: {
      type: 'Shape',
      label: 'Fire Door',
    },
  },
  params: {
    rating: {
      type: 'enum',
      label: 'Rating',
      default: '60-min',
      options: ['20-min', '45-min', '60-min', '90-min'],
    },
    closer: {
      type: 'boolean',
      label: 'Closer',
      default: true,
    },
    panic: {
      type: 'boolean',
      label: 'Panic',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fireDoor',
      params: {
        opening: inputs.opening,
        rating: params.rating,
        closer: params.closer,
        panic: params.panic,
      },
    });

    return {
      fireDoor: result,
    };
  },
};
