import type { NodeDefinition } from '@brepflow/types';

interface TopologyOptimizeParams {
  volumeFraction: number;
  penaltyFactor: number;
  filterRadius: number;
  iterations: number;
}

interface TopologyOptimizeInputs {
  designSpace: unknown;
  loads: unknown;
  constraints: unknown;
}

interface TopologyOptimizeOutputs {
  optimized: unknown;
  convergence: unknown;
}

export const SpecializedOptimizationTopologyOptimizeNode: NodeDefinition<
  TopologyOptimizeInputs,
  TopologyOptimizeOutputs,
  TopologyOptimizeParams
> = {
  id: 'Specialized::TopologyOptimize',
  category: 'Specialized',
  label: 'TopologyOptimize',
  description: 'Topology optimization',
  inputs: {
    designSpace: {
      type: 'Shape',
      label: 'Design Space',
      required: true,
    },
    loads: {
      type: 'Data',
      label: 'Loads',
      required: true,
    },
    constraints: {
      type: 'Data',
      label: 'Constraints',
      required: true,
    },
  },
  outputs: {
    optimized: {
      type: 'Shape',
      label: 'Optimized',
    },
    convergence: {
      type: 'Data',
      label: 'Convergence',
    },
  },
  params: {
    volumeFraction: {
      type: 'number',
      label: 'Volume Fraction',
      default: 0.3,
      min: 0.1,
      max: 0.9,
    },
    penaltyFactor: {
      type: 'number',
      label: 'Penalty Factor',
      default: 3,
      min: 1,
      max: 5,
    },
    filterRadius: {
      type: 'number',
      label: 'Filter Radius',
      default: 2,
      min: 0.5,
      max: 10,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 100,
      min: 10,
      max: 500,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'topologyOptimize',
      params: {
        designSpace: inputs.designSpace,
        loads: inputs.loads,
        constraints: inputs.constraints,
        volumeFraction: params.volumeFraction,
        penaltyFactor: params.penaltyFactor,
        filterRadius: params.filterRadius,
        iterations: params.iterations,
      },
    });

    return {
      optimized: results.optimized,
      convergence: results.convergence,
    };
  },
};
