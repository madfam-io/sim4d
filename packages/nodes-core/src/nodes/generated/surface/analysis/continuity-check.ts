import type { NodeDefinition } from '@brepflow/types';

interface ContinuityCheckParams {
  checkType: string;
  tolerance: number;
}

interface ContinuityCheckInputs {
  surface1: unknown;
  surface2: unknown;
  edge?: unknown;
}

interface ContinuityCheckOutputs {
  isContinuous: unknown;
  deviations: unknown;
}

export const SurfaceAnalysisContinuityCheckNode: NodeDefinition<
  ContinuityCheckInputs,
  ContinuityCheckOutputs,
  ContinuityCheckParams
> = {
  id: 'Surface::ContinuityCheck',
  type: 'Surface::ContinuityCheck',
  category: 'Surface',
  label: 'ContinuityCheck',
  description: 'Check surface continuity',
  inputs: {
    surface1: {
      type: 'Face',
      label: 'Surface1',
      required: true,
    },
    surface2: {
      type: 'Face',
      label: 'Surface2',
      required: true,
    },
    edge: {
      type: 'Edge',
      label: 'Edge',
      optional: true,
    },
  },
  outputs: {
    isContinuous: {
      type: 'boolean',
      label: 'Is Continuous',
    },
    deviations: {
      type: 'Data',
      label: 'Deviations',
    },
  },
  params: {
    checkType: {
      type: 'enum',
      label: 'Check Type',
      default: 'G1',
      options: ['G0', 'G1', 'G2', 'G3'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'continuityCheck',
      params: {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        edge: inputs.edge,
        checkType: params.checkType,
        tolerance: params.tolerance,
      },
    });

    return {
      isContinuous: results.isContinuous,
      deviations: results.deviations,
    };
  },
};
