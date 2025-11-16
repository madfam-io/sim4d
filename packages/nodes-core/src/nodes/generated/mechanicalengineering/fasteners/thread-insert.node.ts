import type { NodeDefinition } from '@brepflow/types';

interface ThreadInsertParams {
  threadSize: string;
  length: number;
  type: string;
}

interface ThreadInsertInputs {
  position: [number, number, number];
}

interface ThreadInsertOutputs {
  insert: unknown;
  installation_hole: unknown;
}

export const MechanicalEngineeringFastenersThreadInsertNode: NodeDefinition<
  ThreadInsertInputs,
  ThreadInsertOutputs,
  ThreadInsertParams
> = {
  id: 'MechanicalEngineering::ThreadInsert',
  category: 'MechanicalEngineering',
  label: 'ThreadInsert',
  description: 'Create threaded insert',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    insert: {
      type: 'Shape',
      label: 'Insert',
    },
    installation_hole: {
      type: 'Wire',
      label: 'Installation Hole',
    },
  },
  params: {
    threadSize: {
      type: 'enum',
      label: 'Thread Size',
      default: 'M5',
      options: ['M3', 'M4', 'M5', 'M6', 'M8'],
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 10,
      min: 5,
      max: 30,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: 'heat-set',
      options: ['helicoil', 'heat-set', 'press-fit', 'ultrasonic'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'threadInsert',
      params: {
        position: inputs.position,
        threadSize: params.threadSize,
        length: params.length,
        type: params.type,
      },
    });

    return {
      insert: results.insert,
      installation_hole: results.installation_hole,
    };
  },
};
