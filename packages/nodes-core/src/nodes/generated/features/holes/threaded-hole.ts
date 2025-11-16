import type { NodeDefinition } from '@brepflow/types';

interface ThreadedHoleParams {
  threadSize: string;
  pitch: number;
  depth: number;
  threadClass: string;
}

interface ThreadedHoleInputs {
  solid: unknown;
  position: [number, number, number];
}

interface ThreadedHoleOutputs {
  shape: unknown;
}

export const FeaturesHolesThreadedHoleNode: NodeDefinition<
  ThreadedHoleInputs,
  ThreadedHoleOutputs,
  ThreadedHoleParams
> = {
  id: 'Features::ThreadedHole',
  type: 'Features::ThreadedHole',
  category: 'Features',
  label: 'ThreadedHole',
  description: 'Creates a threaded (tapped) hole',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    threadSize: {
      type: 'enum',
      label: 'Thread Size',
      default: 'M6',
      options: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'],
    },
    pitch: {
      type: 'number',
      label: 'Pitch',
      default: 1,
      min: 0.25,
      max: 3,
      step: 0.25,
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 20,
      min: 1,
      max: 1000,
    },
    threadClass: {
      type: 'enum',
      label: 'Thread Class',
      default: '6H',
      options: ['6H', '6g', '7H'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'MAKE_THREADED_HOLE',
      params: {
        solid: inputs.solid,
        position: inputs.position,
        threadSize: params.threadSize,
        pitch: params.pitch,
        depth: params.depth,
        threadClass: params.threadClass,
      },
    });

    return {
      shape: result,
    };
  },
};
