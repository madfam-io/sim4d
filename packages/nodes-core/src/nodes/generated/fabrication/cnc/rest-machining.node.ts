import type { NodeDefinition } from '@brepflow/types';

interface RestMachiningParams {
  previousTool: number;
  currentTool: number;
}

interface RestMachiningInputs {
  model: unknown;
  previousPaths: unknown;
}

interface RestMachiningOutputs {
  restAreas: unknown;
  restPaths: unknown;
}

export const FabricationCNCRestMachiningNode: NodeDefinition<
  RestMachiningInputs,
  RestMachiningOutputs,
  RestMachiningParams
> = {
  id: 'Fabrication::RestMachining',
  category: 'Fabrication',
  label: 'RestMachining',
  description: 'Rest material machining',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
    previousPaths: {
      type: 'Wire[]',
      label: 'Previous Paths',
      required: true,
    },
  },
  outputs: {
    restAreas: {
      type: 'Face[]',
      label: 'Rest Areas',
    },
    restPaths: {
      type: 'Wire[]',
      label: 'Rest Paths',
    },
  },
  params: {
    previousTool: {
      type: 'number',
      label: 'Previous Tool',
      default: 10,
      min: 1,
      max: 50,
    },
    currentTool: {
      type: 'number',
      label: 'Current Tool',
      default: 3,
      min: 0.1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'restMachining',
      params: {
        model: inputs.model,
        previousPaths: inputs.previousPaths,
        previousTool: params.previousTool,
        currentTool: params.currentTool,
      },
    });

    return {
      restAreas: results.restAreas,
      restPaths: results.restPaths,
    };
  },
};
