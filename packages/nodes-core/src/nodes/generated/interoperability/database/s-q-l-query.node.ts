import { NodeDefinition } from '@sim4d/types';

interface Params {
  connectionString: string;
  query: string;
  timeout: number;
}
interface Inputs {
  parameters?: Properties;
}
interface Outputs {
  data: Properties[];
  rowCount: number;
  columns: string[];
}

export const SQLQueryNode: NodeDefinition<SQLQueryInputs, SQLQueryOutputs, SQLQueryParams> = {
  type: 'Interoperability::SQLQuery',
  category: 'Interoperability',
  subcategory: 'Database',

  metadata: {
    label: 'SQLQuery',
    description: 'Execute SQL database queries',
  },

  params: {
    connectionString: {
      default: '',
      description: 'Database connection string',
    },
    query: {
      default: 'SELECT * FROM table',
      description: 'SQL query',
    },
    timeout: {
      default: 30,
      min: 1,
      max: 300,
      description: 'Timeout in seconds',
    },
  },

  inputs: {
    parameters: 'Properties',
  },

  outputs: {
    data: 'Properties[]',
    rowCount: 'number',
    columns: 'string[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sqlQuery',
      params: {
        parameters: inputs.parameters,
        connectionString: params.connectionString,
        query: params.query,
        timeout: params.timeout,
      },
    });

    return {
      data: result,
      rowCount: result,
      columns: result,
    };
  },
};
