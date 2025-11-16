import type { NodeDefinition } from '@brepflow/types';

interface RectangularPocketParams {
  width: number;
  height: number;
  depth: number;
  cornerRadius: number;
  draftAngle: number;
}

interface RectangularPocketInputs {
  face: unknown;
  position: [number, number, number];
}

interface RectangularPocketOutputs {
  shape: unknown;
}

export const FeaturesPocketsRectangularPocketNode: NodeDefinition<
  RectangularPocketInputs,
  RectangularPocketOutputs,
  RectangularPocketParams
> = {
  id: 'Features::RectangularPocket',
  type: 'Features::RectangularPocket',
  category: 'Features',
  label: 'RectangularPocket',
  description: 'Creates a rectangular pocket with optional corner radius',
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
    width: {
      type: 'number',
      label: 'Width',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 30,
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
    cornerRadius: {
      type: 'number',
      label: 'Corner Radius',
      default: 0,
      min: 0,
      max: 100,
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
      type: 'MAKE_POCKET_RECT',
      params: {
        face: inputs.face,
        position: inputs.position,
        width: params.width,
        height: params.height,
        depth: params.depth,
        cornerRadius: params.cornerRadius,
        draftAngle: params.draftAngle,
      },
    });

    return {
      shape: result,
    };
  },
};
