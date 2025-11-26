import type { NodeDefinition } from '@sim4d/types';

interface StressReliefParams {
  analysisType: string;
  reliefRadius: number;
}

interface StressReliefInputs {
  shape: unknown;
  stressData?: unknown;
}

interface StressReliefOutputs {
  relieved: unknown;
}

export const SpecializedOptimizationStressReliefNode: NodeDefinition<
  StressReliefInputs,
  StressReliefOutputs,
  StressReliefParams
> = {
  id: 'Specialized::StressRelief',
  type: 'Specialized::StressRelief',
  category: 'Specialized',
  label: 'StressRelief',
  description: 'Add stress relief features',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    stressData: {
      type: 'Data',
      label: 'Stress Data',
      optional: true,
    },
  },
  outputs: {
    relieved: {
      type: 'Shape',
      label: 'Relieved',
    },
  },
  params: {
    analysisType: {
      type: 'enum',
      label: 'Analysis Type',
      default: 'geometric',
      options: ['fea-based', 'geometric', 'hybrid'],
    },
    reliefRadius: {
      type: 'number',
      label: 'Relief Radius',
      default: 2,
      min: 0.1,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stressRelief',
      params: {
        shape: inputs.shape,
        stressData: inputs.stressData,
        analysisType: params.analysisType,
        reliefRadius: params.reliefRadius,
      },
    });

    return {
      relieved: result,
    };
  },
};
