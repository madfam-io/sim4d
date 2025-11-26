import type { NodeDefinition } from '@sim4d/types';

interface PeanoCurveParams {
  order: number;
}

interface PeanoCurveInputs {
  bounds: unknown;
}

interface PeanoCurveOutputs {
  curve: unknown;
}

export const PatternsFractalsPeanoCurveNode: NodeDefinition<
  PeanoCurveInputs,
  PeanoCurveOutputs,
  PeanoCurveParams
> = {
  id: 'Patterns::PeanoCurve',
  category: 'Patterns',
  label: 'PeanoCurve',
  description: 'Peano space-filling curve',
  inputs: {
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {
    order: {
      type: 'number',
      label: 'Order',
      default: 3,
      min: 1,
      max: 6,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'peanoCurve',
      params: {
        bounds: inputs.bounds,
        order: params.order,
      },
    });

    return {
      curve: result,
    };
  },
};
