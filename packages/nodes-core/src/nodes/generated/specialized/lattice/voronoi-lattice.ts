import type { NodeDefinition } from '@brepflow/types';

interface VoronoiLatticeParams {
  seedCount: number;
  strutDiameter: number;
  randomSeed: number;
}

interface VoronoiLatticeInputs {
  boundingShape: unknown;
  seedPoints?: Array<[number, number, number]>;
}

interface VoronoiLatticeOutputs {
  voronoi: unknown;
}

export const SpecializedLatticeVoronoiLatticeNode: NodeDefinition<
  VoronoiLatticeInputs,
  VoronoiLatticeOutputs,
  VoronoiLatticeParams
> = {
  id: 'Specialized::VoronoiLattice',
  type: 'Specialized::VoronoiLattice',
  category: 'Specialized',
  label: 'VoronoiLattice',
  description: 'Voronoi-based lattice',
  inputs: {
    boundingShape: {
      type: 'Shape',
      label: 'Bounding Shape',
      required: true,
    },
    seedPoints: {
      type: 'Point[]',
      label: 'Seed Points',
      optional: true,
    },
  },
  outputs: {
    voronoi: {
      type: 'Shape',
      label: 'Voronoi',
    },
  },
  params: {
    seedCount: {
      type: 'number',
      label: 'Seed Count',
      default: 100,
      min: 10,
      max: 10000,
      step: 10,
    },
    strutDiameter: {
      type: 'number',
      label: 'Strut Diameter',
      default: 1,
      min: 0.1,
      max: 10,
    },
    randomSeed: {
      type: 'number',
      label: 'Random Seed',
      default: 42,
      min: 0,
      max: 999999,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiLattice',
      params: {
        boundingShape: inputs.boundingShape,
        seedPoints: inputs.seedPoints,
        seedCount: params.seedCount,
        strutDiameter: params.strutDiameter,
        randomSeed: params.randomSeed,
      },
    });

    return {
      voronoi: result,
    };
  },
};
