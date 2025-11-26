import type { NodeDefinition } from '@sim4d/types';

interface RivetParams {
  diameter: number;
  length: number;
  headType: string;
  material: string;
}

interface RivetInputs {
  position: [number, number, number];
}

interface RivetOutputs {
  rivet: unknown;
}

export const MechanicalEngineeringFastenersRivetNode: NodeDefinition<
  RivetInputs,
  RivetOutputs,
  RivetParams
> = {
  id: 'MechanicalEngineering::Rivet',
  type: 'MechanicalEngineering::Rivet',
  category: 'MechanicalEngineering',
  label: 'Rivet',
  description: 'Create rivet fastener',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    rivet: {
      type: 'Shape',
      label: 'Rivet',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 4,
      min: 2,
      max: 10,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 10,
      min: 5,
      max: 30,
    },
    headType: {
      type: 'enum',
      label: 'Head Type',
      default: 'round',
      options: ['round', 'flat', 'countersunk', 'pan'],
    },
    material: {
      type: 'enum',
      label: 'Material',
      default: 'aluminum',
      options: ['aluminum', 'steel', 'stainless', 'copper'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'rivet',
      params: {
        position: inputs.position,
        diameter: params.diameter,
        length: params.length,
        headType: params.headType,
        material: params.material,
      },
    });

    return {
      rivet: result,
    };
  },
};
