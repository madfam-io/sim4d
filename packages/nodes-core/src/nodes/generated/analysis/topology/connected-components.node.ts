import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

type Params = {};
interface Inputs {
  shape: Shape;
}
interface Outputs {
  components: Shape[];
  count: number;
}

export const ConnectedComponentsNode: NodeDefinition<
  ConnectedComponentsInputs,
  ConnectedComponentsOutputs,
  ConnectedComponentsParams
> = {
  type: 'Analysis::ConnectedComponents',
  category: 'Analysis',
  subcategory: 'Topology',

  metadata: {
    label: 'ConnectedComponents',
    description: 'Find connected components',
  },

  params: {},

  inputs: {
    shape: 'Shape',
  },

  outputs: {
    components: 'Shape[]',
    count: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'findConnectedComponents',
      params: {
        shape: inputs.shape,
      },
    });

    return {
      components: result,
      count: result,
    };
  },
};
