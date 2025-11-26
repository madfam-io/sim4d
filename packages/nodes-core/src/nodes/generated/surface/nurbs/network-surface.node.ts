import type { NodeDefinition } from '@sim4d/types';

interface NetworkSurfaceParams {
  continuity: string;
  tolerance: number;
}

interface NetworkSurfaceInputs {
  uCurves: unknown;
  vCurves: unknown;
}

interface NetworkSurfaceOutputs {
  surface: unknown;
}

export const SurfaceNURBSNetworkSurfaceNode: NodeDefinition<
  NetworkSurfaceInputs,
  NetworkSurfaceOutputs,
  NetworkSurfaceParams
> = {
  id: 'Surface::NetworkSurface',
  category: 'Surface',
  label: 'NetworkSurface',
  description: 'Create surface from curve network',
  inputs: {
    uCurves: {
      type: 'Wire[]',
      label: 'U Curves',
      required: true,
    },
    vCurves: {
      type: 'Wire[]',
      label: 'V Curves',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      label: 'Continuity',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'networkSurface',
      params: {
        uCurves: inputs.uCurves,
        vCurves: inputs.vCurves,
        continuity: params.continuity,
        tolerance: params.tolerance,
      },
    });

    return {
      surface: result,
    };
  },
};
