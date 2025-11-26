import type { NodeDefinition } from '@sim4d/types';

interface ContouringToolpathParams {
  levels: number;
  climb: boolean;
  compensation: string;
}

interface ContouringToolpathInputs {
  surface: unknown;
}

interface ContouringToolpathOutputs {
  contours: unknown;
}

export const FabricationCNCContouringToolpathNode: NodeDefinition<
  ContouringToolpathInputs,
  ContouringToolpathOutputs,
  ContouringToolpathParams
> = {
  id: 'Fabrication::ContouringToolpath',
  type: 'Fabrication::ContouringToolpath',
  category: 'Fabrication',
  label: 'ContouringToolpath',
  description: 'Contour machining paths',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    contours: {
      type: 'Wire[]',
      label: 'Contours',
    },
  },
  params: {
    levels: {
      type: 'number',
      label: 'Levels',
      default: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    climb: {
      type: 'boolean',
      label: 'Climb',
      default: true,
    },
    compensation: {
      type: 'enum',
      label: 'Compensation',
      default: 'right',
      options: ['left', 'right', 'center'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'contouringToolpath',
      params: {
        surface: inputs.surface,
        levels: params.levels,
        climb: params.climb,
        compensation: params.compensation,
      },
    });

    return {
      contours: result,
    };
  },
};
