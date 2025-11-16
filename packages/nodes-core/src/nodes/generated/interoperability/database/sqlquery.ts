import type { NodeDefinition } from '@brepflow/types';

interface SQLQueryParams {
  connectionString: string;
  query: string;
  timeout: number;
}

interface SQLQueryInputs {
  parameters?: unknown;
}

interface SQLQueryOutputs {
  data: unknown;
  rowCount: unknown;
  columns: unknown;
}

export const InteroperabilityDatabaseSQLQueryNode: NodeDefinition<
  SQLQueryInputs,
  SQLQueryOutputs,
  SQLQueryParams
> = {
  id: 'Interoperability::SQLQuery',
  type: 'Interoperability::SQLQuery',
  category: 'Interoperability',
  label: 'SQLQuery',
  description: 'Execute SQL database queries',
  inputs: {
    parameters: {
      type: 'Properties',
      label: 'Parameters',
      optional: true,
    },
  },
  outputs: {
    data: {
      type: 'Properties[]',
      label: 'Data',
    },
    rowCount: {
      type: 'number',
      label: 'Row Count',
    },
    columns: {
      type: 'string[]',
      label: 'Columns',
    },
  },
  params: {
    connectionString: {
      type: 'string',
      label: 'Connection String',
      default: '',
    },
    query: {
      type: 'string',
      label: 'Query',
      default: 'SELECT * FROM table',
    },
    timeout: {
      type: 'number',
      label: 'Timeout',
      default: 30,
      min: 1,
      max: 300,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'sqlQuery',
      params: {
        parameters: inputs.parameters,
        connectionString: params.connectionString,
        query: params.query,
        timeout: params.timeout,
      },
    });

    return {
      data: results.data,
      rowCount: results.rowCount,
      columns: results.columns,
    };
  },
};
