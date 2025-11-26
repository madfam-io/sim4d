import type { NodeDefinition } from '@sim4d/types';

interface LatticeStructureParams {
  cellType: string;
  cellSize: number;
  strutDiameter: number;
  porosity: number;
}

interface LatticeStructureInputs {
  boundingShape: unknown;
}

interface LatticeStructureOutputs {
  lattice: unknown;
}

export const SpecializedLatticeLatticeStructureNode: NodeDefinition<
  LatticeStructureInputs,
  LatticeStructureOutputs,
  LatticeStructureParams
> = {
  id: 'Specialized::LatticeStructure',
  type: 'Specialized::LatticeStructure',
  category: 'Specialized',
  label: 'LatticeStructure',
  description: 'Create lattice structure',
  inputs: {
    boundingShape: {
      type: 'Shape',
      label: 'Bounding Shape',
      required: true,
    },
  },
  outputs: {
    lattice: {
      type: 'Shape',
      label: 'Lattice',
    },
  },
  params: {
    cellType: {
      type: 'enum',
      label: 'Cell Type',
      default: 'cubic',
      options: ['cubic', 'gyroid', 'diamond', 'schwarz', 'bcc', 'fcc'],
    },
    cellSize: {
      type: 'number',
      label: 'Cell Size',
      default: 10,
      min: 0.1,
      max: 100,
    },
    strutDiameter: {
      type: 'number',
      label: 'Strut Diameter',
      default: 1,
      min: 0.1,
      max: 10,
    },
    porosity: {
      type: 'number',
      label: 'Porosity',
      default: 0.7,
      min: 0.1,
      max: 0.95,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'latticeStructure',
      params: {
        boundingShape: inputs.boundingShape,
        cellType: params.cellType,
        cellSize: params.cellSize,
        strutDiameter: params.strutDiameter,
        porosity: params.porosity,
      },
    });

    return {
      lattice: result,
    };
  },
};
