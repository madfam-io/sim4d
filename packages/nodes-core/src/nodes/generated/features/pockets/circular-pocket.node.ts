import type { NodeDefinition } from '@sim4d/types';

interface CircularPocketParams {
  diameter: number;
  depth: number;
  draftAngle: number;
}

interface CircularPocketInputs {
  face: unknown;
  position: [number, number, number];
}

interface CircularPocketOutputs {
  shape: unknown;
}

export const FeaturesPocketsCircularPocketNode: NodeDefinition<
  CircularPocketInputs,
  CircularPocketOutputs,
  CircularPocketParams
> = {
  id: 'Features::CircularPocket',
  category: 'Features',
  label: 'CircularPocket',
  description: 'Creates a circular pocket',
  inputs: {
    face: {
      type: 'Face',
      label: 'Face',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 40,
      min: 0.1,
      max: 10000,
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    draftAngle: {
      type: 'number',
      label: 'Draft Angle',
      default: 0,
      min: 0,
      max: 45,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'MAKE_POCKET_CIRC',
      params: {
        face: inputs.face,
        position: inputs.position,
        diameter: params.diameter,
        depth: params.depth,
        draftAngle: params.draftAngle,
      },
    });

    return {
      shape: result,
    };
  },
};
