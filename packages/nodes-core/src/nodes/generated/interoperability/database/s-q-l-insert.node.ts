import { NodeDefinition } from '@sim4d/types';

interface Params {
  connectionString: string;
  tableName: string;
  batchSize: number;
}
interface Inputs {
  data: Properties[];
}
interface Outputs {
  success: boolean;
  insertedRows: number;
  errors: string[];
}

export const SQLInsertNode: NodeDefinition<SQLInsertInputs, SQLInsertOutputs, SQLInsertParams> = {
  type: 'Interoperability::SQLInsert',
  category: 'Interoperability',
  subcategory: 'Database',

  metadata: {
    label: 'SQLInsert',
    description: 'Insert data into SQL database',
  },

  params: {
    connectionString: {
      default: '',
    },
    tableName: {
      default: '',
      description: 'Target table name',
    },
    batchSize: {
      default: 100,
      min: 1,
      max: 1000,
    },
  },

  inputs: {
    data: 'Properties[]',
  },

  outputs: {
    success: 'boolean',
    insertedRows: 'number',
    errors: 'string[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sqlInsert',
      params: {
        data: inputs.data,
        connectionString: params.connectionString,
        tableName: params.tableName,
        batchSize: params.batchSize,
      },
    });

    return {
      success: result,
      insertedRows: result,
      errors: result,
    };
  },
};
