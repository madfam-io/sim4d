import type { NodeDefinition } from '@brepflow/types';

interface IsocurveExtractParams {
  direction: string;
  count: number;
}

interface IsocurveExtractInputs {
  surface: unknown;
}

interface IsocurveExtractOutputs {
  isocurves: unknown;
}

export const SurfaceAnalysisIsocurveExtractNode: NodeDefinition<
  IsocurveExtractInputs,
  IsocurveExtractOutputs,
  IsocurveExtractParams
> = {
  id: 'Surface::IsocurveExtract',
  category: 'Surface',
  label: 'IsocurveExtract',
  description: 'Extract isocurves',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    isocurves: {
      type: 'Wire[]',
      label: 'Isocurves',
    },
  },
  params: {
    direction: {
      type: 'enum',
      label: 'Direction',
      default: 'both',
      options: ['U', 'V', 'both'],
    },
    count: {
      type: 'number',
      label: 'Count',
      default: 10,
      min: 1,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'isocurveExtract',
      params: {
        surface: inputs.surface,
        direction: params.direction,
        count: params.count,
      },
    });

    return {
      isocurves: result,
    };
  },
};
