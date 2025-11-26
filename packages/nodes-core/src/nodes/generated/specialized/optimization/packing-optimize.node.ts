import type { NodeDefinition } from '@sim4d/types';

interface PackingOptimizeParams {
  containerSize: [number, number, number];
  rotationAllowed: boolean;
  algorithm: string;
}

interface PackingOptimizeInputs {
  parts: unknown;
}

interface PackingOptimizeOutputs {
  packing: unknown;
  efficiency: unknown;
}

export const SpecializedOptimizationPackingOptimizeNode: NodeDefinition<
  PackingOptimizeInputs,
  PackingOptimizeOutputs,
  PackingOptimizeParams
> = {
  id: 'Specialized::PackingOptimize',
  category: 'Specialized',
  label: 'PackingOptimize',
  description: 'Optimize part packing',
  inputs: {
    parts: {
      type: 'Shape[]',
      label: 'Parts',
      required: true,
    },
  },
  outputs: {
    packing: {
      type: 'Data',
      label: 'Packing',
    },
    efficiency: {
      type: 'number',
      label: 'Efficiency',
    },
  },
  params: {
    containerSize: {
      type: 'vec3',
      label: 'Container Size',
      default: [100, 100, 100],
    },
    rotationAllowed: {
      type: 'boolean',
      label: 'Rotation Allowed',
      default: true,
    },
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'genetic',
      options: ['greedy', 'genetic', 'simulated-annealing'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'packingOptimize',
      params: {
        parts: inputs.parts,
        containerSize: params.containerSize,
        rotationAllowed: params.rotationAllowed,
        algorithm: params.algorithm,
      },
    });

    return {
      packing: results.packing,
      efficiency: results.efficiency,
    };
  },
};
