import type { NodeDefinition } from '@brepflow/types';

interface DrillingOperationParams {
  drillDiameter: number;
  peckDepth: number;
  dwellTime: number;
}

interface DrillingOperationInputs {
  holes: Array<[number, number, number]>;
  depths: unknown;
}

interface DrillingOperationOutputs {
  drillCycles: unknown;
}

export const FabricationCNCDrillingOperationNode: NodeDefinition<
  DrillingOperationInputs,
  DrillingOperationOutputs,
  DrillingOperationParams
> = {
  id: 'Fabrication::DrillingOperation',
  type: 'Fabrication::DrillingOperation',
  category: 'Fabrication',
  label: 'DrillingOperation',
  description: 'Drilling operation setup',
  inputs: {
    holes: {
      type: 'Point[]',
      label: 'Holes',
      required: true,
    },
    depths: {
      type: 'number[]',
      label: 'Depths',
      required: true,
    },
  },
  outputs: {
    drillCycles: {
      type: 'Data',
      label: 'Drill Cycles',
    },
  },
  params: {
    drillDiameter: {
      type: 'number',
      label: 'Drill Diameter',
      default: 8,
      min: 0.1,
      max: 50,
    },
    peckDepth: {
      type: 'number',
      label: 'Peck Depth',
      default: 5,
      min: 0,
      max: 20,
    },
    dwellTime: {
      type: 'number',
      label: 'Dwell Time',
      default: 0,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'drillingOperation',
      params: {
        holes: inputs.holes,
        depths: inputs.depths,
        drillDiameter: params.drillDiameter,
        peckDepth: params.peckDepth,
        dwellTime: params.dwellTime,
      },
    });

    return {
      drillCycles: result,
    };
  },
};
