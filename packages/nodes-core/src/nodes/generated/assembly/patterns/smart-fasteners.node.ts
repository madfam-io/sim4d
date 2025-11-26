import type { NodeDefinition } from '@sim4d/types';

interface SmartFastenersParams {
  type: string;
  size: number;
  autoSize: boolean;
}

interface SmartFastenersInputs {
  holes: unknown;
}

interface SmartFastenersOutputs {
  fasteners: unknown;
}

export const AssemblyPatternsSmartFastenersNode: NodeDefinition<
  SmartFastenersInputs,
  SmartFastenersOutputs,
  SmartFastenersParams
> = {
  id: 'Assembly::SmartFasteners',
  category: 'Assembly',
  label: 'SmartFasteners',
  description: 'Add smart fasteners',
  inputs: {
    holes: {
      type: 'Face[]',
      label: 'Holes',
      required: true,
    },
  },
  outputs: {
    fasteners: {
      type: 'Shape[]',
      label: 'Fasteners',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'bolt',
      options: ['bolt', 'screw', 'rivet', 'weld'],
    },
    size: {
      type: 'number',
      label: 'Size',
      default: 10,
      min: 1,
      max: 100,
    },
    autoSize: {
      type: 'boolean',
      label: 'Auto Size',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblySmartFasteners',
      params: {
        holes: inputs.holes,
        type: params.type,
        size: params.size,
        autoSize: params.autoSize,
      },
    });

    return {
      fasteners: result,
    };
  },
};
