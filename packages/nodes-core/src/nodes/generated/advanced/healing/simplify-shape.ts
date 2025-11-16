import type { NodeDefinition } from '@brepflow/types';

interface SimplifyShapeParams {
  simplifyMethod: string;
  tolerance: number;
  preserveTopology: boolean;
}

interface SimplifyShapeInputs {
  shape: unknown;
}

interface SimplifyShapeOutputs {
  simplified: unknown;
}

export const AdvancedHealingSimplifyShapeNode: NodeDefinition<
  SimplifyShapeInputs,
  SimplifyShapeOutputs,
  SimplifyShapeParams
> = {
  id: 'Advanced::SimplifyShape',
  type: 'Advanced::SimplifyShape',
  category: 'Advanced',
  label: 'SimplifyShape',
  description: 'Simplify complex geometry',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    simplified: {
      type: 'Shape',
      label: 'Simplified',
    },
  },
  params: {
    simplifyMethod: {
      type: 'enum',
      label: 'Simplify Method',
      default: 'merge-faces',
      options: ['merge-faces', 'remove-details', 'defeaturing'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    preserveTopology: {
      type: 'boolean',
      label: 'Preserve Topology',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'simplifyShape',
      params: {
        shape: inputs.shape,
        simplifyMethod: params.simplifyMethod,
        tolerance: params.tolerance,
        preserveTopology: params.preserveTopology,
      },
    });

    return {
      simplified: result,
    };
  },
};
