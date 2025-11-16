import type { NodeDefinition } from '@brepflow/types';

interface GravityAttractorParams {
  mass: number;
  G: number;
}

interface GravityAttractorInputs {
  bodies: Array<[number, number, number]>;
  masses?: unknown;
}

interface GravityAttractorOutputs {
  field: unknown;
}

export const FieldAttractorGravityAttractorNode: NodeDefinition<
  GravityAttractorInputs,
  GravityAttractorOutputs,
  GravityAttractorParams
> = {
  id: 'Field::GravityAttractor',
  type: 'Field::GravityAttractor',
  category: 'Field',
  label: 'GravityAttractor',
  description: 'Gravity well attractor',
  inputs: {
    bodies: {
      type: 'Point[]',
      label: 'Bodies',
      required: true,
    },
    masses: {
      type: 'number[]',
      label: 'Masses',
      optional: true,
    },
  },
  outputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
    },
  },
  params: {
    mass: {
      type: 'number',
      label: 'Mass',
      default: 100,
      min: 0.1,
    },
    G: {
      type: 'number',
      label: 'G',
      default: 1,
      min: 0.001,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorGravity',
      params: {
        bodies: inputs.bodies,
        masses: inputs.masses,
        mass: params.mass,
        G: params.G,
      },
    });

    return {
      field: result,
    };
  },
};
