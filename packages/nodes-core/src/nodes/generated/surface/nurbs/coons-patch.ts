import type { NodeDefinition } from '@brepflow/types';

type CoonsPatchParams = Record<string, never>;

interface CoonsPatchInputs {
  edge1: unknown;
  edge2: unknown;
  edge3: unknown;
  edge4: unknown;
}

interface CoonsPatchOutputs {
  surface: unknown;
}

export const SurfaceNURBSCoonsPatchNode: NodeDefinition<
  CoonsPatchInputs,
  CoonsPatchOutputs,
  CoonsPatchParams
> = {
  id: 'Surface::CoonsPatch',
  type: 'Surface::CoonsPatch',
  category: 'Surface',
  label: 'CoonsPatch',
  description: 'Create Coons patch surface',
  inputs: {
    edge1: {
      type: 'Edge',
      label: 'Edge1',
      required: true,
    },
    edge2: {
      type: 'Edge',
      label: 'Edge2',
      required: true,
    },
    edge3: {
      type: 'Edge',
      label: 'Edge3',
      required: true,
    },
    edge4: {
      type: 'Edge',
      label: 'Edge4',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'coonsPatch',
      params: {
        edge1: inputs.edge1,
        edge2: inputs.edge2,
        edge3: inputs.edge3,
        edge4: inputs.edge4,
      },
    });

    return {
      surface: result,
    };
  },
};
