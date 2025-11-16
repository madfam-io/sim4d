import type { NodeDefinition } from '@brepflow/types';

interface LeadInOutParams {
  leadLength: number;
  leadType: string;
}

interface LeadInOutInputs {
  paths: unknown;
}

interface LeadInOutOutputs {
  pathsWithLeads: unknown;
}

export const FabricationLaserLeadInOutNode: NodeDefinition<
  LeadInOutInputs,
  LeadInOutOutputs,
  LeadInOutParams
> = {
  id: 'Fabrication::LeadInOut',
  category: 'Fabrication',
  label: 'LeadInOut',
  description: 'Add lead-in/out to paths',
  inputs: {
    paths: {
      type: 'Wire[]',
      label: 'Paths',
      required: true,
    },
  },
  outputs: {
    pathsWithLeads: {
      type: 'Wire[]',
      label: 'Paths With Leads',
    },
  },
  params: {
    leadLength: {
      type: 'number',
      label: 'Lead Length',
      default: 2,
      min: 0.5,
      max: 10,
    },
    leadType: {
      type: 'enum',
      label: 'Lead Type',
      default: 'line',
      options: ['line', 'arc', 'none'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'leadInOut',
      params: {
        paths: inputs.paths,
        leadLength: params.leadLength,
        leadType: params.leadType,
      },
    });

    return {
      pathsWithLeads: result,
    };
  },
};
