import type { NodeDefinition } from '@brepflow/types';

interface DeformParams {
  deformType: string;
  radius: number;
  stiffness: number;
}

interface DeformInputs {
  shape: unknown;
  controlPoints: Array<[number, number, number]>;
  targetPoints: Array<[number, number, number]>;
}

interface DeformOutputs {
  deformed: unknown;
}

export const AdvancedFeaturesDeformNode: NodeDefinition<DeformInputs, DeformOutputs, DeformParams> =
  {
    id: 'Advanced::Deform',
    category: 'Advanced',
    label: 'Deform',
    description: 'Point deformation',
    inputs: {
      shape: {
        type: 'Shape',
        label: 'Shape',
        required: true,
      },
      controlPoints: {
        type: 'Point[]',
        label: 'Control Points',
        required: true,
      },
      targetPoints: {
        type: 'Point[]',
        label: 'Target Points',
        required: true,
      },
    },
    outputs: {
      deformed: {
        type: 'Shape',
        label: 'Deformed',
      },
    },
    params: {
      deformType: {
        type: 'enum',
        label: 'Deform Type',
        default: 'point',
        options: ['point', 'curve', 'surface'],
      },
      radius: {
        type: 'number',
        label: 'Radius',
        default: 50,
        min: 0.1,
        max: 1000,
      },
      stiffness: {
        type: 'number',
        label: 'Stiffness',
        default: 0.5,
        min: 0,
        max: 1,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'deform',
        params: {
          shape: inputs.shape,
          controlPoints: inputs.controlPoints,
          targetPoints: inputs.targetPoints,
          deformType: params.deformType,
          radius: params.radius,
          stiffness: params.stiffness,
        },
      });

      return {
        deformed: result,
      };
    },
  };
