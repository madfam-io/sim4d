import type { NodeDefinition } from '@sim4d/types';

interface BillOfMaterialsParams {
  includeSubAssemblies: boolean;
  groupIdentical: boolean;
}

interface BillOfMaterialsInputs {
  assembly: unknown;
}

interface BillOfMaterialsOutputs {
  bom: unknown;
}

export const AssemblyPatternsBillOfMaterialsNode: NodeDefinition<
  BillOfMaterialsInputs,
  BillOfMaterialsOutputs,
  BillOfMaterialsParams
> = {
  id: 'Assembly::BillOfMaterials',
  category: 'Assembly',
  label: 'BillOfMaterials',
  description: 'Generate bill of materials',
  inputs: {
    assembly: {
      type: 'Assembly',
      label: 'Assembly',
      required: true,
    },
  },
  outputs: {
    bom: {
      type: 'BOM',
      label: 'Bom',
    },
  },
  params: {
    includeSubAssemblies: {
      type: 'boolean',
      label: 'Include Sub Assemblies',
      default: true,
    },
    groupIdentical: {
      type: 'boolean',
      label: 'Group Identical',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'assemblyBOM',
      params: {
        assembly: inputs.assembly,
        includeSubAssemblies: params.includeSubAssemblies,
        groupIdentical: params.groupIdentical,
      },
    });

    return {
      bom: result,
    };
  },
};
