import type { NodeDefinition } from '@sim4d/types';

interface MetaBallsParams {
  threshold: number;
  resolution: number;
}

interface MetaBallsInputs {
  centers: Array<[number, number, number]>;
  radii: unknown;
}

interface MetaBallsOutputs {
  metaball: unknown;
}

export const SpecializedOrganicMetaBallsNode: NodeDefinition<
  MetaBallsInputs,
  MetaBallsOutputs,
  MetaBallsParams
> = {
  id: 'Specialized::MetaBalls',
  category: 'Specialized',
  label: 'MetaBalls',
  description: 'Create metaball surfaces',
  inputs: {
    centers: {
      type: 'Point[]',
      label: 'Centers',
      required: true,
    },
    radii: {
      type: 'number[]',
      label: 'Radii',
      required: true,
    },
  },
  outputs: {
    metaball: {
      type: 'Shape',
      label: 'Metaball',
    },
  },
  params: {
    threshold: {
      type: 'number',
      label: 'Threshold',
      default: 1,
      min: 0.1,
      max: 10,
    },
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 50,
      min: 10,
      max: 200,
      step: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'metaballs',
      params: {
        centers: inputs.centers,
        radii: inputs.radii,
        threshold: params.threshold,
        resolution: params.resolution,
      },
    });

    return {
      metaball: result,
    };
  },
};
