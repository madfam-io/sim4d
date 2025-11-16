import type { NodeDefinition } from '@brepflow/types';

interface FieldVolumeParams {
  voxelSize: number;
  threshold: number;
  opacity: number;
}

interface FieldVolumeInputs {
  field?: unknown;
  bounds: unknown;
}

interface FieldVolumeOutputs {
  volume: unknown;
}

export const FieldsVisualizationFieldVolumeNode: NodeDefinition<
  FieldVolumeInputs,
  FieldVolumeOutputs,
  FieldVolumeParams
> = {
  id: 'Fields::FieldVolume',
  category: 'Fields',
  label: 'FieldVolume',
  description: 'Generate volumetric field visualization',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    volume: {
      type: 'Mesh',
      label: 'Volume',
    },
  },
  params: {
    voxelSize: {
      type: 'number',
      label: 'Voxel Size',
      default: 1,
      min: 0.1,
      max: 10,
    },
    threshold: {
      type: 'number',
      label: 'Threshold',
      default: 0.5,
      min: 0,
      max: 1,
    },
    opacity: {
      type: 'number',
      label: 'Opacity',
      default: 0.8,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'visualizeFieldVolume',
      params: {
        field: inputs.field,
        bounds: inputs.bounds,
        voxelSize: params.voxelSize,
        threshold: params.threshold,
        opacity: params.opacity,
      },
    });

    return {
      volume: result,
    };
  },
};
