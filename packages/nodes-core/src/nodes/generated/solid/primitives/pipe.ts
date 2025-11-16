import type { NodeDefinition } from '@brepflow/types';

interface PipeParams {
  outerRadius: number;
  innerRadius: number;
  height: number;
}

type PipeInputs = Record<string, never>;

interface PipeOutputs {
  solid: unknown;
}

export const SolidPrimitivesPipeNode: NodeDefinition<PipeInputs, PipeOutputs, PipeParams> = {
  id: 'Solid::Pipe',
  type: 'Solid::Pipe',
  category: 'Solid',
  label: 'Pipe',
  description: 'Create a pipe (hollow cylinder)',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    outerRadius: {
      type: 'number',
      label: 'Outer Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    innerRadius: {
      type: 'number',
      label: 'Inner Radius',
      default: 40,
      min: 0.1,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePipe',
      params: {
        outerRadius: params.outerRadius,
        innerRadius: params.innerRadius,
        height: params.height,
      },
    });

    return {
      solid: result,
    };
  },
};
