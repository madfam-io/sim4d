import type { NodeDefinition } from '@sim4d/types';

interface FieldHeatMapParams {
  resolution: number;
  interpolation: string;
}

interface FieldHeatMapInputs {
  field?: unknown;
  plane: unknown;
}

interface FieldHeatMapOutputs {
  heatMap: unknown;
}

export const FieldsVisualizationFieldHeatMapNode: NodeDefinition<
  FieldHeatMapInputs,
  FieldHeatMapOutputs,
  FieldHeatMapParams
> = {
  id: 'Fields::FieldHeatMap',
  type: 'Fields::FieldHeatMap',
  category: 'Fields',
  label: 'FieldHeatMap',
  description: 'Generate heat map visualization',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    plane: {
      type: 'Plane',
      label: 'Plane',
      required: true,
    },
  },
  outputs: {
    heatMap: {
      type: 'Mesh',
      label: 'Heat Map',
    },
  },
  params: {
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 50,
      min: 10,
      max: 200,
    },
    interpolation: {
      type: 'enum',
      label: 'Interpolation',
      default: '"bilinear"',
      options: ['nearest', 'bilinear', 'bicubic'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'generateHeatMap',
      params: {
        field: inputs.field,
        plane: inputs.plane,
        resolution: params.resolution,
        interpolation: params.interpolation,
      },
    });

    return {
      heatMap: result,
    };
  },
};
