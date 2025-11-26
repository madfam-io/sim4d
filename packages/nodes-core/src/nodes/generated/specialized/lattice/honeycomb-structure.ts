import type { NodeDefinition } from '@sim4d/types';

interface HoneycombStructureParams {
  cellSize: number;
  wallThickness: number;
  fillDensity: number;
}

interface HoneycombStructureInputs {
  shape: unknown;
}

interface HoneycombStructureOutputs {
  honeycomb: unknown;
}

export const SpecializedLatticeHoneycombStructureNode: NodeDefinition<
  HoneycombStructureInputs,
  HoneycombStructureOutputs,
  HoneycombStructureParams
> = {
  id: 'Specialized::HoneycombStructure',
  type: 'Specialized::HoneycombStructure',
  category: 'Specialized',
  label: 'HoneycombStructure',
  description: 'Honeycomb infill structure',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    honeycomb: {
      type: 'Shape',
      label: 'Honeycomb',
    },
  },
  params: {
    cellSize: {
      type: 'number',
      label: 'Cell Size',
      default: 5,
      min: 0.5,
      max: 50,
    },
    wallThickness: {
      type: 'number',
      label: 'Wall Thickness',
      default: 0.5,
      min: 0.1,
      max: 5,
    },
    fillDensity: {
      type: 'number',
      label: 'Fill Density',
      default: 0.3,
      min: 0.1,
      max: 0.9,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'honeycombStructure',
      params: {
        shape: inputs.shape,
        cellSize: params.cellSize,
        wallThickness: params.wallThickness,
        fillDensity: params.fillDensity,
      },
    });

    return {
      honeycomb: result,
    };
  },
};
