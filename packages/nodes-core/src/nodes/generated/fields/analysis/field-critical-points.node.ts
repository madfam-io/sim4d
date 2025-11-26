import type { NodeDefinition } from '@sim4d/types';

interface FieldCriticalPointsParams {
  tolerance: number;
  type: string;
}

interface FieldCriticalPointsInputs {
  field?: unknown;
  domain?: unknown;
}

interface FieldCriticalPointsOutputs {
  points: unknown;
  types: unknown;
  values: unknown;
}

export const FieldsAnalysisFieldCriticalPointsNode: NodeDefinition<
  FieldCriticalPointsInputs,
  FieldCriticalPointsOutputs,
  FieldCriticalPointsParams
> = {
  id: 'Fields::FieldCriticalPoints',
  category: 'Fields',
  label: 'FieldCriticalPoints',
  description: 'Find critical points in field',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    domain: {
      type: 'Geometry',
      label: 'Domain',
      optional: true,
    },
  },
  outputs: {
    points: {
      type: 'PointSet',
      label: 'Points',
    },
    types: {
      type: 'StringList',
      label: 'Types',
    },
    values: {
      type: 'NumberList',
      label: 'Values',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0,
      max: 1,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: '"all"',
      options: ['all', 'minima', 'maxima', 'saddles'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'findCriticalPoints',
      params: {
        field: inputs.field,
        domain: inputs.domain,
        tolerance: params.tolerance,
        type: params.type,
      },
    });

    return {
      points: results.points,
      types: results.types,
      values: results.values,
    };
  },
};
