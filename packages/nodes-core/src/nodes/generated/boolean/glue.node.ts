import type { NodeDefinition } from '@brepflow/types';

interface GlueParams {
  tolerance: number;
}

interface GlueInputs {
  shapes: unknown;
}

interface GlueOutputs {
  result: unknown;
}

export const BooleanGlueNode: NodeDefinition<GlueInputs, GlueOutputs, GlueParams> = {
  id: 'Boolean::Glue',
  category: 'Boolean',
  label: 'Glue',
  description: 'Glue shapes together at common faces',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 1e-7,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'booleanGlue',
      params: {
        shapes: inputs.shapes,
        tolerance: params.tolerance,
      },
    });

    return {
      result: result,
    };
  },
};
