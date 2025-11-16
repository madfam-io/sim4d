import type { NodeDefinition } from '@brepflow/types';

interface WeldingPathParams {
  weldType: string;
  weavePattern: string;
  travelSpeed: number;
}

interface WeldingPathInputs {
  seamPath: unknown;
}

interface WeldingPathOutputs {
  weldPath: unknown;
  weldParameters: unknown;
}

export const FabricationRoboticsWeldingPathNode: NodeDefinition<
  WeldingPathInputs,
  WeldingPathOutputs,
  WeldingPathParams
> = {
  id: 'Fabrication::WeldingPath',
  category: 'Fabrication',
  label: 'WeldingPath',
  description: 'Robotic welding path',
  inputs: {
    seamPath: {
      type: 'Wire',
      label: 'Seam Path',
      required: true,
    },
  },
  outputs: {
    weldPath: {
      type: 'Transform[]',
      label: 'Weld Path',
    },
    weldParameters: {
      type: 'Data',
      label: 'Weld Parameters',
    },
  },
  params: {
    weldType: {
      type: 'enum',
      label: 'Weld Type',
      default: 'mig',
      options: ['mig', 'tig', 'spot', 'laser'],
    },
    weavePattern: {
      type: 'enum',
      label: 'Weave Pattern',
      default: 'none',
      options: ['none', 'zigzag', 'circular', 'triangular'],
    },
    travelSpeed: {
      type: 'number',
      label: 'Travel Speed',
      default: 10,
      min: 1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'weldingPath',
      params: {
        seamPath: inputs.seamPath,
        weldType: params.weldType,
        weavePattern: params.weavePattern,
        travelSpeed: params.travelSpeed,
      },
    });

    return {
      weldPath: results.weldPath,
      weldParameters: results.weldParameters,
    };
  },
};
