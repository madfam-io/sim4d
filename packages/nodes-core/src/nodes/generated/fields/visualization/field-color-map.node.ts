import type { NodeDefinition } from '@brepflow/types';

interface FieldColorMapParams {
  colorScheme: string;
  minValue: number;
  maxValue: number;
}

interface FieldColorMapInputs {
  field?: unknown;
  mesh: unknown;
}

interface FieldColorMapOutputs {
  coloredMesh: unknown;
}

export const FieldsVisualizationFieldColorMapNode: NodeDefinition<
  FieldColorMapInputs,
  FieldColorMapOutputs,
  FieldColorMapParams
> = {
  id: 'Fields::FieldColorMap',
  category: 'Fields',
  label: 'FieldColorMap',
  description: 'Visualize field values as colors',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    coloredMesh: {
      type: 'Mesh',
      label: 'Colored Mesh',
    },
  },
  params: {
    colorScheme: {
      type: 'enum',
      label: 'Color Scheme',
      default: '"viridis"',
      options: ['viridis', 'plasma', 'inferno', 'magma', 'turbo', 'rainbow'],
    },
    minValue: {
      type: 'number',
      label: 'Min Value',
      default: 0,
    },
    maxValue: {
      type: 'number',
      label: 'Max Value',
      default: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'visualizeFieldColors',
      params: {
        field: inputs.field,
        mesh: inputs.mesh,
        colorScheme: params.colorScheme,
        minValue: params.minValue,
        maxValue: params.maxValue,
      },
    });

    return {
      coloredMesh: result,
    };
  },
};
