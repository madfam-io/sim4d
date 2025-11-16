import type { NodeDefinition } from '@brepflow/types';

interface EngraveParams {
  depth: number;
  angle: number;
  roundCorners: boolean;
}

interface EngraveInputs {
  targetFace: unknown;
  pattern: unknown;
}

interface EngraveOutputs {
  engraved: unknown;
}

export const SpecializedTextEngraveNode: NodeDefinition<
  EngraveInputs,
  EngraveOutputs,
  EngraveParams
> = {
  id: 'Specialized::Engrave',
  category: 'Specialized',
  label: 'Engrave',
  description: 'Engrave text or pattern',
  inputs: {
    targetFace: {
      type: 'Face',
      label: 'Target Face',
      required: true,
    },
    pattern: {
      type: 'Wire',
      label: 'Pattern',
      required: true,
    },
  },
  outputs: {
    engraved: {
      type: 'Shape',
      label: 'Engraved',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 1,
      min: 0.01,
      max: 100,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 45,
      min: 0,
      max: 90,
    },
    roundCorners: {
      type: 'boolean',
      label: 'Round Corners',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'engrave',
      params: {
        targetFace: inputs.targetFace,
        pattern: inputs.pattern,
        depth: params.depth,
        angle: params.angle,
        roundCorners: params.roundCorners,
      },
    });

    return {
      engraved: result,
    };
  },
};
