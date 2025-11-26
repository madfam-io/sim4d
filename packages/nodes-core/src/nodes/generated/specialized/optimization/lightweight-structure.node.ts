import type { NodeDefinition } from '@sim4d/types';

interface LightweightStructureParams {
  targetWeight: number;
  structureType: string;
}

interface LightweightStructureInputs {
  solid: unknown;
  loadPaths?: unknown;
}

interface LightweightStructureOutputs {
  lightweighted: unknown;
  weightReduction: unknown;
}

export const SpecializedOptimizationLightweightStructureNode: NodeDefinition<
  LightweightStructureInputs,
  LightweightStructureOutputs,
  LightweightStructureParams
> = {
  id: 'Specialized::LightweightStructure',
  category: 'Specialized',
  label: 'LightweightStructure',
  description: 'Create lightweight structure',
  inputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
      required: true,
    },
    loadPaths: {
      type: 'Data',
      label: 'Load Paths',
      optional: true,
    },
  },
  outputs: {
    lightweighted: {
      type: 'Shape',
      label: 'Lightweighted',
    },
    weightReduction: {
      type: 'number',
      label: 'Weight Reduction',
    },
  },
  params: {
    targetWeight: {
      type: 'number',
      label: 'Target Weight',
      default: 0.5,
      min: 0.1,
      max: 0.9,
    },
    structureType: {
      type: 'enum',
      label: 'Structure Type',
      default: 'hybrid',
      options: ['ribs', 'shells', 'lattice', 'hybrid'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'lightweightStructure',
      params: {
        solid: inputs.solid,
        loadPaths: inputs.loadPaths,
        targetWeight: params.targetWeight,
        structureType: params.structureType,
      },
    });

    return {
      lightweighted: results.lightweighted,
      weightReduction: results.weightReduction,
    };
  },
};
