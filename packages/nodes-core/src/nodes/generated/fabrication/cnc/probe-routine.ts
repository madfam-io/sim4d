import type { NodeDefinition } from '@sim4d/types';

interface ProbeRoutineParams {
  probeType: string;
}

interface ProbeRoutineInputs {
  feature: unknown;
}

interface ProbeRoutineOutputs {
  probePoints: Array<[number, number, number]>;
  probeCycle: unknown;
}

export const FabricationCNCProbeRoutineNode: NodeDefinition<
  ProbeRoutineInputs,
  ProbeRoutineOutputs,
  ProbeRoutineParams
> = {
  id: 'Fabrication::ProbeRoutine',
  type: 'Fabrication::ProbeRoutine',
  category: 'Fabrication',
  label: 'ProbeRoutine',
  description: 'Probing cycle generation',
  inputs: {
    feature: {
      type: 'Shape',
      label: 'Feature',
      required: true,
    },
  },
  outputs: {
    probePoints: {
      type: 'Point[]',
      label: 'Probe Points',
    },
    probeCycle: {
      type: 'Data',
      label: 'Probe Cycle',
    },
  },
  params: {
    probeType: {
      type: 'enum',
      label: 'Probe Type',
      default: 'corner',
      options: ['corner', 'bore', 'boss', 'plane', 'edge'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'probeRoutine',
      params: {
        feature: inputs.feature,
        probeType: params.probeType,
      },
    });

    return {
      probePoints: results.probePoints,
      probeCycle: results.probeCycle,
    };
  },
};
