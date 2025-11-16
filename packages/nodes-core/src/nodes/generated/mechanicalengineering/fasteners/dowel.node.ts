import type { NodeDefinition } from '@brepflow/types';

interface DowelParams {
  diameter: number;
  length: number;
  tolerance: string;
  chamfered: boolean;
}

interface DowelInputs {
  position: [number, number, number];
  direction?: [number, number, number];
}

interface DowelOutputs {
  dowel: unknown;
}

export const MechanicalEngineeringFastenersDowelNode: NodeDefinition<
  DowelInputs,
  DowelOutputs,
  DowelParams
> = {
  id: 'MechanicalEngineering::Dowel',
  category: 'MechanicalEngineering',
  label: 'Dowel',
  description: 'Create dowel pin',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
    direction: {
      type: 'Vector',
      label: 'Direction',
      optional: true,
    },
  },
  outputs: {
    dowel: {
      type: 'Shape',
      label: 'Dowel',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 6,
      min: 2,
      max: 20,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 20,
      min: 5,
      max: 100,
    },
    tolerance: {
      type: 'enum',
      label: 'Tolerance',
      default: 'h7',
      options: ['h6', 'h7', 'h8', 'm6'],
    },
    chamfered: {
      type: 'boolean',
      label: 'Chamfered',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'dowelPin',
      params: {
        position: inputs.position,
        direction: inputs.direction,
        diameter: params.diameter,
        length: params.length,
        tolerance: params.tolerance,
        chamfered: params.chamfered,
      },
    });

    return {
      dowel: result,
    };
  },
};
