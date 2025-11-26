import type { NodeDefinition } from '@sim4d/types';

interface HilbertCurveParams {
  order: number;
  dimension: string;
}

interface HilbertCurveInputs {
  bounds: unknown;
}

interface HilbertCurveOutputs {
  curve: unknown;
}

export const PatternsFractalsHilbertCurveNode: NodeDefinition<
  HilbertCurveInputs,
  HilbertCurveOutputs,
  HilbertCurveParams
> = {
  id: 'Patterns::HilbertCurve',
  type: 'Patterns::HilbertCurve',
  category: 'Patterns',
  label: 'HilbertCurve',
  description: 'Hilbert space-filling curve',
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
      default: 4,
      min: 1,
      max: 8,
      step: 1,
    },
    dimension: {
      type: 'enum',
      label: 'Dimension',
      default: '2D',
      options: ['2D', '3D'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'hilbertCurve',
      params: {
        bounds: inputs.bounds,
        order: params.order,
        dimension: params.dimension,
      },
    });

    return {
      curve: result,
    };
  },
};
