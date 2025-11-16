import type { NodeDefinition } from '@brepflow/types';

interface PolygonPackingParams {
  rotations: boolean;
  angleStep: number;
}

interface PolygonPackingInputs {
  container: unknown;
  polygons: unknown;
}

interface PolygonPackingOutputs {
  packed: unknown;
  utilization: number;
}

export const PatternsPackingPolygonPackingNode: NodeDefinition<
  PolygonPackingInputs,
  PolygonPackingOutputs,
  PolygonPackingParams
> = {
  id: 'Patterns::PolygonPacking',
  type: 'Patterns::PolygonPacking',
  category: 'Patterns',
  label: 'PolygonPacking',
  description: 'Irregular polygon packing',
  inputs: {
    container: {
      type: 'Face',
      label: 'Container',
      required: true,
    },
    polygons: {
      type: 'Face[]',
      label: 'Polygons',
      required: true,
    },
  },
  outputs: {
    packed: {
      type: 'Face[]',
      label: 'Packed',
    },
    utilization: {
      type: 'Number',
      label: 'Utilization',
    },
  },
  params: {
    rotations: {
      type: 'boolean',
      label: 'Rotations',
      default: true,
    },
    angleStep: {
      type: 'number',
      label: 'Angle Step',
      default: 90,
      min: 1,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'polygonPacking',
      params: {
        container: inputs.container,
        polygons: inputs.polygons,
        rotations: params.rotations,
        angleStep: params.angleStep,
      },
    });

    return {
      packed: results.packed,
      utilization: results.utilization,
    };
  },
};
