import type { NodeDefinition } from '@brepflow/types';

interface WorkCoordinateParams {
  wcs: string;
}

interface WorkCoordinateInputs {
  origin: [number, number, number];
  orientation?: unknown;
}

interface WorkCoordinateOutputs {
  coordinate: unknown;
}

export const FabricationCNCWorkCoordinateNode: NodeDefinition<
  WorkCoordinateInputs,
  WorkCoordinateOutputs,
  WorkCoordinateParams
> = {
  id: 'Fabrication::WorkCoordinate',
  category: 'Fabrication',
  label: 'WorkCoordinate',
  description: 'Work coordinate system',
  inputs: {
    origin: {
      type: 'Point',
      label: 'Origin',
      required: true,
    },
    orientation: {
      type: 'Transform',
      label: 'Orientation',
      optional: true,
    },
  },
  outputs: {
    coordinate: {
      type: 'Transform',
      label: 'Coordinate',
    },
  },
  params: {
    wcs: {
      type: 'enum',
      label: 'Wcs',
      default: 'G54',
      options: ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'workCoordinate',
      params: {
        origin: inputs.origin,
        orientation: inputs.orientation,
        wcs: params.wcs,
      },
    });

    return {
      coordinate: result,
    };
  },
};
