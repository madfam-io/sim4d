import type { NodeDefinition } from '@brepflow/types';

interface ClerestroyWindowParams {
  height: number;
  continuous: boolean;
}

interface ClerestroyWindowInputs {
  wallTop: unknown;
}

interface ClerestroyWindowOutputs {
  clerestory: unknown;
}

export const ArchitectureWindowsClerestroyWindowNode: NodeDefinition<
  ClerestroyWindowInputs,
  ClerestroyWindowOutputs,
  ClerestroyWindowParams
> = {
  id: 'Architecture::ClerestroyWindow',
  type: 'Architecture::ClerestroyWindow',
  category: 'Architecture',
  label: 'ClerestroyWindow',
  description: 'Clerestory window band',
  inputs: {
    wallTop: {
      type: 'Wire',
      label: 'Wall Top',
      required: true,
    },
  },
  outputs: {
    clerestory: {
      type: 'Shape',
      label: 'Clerestory',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 600,
      min: 400,
      max: 1200,
    },
    continuous: {
      type: 'boolean',
      label: 'Continuous',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'clerestoryWindow',
      params: {
        wallTop: inputs.wallTop,
        height: params.height,
        continuous: params.continuous,
      },
    });

    return {
      clerestory: result,
    };
  },
};
