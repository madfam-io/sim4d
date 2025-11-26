import type { NodeDefinition } from '@sim4d/types';

interface ProjectToPlaneParams {
  planeOriginX: number;
  planeOriginY: number;
  planeOriginZ: number;
  planeNormalX: number;
  planeNormalY: number;
  planeNormalZ: number;
}

interface ProjectToPlaneInputs {
  shape: unknown;
}

interface ProjectToPlaneOutputs {
  projected: unknown;
}

export const TransformProjectToPlaneNode: NodeDefinition<
  ProjectToPlaneInputs,
  ProjectToPlaneOutputs,
  ProjectToPlaneParams
> = {
  id: 'Transform::ProjectToPlane',
  type: 'Transform::ProjectToPlane',
  category: 'Transform',
  label: 'ProjectToPlane',
  description: 'Project shape onto a plane',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    projected: {
      type: 'Shape',
      label: 'Projected',
    },
  },
  params: {
    planeOriginX: {
      type: 'number',
      label: 'Plane Origin X',
      default: 0,
    },
    planeOriginY: {
      type: 'number',
      label: 'Plane Origin Y',
      default: 0,
    },
    planeOriginZ: {
      type: 'number',
      label: 'Plane Origin Z',
      default: 0,
    },
    planeNormalX: {
      type: 'number',
      label: 'Plane Normal X',
      default: 0,
    },
    planeNormalY: {
      type: 'number',
      label: 'Plane Normal Y',
      default: 0,
    },
    planeNormalZ: {
      type: 'number',
      label: 'Plane Normal Z',
      default: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformProject',
      params: {
        shape: inputs.shape,
        planeOriginX: params.planeOriginX,
        planeOriginY: params.planeOriginY,
        planeOriginZ: params.planeOriginZ,
        planeNormalX: params.planeNormalX,
        planeNormalY: params.planeNormalY,
        planeNormalZ: params.planeNormalZ,
      },
    });

    return {
      projected: result,
    };
  },
};
