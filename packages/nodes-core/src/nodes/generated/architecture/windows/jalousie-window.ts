import type { NodeDefinition } from '@brepflow/types';

interface JalousieWindowParams {
  slats: number;
  angle: number;
}

interface JalousieWindowInputs {
  opening: unknown;
}

interface JalousieWindowOutputs {
  jalousie: unknown;
  slats: unknown;
}

export const ArchitectureWindowsJalousieWindowNode: NodeDefinition<
  JalousieWindowInputs,
  JalousieWindowOutputs,
  JalousieWindowParams
> = {
  id: 'Architecture::JalousieWindow',
  type: 'Architecture::JalousieWindow',
  category: 'Architecture',
  label: 'JalousieWindow',
  description: 'Jalousie louvre window',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    jalousie: {
      type: 'Shape',
      label: 'Jalousie',
    },
    slats: {
      type: 'Shape[]',
      label: 'Slats',
    },
  },
  params: {
    slats: {
      type: 'number',
      label: 'Slats',
      default: 10,
      min: 5,
      max: 20,
      step: 1,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 0,
      min: 0,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'jalousieWindow',
      params: {
        opening: inputs.opening,
        slats: params.slats,
        angle: params.angle,
      },
    });

    return {
      jalousie: results.jalousie,
      slats: results.slats,
    };
  },
};
