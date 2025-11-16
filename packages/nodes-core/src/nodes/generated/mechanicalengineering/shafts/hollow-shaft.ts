import type { NodeDefinition } from '@brepflow/types';

interface HollowShaftParams {
  outerDiameter: number;
  innerDiameter: number;
  length: number;
  endMachining: string;
}

interface HollowShaftInputs {
  center: [number, number, number];
  axis?: [number, number, number];
}

interface HollowShaftOutputs {
  shaft: unknown;
  bore: unknown;
}

export const MechanicalEngineeringShaftsHollowShaftNode: NodeDefinition<
  HollowShaftInputs,
  HollowShaftOutputs,
  HollowShaftParams
> = {
  id: 'MechanicalEngineering::HollowShaft',
  type: 'MechanicalEngineering::HollowShaft',
  category: 'MechanicalEngineering',
  label: 'HollowShaft',
  description: 'Create hollow shaft',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
    axis: {
      type: 'Vector',
      label: 'Axis',
      optional: true,
    },
  },
  outputs: {
    shaft: {
      type: 'Shape',
      label: 'Shaft',
    },
    bore: {
      type: 'Wire',
      label: 'Bore',
    },
  },
  params: {
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 40,
      min: 10,
      max: 200,
    },
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 30,
      min: 5,
      max: 190,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 100,
      min: 20,
      max: 500,
    },
    endMachining: {
      type: 'enum',
      label: 'End Machining',
      default: 'none',
      options: ['none', 'threads', 'splines'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'hollowShaft',
      params: {
        center: inputs.center,
        axis: inputs.axis,
        outerDiameter: params.outerDiameter,
        innerDiameter: params.innerDiameter,
        length: params.length,
        endMachining: params.endMachining,
      },
    });

    return {
      shaft: results.shaft,
      bore: results.bore,
    };
  },
};
