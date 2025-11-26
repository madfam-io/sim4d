import type { NodeDefinition } from '@sim4d/types';

interface FaceToFaceParams {
  offset: number;
  flip: boolean;
}

interface FaceToFaceInputs {
  face1: unknown;
  face2: unknown;
}

interface FaceToFaceOutputs {
  mated: unknown;
  mate: unknown;
}

export const AssemblyMatesFaceToFaceNode: NodeDefinition<
  FaceToFaceInputs,
  FaceToFaceOutputs,
  FaceToFaceParams
> = {
  id: 'Assembly::FaceToFace',
  category: 'Assembly',
  label: 'FaceToFace',
  description: 'Mate two faces together',
  inputs: {
    face1: {
      type: 'Face',
      label: 'Face1',
      required: true,
    },
    face2: {
      type: 'Face',
      label: 'Face2',
      required: true,
    },
  },
  outputs: {
    mated: {
      type: 'Shape[]',
      label: 'Mated',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {
    offset: {
      type: 'number',
      label: 'Offset',
      default: 0,
      min: -1000,
      max: 1000,
    },
    flip: {
      type: 'boolean',
      label: 'Flip',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateFaceToFace',
      params: {
        face1: inputs.face1,
        face2: inputs.face2,
        offset: params.offset,
        flip: params.flip,
      },
    });

    return {
      mated: results.mated,
      mate: results.mate,
    };
  },
};
