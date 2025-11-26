import type { NodeDefinition } from '@sim4d/types';

interface CurveTorsionParams {
  samples: number;
  scale: number;
  showGraph: boolean;
}

interface CurveTorsionInputs {
  curve: unknown;
}

interface CurveTorsionOutputs {
  torsionValues: unknown;
  maxTorsion: unknown;
  torsionGraph: unknown;
}

export const AnalysisCurvesCurveTorsionNode: NodeDefinition<
  CurveTorsionInputs,
  CurveTorsionOutputs,
  CurveTorsionParams
> = {
  id: 'Analysis::CurveTorsion',
  type: 'Analysis::CurveTorsion',
  category: 'Analysis',
  label: 'CurveTorsion',
  description: 'Calculate curve torsion values',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    torsionValues: {
      type: 'number[]',
      label: 'Torsion Values',
    },
    maxTorsion: {
      type: 'number',
      label: 'Max Torsion',
    },
    torsionGraph: {
      type: 'Wire',
      label: 'Torsion Graph',
    },
  },
  params: {
    samples: {
      type: 'number',
      label: 'Samples',
      default: 100,
      min: 10,
      max: 500,
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 1,
      min: 0.1,
      max: 10,
    },
    showGraph: {
      type: 'boolean',
      label: 'Show Graph',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveTorsion',
      params: {
        curve: inputs.curve,
        samples: params.samples,
        scale: params.scale,
        showGraph: params.showGraph,
      },
    });

    return {
      torsionValues: results.torsionValues,
      maxTorsion: results.maxTorsion,
      torsionGraph: results.torsionGraph,
    };
  },
};
