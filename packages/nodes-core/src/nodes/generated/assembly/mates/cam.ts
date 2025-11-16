import type { NodeDefinition } from '@brepflow/types';

type CamParams = Record<string, never>;

interface CamInputs {
  cam: unknown;
  follower: unknown;
}

interface CamOutputs {
  cammed: unknown;
  mate: unknown;
}

export const AssemblyMatesCamNode: NodeDefinition<CamInputs, CamOutputs, CamParams> = {
  id: 'Assembly::Cam',
  type: 'Assembly::Cam',
  category: 'Assembly',
  label: 'Cam',
  description: 'Create cam-follower relationship',
  inputs: {
    cam: {
      type: 'Shape',
      label: 'Cam',
      required: true,
    },
    follower: {
      type: 'Shape',
      label: 'Follower',
      required: true,
    },
  },
  outputs: {
    cammed: {
      type: 'Shape[]',
      label: 'Cammed',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateCam',
      params: {
        cam: inputs.cam,
        follower: inputs.follower,
      },
    });

    return {
      cammed: results.cammed,
      mate: results.mate,
    };
  },
};
