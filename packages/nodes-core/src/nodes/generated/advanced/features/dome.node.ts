import type { NodeDefinition } from '@brepflow/types';

interface DomeParams {
  height: number;
  constraintType: string;
}

interface DomeInputs {
  face: unknown;
}

interface DomeOutputs {
  dome: unknown;
}

export const AdvancedFeaturesDomeNode: NodeDefinition<DomeInputs, DomeOutputs, DomeParams> = {
  id: 'Advanced::Dome',
  category: 'Advanced',
  label: 'Dome',
  description: 'Create dome on face',
  inputs: {
    face: {
      type: 'Face',
      label: 'Face',
      required: true,
    },
  },
  outputs: {
    dome: {
      type: 'Shape',
      label: 'Dome',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    constraintType: {
      type: 'enum',
      label: 'Constraint Type',
      default: 'tangent',
      options: ['none', 'tangent', 'elliptical'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'dome',
      params: {
        face: inputs.face,
        height: params.height,
        constraintType: params.constraintType,
      },
    });

    return {
      dome: result,
    };
  },
};
