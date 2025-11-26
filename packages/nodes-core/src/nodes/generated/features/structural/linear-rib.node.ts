import type { NodeDefinition } from '@sim4d/types';

interface LinearRibParams {
  thickness: number;
  height: number;
  draftAngle: number;
  topRadius: number;
}

interface LinearRibInputs {
  face: unknown;
  path: unknown;
}

interface LinearRibOutputs {
  shape: unknown;
}

export const FeaturesStructuralLinearRibNode: NodeDefinition<
  LinearRibInputs,
  LinearRibOutputs,
  LinearRibParams
> = {
  id: 'Features::LinearRib',
  category: 'Features',
  label: 'LinearRib',
  description: 'Creates a reinforcing rib along a path',
  inputs: {
    face: {
      type: 'Face',
      label: 'Face',
      required: true,
    },
    path: {
      type: 'Curve',
      label: 'Path',
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
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 3,
      min: 0.1,
      max: 100,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 20,
      min: 0.1,
      max: 1000,
    },
    draftAngle: {
      type: 'number',
      label: 'Draft Angle',
      default: 1,
      min: 0,
      max: 10,
    },
    topRadius: {
      type: 'number',
      label: 'Top Radius',
      default: 1,
      min: 0,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'MAKE_RIB',
      params: {
        face: inputs.face,
        path: inputs.path,
        thickness: params.thickness,
        height: params.height,
        draftAngle: params.draftAngle,
        topRadius: params.topRadius,
      },
    });

    return {
      shape: result,
    };
  },
};
