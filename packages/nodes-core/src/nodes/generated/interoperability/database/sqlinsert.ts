import type { NodeDefinition } from '@brepflow/types';

interface SQLInsertParams {
  connectionString: string;
  tableName: string;
  batchSize: number;
}

interface SQLInsertInputs {
  data: unknown;
}

interface SQLInsertOutputs {
  success: unknown;
  insertedRows: unknown;
  errors: unknown;
}

export const InteroperabilityDatabaseSQLInsertNode: NodeDefinition<
  SQLInsertInputs,
  SQLInsertOutputs,
  SQLInsertParams
> = {
  id: 'Interoperability::SQLInsert',
  type: 'Interoperability::SQLInsert',
  category: 'Interoperability',
  label: 'SQLInsert',
  description: 'Insert data into SQL database',
  inputs: {
    data: {
      type: 'Properties[]',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    insertedRows: {
      type: 'number',
      label: 'Inserted Rows',
    },
    errors: {
      type: 'string[]',
      label: 'Errors',
    },
  },
  params: {
    connectionString: {
      type: 'string',
      label: 'Connection String',
      default: '',
    },
    tableName: {
      type: 'string',
      label: 'Table Name',
      default: '',
    },
    batchSize: {
      type: 'number',
      label: 'Batch Size',
      default: 100,
      min: 1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'sqlInsert',
      params: {
        data: inputs.data,
        connectionString: params.connectionString,
        tableName: params.tableName,
        batchSize: params.batchSize,
      },
    });

    return {
      success: results.success,
      insertedRows: results.insertedRows,
      errors: results.errors,
    };
  },
};
