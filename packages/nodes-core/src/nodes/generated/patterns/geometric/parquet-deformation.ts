import type { NodeDefinition } from '@brepflow/types';

interface ParquetDeformationParams {
  deformationType: string;
  steps: number;
}

interface ParquetDeformationInputs {
  baseTile: unknown;
}

interface ParquetDeformationOutputs {
  deformation: unknown;
}

export const PatternsGeometricParquetDeformationNode: NodeDefinition<
  ParquetDeformationInputs,
  ParquetDeformationOutputs,
  ParquetDeformationParams
> = {
  id: 'Patterns::ParquetDeformation',
  type: 'Patterns::ParquetDeformation',
  category: 'Patterns',
  label: 'ParquetDeformation',
  description: 'M.C. Escher deformation',
  inputs: {
    baseTile: {
      type: 'Face',
      label: 'Base Tile',
      required: true,
    },
  },
  outputs: {
    deformation: {
      type: 'Face[]',
      label: 'Deformation',
    },
  },
  params: {
    deformationType: {
      type: 'enum',
      label: 'Deformation Type',
      default: 'radial',
      options: ['linear', 'radial', 'spiral'],
    },
    steps: {
      type: 'number',
      label: 'Steps',
      default: 10,
      min: 3,
      max: 50,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'parquetDeformation',
      params: {
        baseTile: inputs.baseTile,
        deformationType: params.deformationType,
        steps: params.steps,
      },
    });

    return {
      deformation: result,
    };
  },
};
