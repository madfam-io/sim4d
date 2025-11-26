import type { NodeDefinition } from '@sim4d/types';

interface ContactSetParams {
  type: string;
  friction: number;
}

interface ContactSetInputs {
  faces1: unknown;
  faces2: unknown;
}

interface ContactSetOutputs {
  contactSet: unknown;
}

export const AssemblyPatternsContactSetNode: NodeDefinition<
  ContactSetInputs,
  ContactSetOutputs,
  ContactSetParams
> = {
  id: 'Assembly::ContactSet',
  type: 'Assembly::ContactSet',
  category: 'Assembly',
  label: 'ContactSet',
  description: 'Define contact sets',
  inputs: {
    faces1: {
      type: 'Face[]',
      label: 'Faces1',
      required: true,
    },
    faces2: {
      type: 'Face[]',
      label: 'Faces2',
      required: true,
    },
  },
  outputs: {
    contactSet: {
      type: 'ContactSet',
      label: 'Contact Set',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'no_penetration',
      options: ['bonded', 'no_penetration', 'frictionless'],
    },
    friction: {
      type: 'number',
      label: 'Friction',
      default: 0.3,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblyContactSet',
      params: {
        faces1: inputs.faces1,
        faces2: inputs.faces2,
        type: params.type,
        friction: params.friction,
      },
    });

    return {
      contactSet: result,
    };
  },
};
