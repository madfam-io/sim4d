import type { NodeDefinition } from '@sim4d/types';

type FieldFluxParams = Record<string, never>;

interface FieldFluxInputs {
  vectorField?: unknown;
  surface: unknown;
}

interface FieldFluxOutputs {
  flux: number;
}

export const FieldsAnalysisFieldFluxNode: NodeDefinition<
  FieldFluxInputs,
  FieldFluxOutputs,
  FieldFluxParams
> = {
  id: 'Fields::FieldFlux',
  type: 'Fields::FieldFlux',
  category: 'Fields',
  label: 'FieldFlux',
  description: 'Calculate flux through surface',
  inputs: {
    vectorField: {
      type: 'VectorField',
      label: 'Vector Field',
      optional: true,
    },
    surface: {
      type: 'Surface',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    flux: {
      type: 'Number',
      label: 'Flux',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'calculateFlux',
      params: {
        vectorField: inputs.vectorField,
        surface: inputs.surface,
      },
    });

    return {
      flux: result,
    };
  },
};
