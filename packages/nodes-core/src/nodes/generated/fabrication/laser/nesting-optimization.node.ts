import type { NodeDefinition } from '@sim4d/types';

interface NestingOptimizationParams {
  spacing: number;
  rotations: boolean;
  grainDirection: boolean;
}

interface NestingOptimizationInputs {
  parts: unknown;
  sheet: unknown;
}

interface NestingOptimizationOutputs {
  nestedParts: unknown;
  utilization: number;
}

export const FabricationLaserNestingOptimizationNode: NodeDefinition<
  NestingOptimizationInputs,
  NestingOptimizationOutputs,
  NestingOptimizationParams
> = {
  id: 'Fabrication::NestingOptimization',
  category: 'Fabrication',
  label: 'NestingOptimization',
  description: 'Optimize material nesting',
  inputs: {
    parts: {
      type: 'Face[]',
      label: 'Parts',
      required: true,
    },
    sheet: {
      type: 'Face',
      label: 'Sheet',
      required: true,
    },
  },
  outputs: {
    nestedParts: {
      type: 'Face[]',
      label: 'Nested Parts',
    },
    utilization: {
      type: 'Number',
      label: 'Utilization',
    },
  },
  params: {
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 2,
      min: 0,
      max: 10,
    },
    rotations: {
      type: 'boolean',
      label: 'Rotations',
      default: true,
    },
    grainDirection: {
      type: 'boolean',
      label: 'Grain Direction',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'nestingOptimization',
      params: {
        parts: inputs.parts,
        sheet: inputs.sheet,
        spacing: params.spacing,
        rotations: params.rotations,
        grainDirection: params.grainDirection,
      },
    });

    return {
      nestedParts: results.nestedParts,
      utilization: results.utilization,
    };
  },
};
