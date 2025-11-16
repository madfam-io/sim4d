import type { NodeDefinition } from '@brepflow/types';

interface FlowAttractorParams {
  velocity: number;
  turbulence: number;
  viscosity: number;
}

interface FlowAttractorInputs {
  obstacles?: unknown;
  sources?: Array<[number, number, number]>;
}

interface FlowAttractorOutputs {
  field: unknown;
}

export const FieldAttractorFlowAttractorNode: NodeDefinition<
  FlowAttractorInputs,
  FlowAttractorOutputs,
  FlowAttractorParams
> = {
  id: 'Field::FlowAttractor',
  type: 'Field::FlowAttractor',
  category: 'Field',
  label: 'FlowAttractor',
  description: 'Flow field attractor',
  inputs: {
    obstacles: {
      type: 'Shape[]',
      label: 'Obstacles',
      optional: true,
    },
    sources: {
      type: 'Point[]',
      label: 'Sources',
      optional: true,
    },
  },
  outputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
    },
  },
  params: {
    velocity: {
      type: 'number',
      label: 'Velocity',
      default: 10,
      min: 0,
    },
    turbulence: {
      type: 'number',
      label: 'Turbulence',
      default: 0.1,
      min: 0,
      max: 1,
    },
    viscosity: {
      type: 'number',
      label: 'Viscosity',
      default: 0.1,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorFlow',
      params: {
        obstacles: inputs.obstacles,
        sources: inputs.sources,
        velocity: params.velocity,
        turbulence: params.turbulence,
        viscosity: params.viscosity,
      },
    });

    return {
      field: result,
    };
  },
};
