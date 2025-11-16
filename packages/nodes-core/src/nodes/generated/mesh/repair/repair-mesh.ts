import type { NodeDefinition } from '@brepflow/types';

interface RepairMeshParams {
  fillHoles: boolean;
  fixNormals: boolean;
  removeDegenerate: boolean;
  removeDuplicates: boolean;
  makeManifold: boolean;
}

interface RepairMeshInputs {
  mesh: unknown;
}

interface RepairMeshOutputs {
  repaired: unknown;
  report: unknown;
}

export const MeshRepairRepairMeshNode: NodeDefinition<
  RepairMeshInputs,
  RepairMeshOutputs,
  RepairMeshParams
> = {
  id: 'Mesh::RepairMesh',
  type: 'Mesh::RepairMesh',
  category: 'Mesh',
  label: 'RepairMesh',
  description: 'Repair mesh defects',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    repaired: {
      type: 'Mesh',
      label: 'Repaired',
    },
    report: {
      type: 'Data',
      label: 'Report',
    },
  },
  params: {
    fillHoles: {
      type: 'boolean',
      label: 'Fill Holes',
      default: true,
    },
    fixNormals: {
      type: 'boolean',
      label: 'Fix Normals',
      default: true,
    },
    removeDegenerate: {
      type: 'boolean',
      label: 'Remove Degenerate',
      default: true,
    },
    removeDuplicates: {
      type: 'boolean',
      label: 'Remove Duplicates',
      default: true,
    },
    makeManifold: {
      type: 'boolean',
      label: 'Make Manifold',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'repairMesh',
      params: {
        mesh: inputs.mesh,
        fillHoles: params.fillHoles,
        fixNormals: params.fixNormals,
        removeDegenerate: params.removeDegenerate,
        removeDuplicates: params.removeDuplicates,
        makeManifold: params.makeManifold,
      },
    });

    return {
      repaired: results.repaired,
      report: results.report,
    };
  },
};
