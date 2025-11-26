import type { NodeDefinition } from '@sim4d/types';

interface HelicalEntryParams {
  helixDiameter: number;
  helixAngle: number;
}

interface HelicalEntryInputs {
  entryPoint: [number, number, number];
  depth: number;
}

interface HelicalEntryOutputs {
  helixPath: unknown;
}

export const FabricationCNCHelicalEntryNode: NodeDefinition<
  HelicalEntryInputs,
  HelicalEntryOutputs,
  HelicalEntryParams
> = {
  id: 'Fabrication::HelicalEntry',
  type: 'Fabrication::HelicalEntry',
  category: 'Fabrication',
  label: 'HelicalEntry',
  description: 'Helical plunge entry',
  inputs: {
    entryPoint: {
      type: 'Point',
      label: 'Entry Point',
      required: true,
    },
    depth: {
      type: 'Number',
      label: 'Depth',
      required: true,
    },
  },
  outputs: {
    helixPath: {
      type: 'Wire',
      label: 'Helix Path',
    },
  },
  params: {
    helixDiameter: {
      type: 'number',
      label: 'Helix Diameter',
      default: 10,
      min: 1,
      max: 50,
    },
    helixAngle: {
      type: 'number',
      label: 'Helix Angle',
      default: 3,
      min: 1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'helicalEntry',
      params: {
        entryPoint: inputs.entryPoint,
        depth: inputs.depth,
        helixDiameter: params.helixDiameter,
        helixAngle: params.helixAngle,
      },
    });

    return {
      helixPath: result,
    };
  },
};
