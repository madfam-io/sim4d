import type { NodeDefinition } from '@brepflow/types';

interface CompositeCurveParams {
  continuity: string;
  mergeTolerance: number;
}

interface CompositeCurveInputs {
  curves: unknown;
}

interface CompositeCurveOutputs {
  composite: unknown;
}

export const SurfaceCurvesCompositeCurveNode: NodeDefinition<
  CompositeCurveInputs,
  CompositeCurveOutputs,
  CompositeCurveParams
> = {
  id: 'Surface::CompositeCurve',
  category: 'Surface',
  label: 'CompositeCurve',
  description: 'Create composite curve',
  inputs: {
    curves: {
      type: 'Wire[]',
      label: 'Curves',
      required: true,
    },
  },
  outputs: {
    composite: {
      type: 'Wire',
      label: 'Composite',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      label: 'Continuity',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    mergeTolerance: {
      type: 'number',
      label: 'Merge Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'compositeCurve',
      params: {
        curves: inputs.curves,
        continuity: params.continuity,
        mergeTolerance: params.mergeTolerance,
      },
    });

    return {
      composite: result,
    };
  },
};
