import type { NodeDefinition } from '@brepflow/types';

interface ApollonianGasketParams {
  depth: number;
  minRadius: number;
}

interface ApollonianGasketInputs {
  outerCircle: unknown;
}

interface ApollonianGasketOutputs {
  circles: unknown;
}

export const PatternsFractalsApollonianGasketNode: NodeDefinition<
  ApollonianGasketInputs,
  ApollonianGasketOutputs,
  ApollonianGasketParams
> = {
  id: 'Patterns::ApollonianGasket',
  category: 'Patterns',
  label: 'ApollonianGasket',
  description: 'Apollonian gasket circles',
  inputs: {
    outerCircle: {
      type: 'Wire',
      label: 'Outer Circle',
      required: true,
    },
  },
  outputs: {
    circles: {
      type: 'Wire[]',
      label: 'Circles',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 5,
      min: 1,
      max: 10,
      step: 1,
    },
    minRadius: {
      type: 'number',
      label: 'Min Radius',
      default: 0.1,
      min: 0.01,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'apollonianGasket',
      params: {
        outerCircle: inputs.outerCircle,
        depth: params.depth,
        minRadius: params.minRadius,
      },
    });

    return {
      circles: result,
    };
  },
};
