import type { NodeDefinition } from '@sim4d/types';

interface FoamStructureParams {
  bubbleCount: number;
  sizeVariation: number;
}

interface FoamStructureInputs {
  container: unknown;
}

interface FoamStructureOutputs {
  foam: unknown;
}

export const PatternsCellularFoamStructureNode: NodeDefinition<
  FoamStructureInputs,
  FoamStructureOutputs,
  FoamStructureParams
> = {
  id: 'Patterns::FoamStructure',
  type: 'Patterns::FoamStructure',
  category: 'Patterns',
  label: 'FoamStructure',
  description: 'Foam bubble structure',
  inputs: {
    container: {
      type: 'Shape',
      label: 'Container',
      required: true,
    },
  },
  outputs: {
    foam: {
      type: 'Face[]',
      label: 'Foam',
    },
  },
  params: {
    bubbleCount: {
      type: 'number',
      label: 'Bubble Count',
      default: 50,
      min: 5,
      max: 500,
      step: 5,
    },
    sizeVariation: {
      type: 'number',
      label: 'Size Variation',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'foamStructure',
      params: {
        container: inputs.container,
        bubbleCount: params.bubbleCount,
        sizeVariation: params.sizeVariation,
      },
    });

    return {
      foam: result,
    };
  },
};
