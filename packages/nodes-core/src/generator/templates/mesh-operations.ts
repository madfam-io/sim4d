/**
 * Mesh Operations Templates - Phase 7
 * Tessellation, mesh repair, and format conversion
 */

import { NodeTemplate } from '../node-template';

/**
 * Tessellation Control
 */
export const tessellationTemplates: NodeTemplate[] = [
  {
    category: 'Mesh',
    subcategory: 'Tessellation',
    name: 'Tessellate',
    description: 'Convert shape to mesh',
    operation: 'TESSELLATE',
    occtBinding: 'tessellate',
    parameters: [
      {
        name: 'linearDeflection',
        type: 'number',
        default: 0.1,
        min: 0.001,
        max: 10,
        description: 'Maximum deviation from true surface',
      },
      {
        name: 'angularDeflection',
        type: 'number',
        default: 0.5,
        min: 0.01,
        max: 1,
        description: 'Angular deflection in radians',
      },
      { name: 'relative', type: 'boolean', default: false, description: 'Use relative deflection' },
      { name: 'qualityNormals', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'mesh', type: 'Mesh' },
      { name: 'triangleCount', type: 'number' },
      { name: 'vertexCount', type: 'number' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Tessellation',
    name: 'AdaptiveTessellation',
    description: 'Adaptive mesh generation',
    operation: 'ADAPTIVE_TESSELLATE',
    occtBinding: 'adaptiveTessellate',
    parameters: [
      { name: 'minEdgeLength', type: 'number', default: 0.1, min: 0.001, max: 100 },
      { name: 'maxEdgeLength', type: 'number', default: 10, min: 0.1, max: 1000 },
      { name: 'curvatureFactor', type: 'number', default: 1, min: 0.1, max: 10 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'mesh', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Tessellation',
    name: 'RemeshUniform',
    description: 'Uniform remeshing',
    operation: 'REMESH_UNIFORM',
    occtBinding: 'remeshUniform',
    parameters: [
      { name: 'targetEdgeLength', type: 'number', default: 1, min: 0.01, max: 100 },
      { name: 'iterations', type: 'number', default: 3, min: 1, max: 10, step: 1 },
      { name: 'preserveFeatures', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'remeshed', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Tessellation',
    name: 'QuadMesh',
    description: 'Generate quad-dominant mesh',
    operation: 'QUAD_MESH',
    occtBinding: 'quadMesh',
    parameters: [
      { name: 'targetQuadSize', type: 'number', default: 5, min: 0.1, max: 100 },
      { name: 'quadDominance', type: 'number', default: 0.8, min: 0, max: 1 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'quadMesh', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Tessellation',
    name: 'VoxelMesh',
    description: 'Create voxel mesh',
    operation: 'VOXEL_MESH',
    occtBinding: 'voxelMesh',
    parameters: [
      { name: 'voxelSize', type: 'number', default: 1, min: 0.01, max: 100 },
      { name: 'fillInterior', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'voxels', type: 'Mesh' }],
  },
];

/**
 * Mesh Repair and Simplification
 */
export const meshRepairTemplates: NodeTemplate[] = [
  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'RepairMesh',
    description: 'Repair mesh defects',
    operation: 'REPAIR_MESH',
    occtBinding: 'repairMesh',
    parameters: [
      { name: 'fillHoles', type: 'boolean', default: true },
      { name: 'fixNormals', type: 'boolean', default: true },
      { name: 'removeDegenerate', type: 'boolean', default: true },
      { name: 'removeDuplicates', type: 'boolean', default: true },
      { name: 'makeManifold', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [
      { name: 'repaired', type: 'Mesh' },
      { name: 'report', type: 'Data' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'SimplifyMesh',
    description: 'Reduce mesh complexity',
    operation: 'SIMPLIFY_MESH',
    occtBinding: 'simplifyMesh',
    parameters: [
      {
        name: 'targetRatio',
        type: 'number',
        default: 0.5,
        min: 0.01,
        max: 1,
        description: 'Target triangle ratio',
      },
      { name: 'preserveBoundaries', type: 'boolean', default: true },
      { name: 'preserveTopology', type: 'boolean', default: false },
      { name: 'maxError', type: 'number', default: 0.1, min: 0.001, max: 10 },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [
      { name: 'simplified', type: 'Mesh' },
      { name: 'triangleCount', type: 'number' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'FillHoles',
    description: 'Fill mesh holes',
    operation: 'FILL_HOLES',
    occtBinding: 'fillHoles',
    parameters: [
      {
        name: 'maxHoleSize',
        type: 'number',
        default: 100,
        min: 1,
        max: 10000,
        description: 'Max edges in hole boundary',
      },
      {
        name: 'fillMethod',
        type: 'enum',
        options: ['flat', 'smooth', 'curvature'],
        default: 'smooth',
      },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [
      { name: 'filled', type: 'Mesh' },
      { name: 'holesCount', type: 'number' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'SmoothMesh',
    description: 'Smooth mesh surface',
    operation: 'SMOOTH_MESH',
    occtBinding: 'smoothMesh',
    parameters: [
      { name: 'iterations', type: 'number', default: 5, min: 1, max: 100, step: 1 },
      { name: 'smoothingFactor', type: 'number', default: 0.5, min: 0, max: 1 },
      { name: 'preserveVolume', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'smoothed', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'DecimateMesh',
    description: 'Decimate mesh intelligently',
    operation: 'DECIMATE_MESH',
    occtBinding: 'decimateMesh',
    parameters: [
      { name: 'targetTriangles', type: 'number', default: 1000, min: 10, max: 1000000, step: 100 },
      { name: 'preserveFeatures', type: 'boolean', default: true },
      { name: 'featureAngle', type: 'number', default: 30, min: 0, max: 180 },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'decimated', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'SubdivideMesh',
    description: 'Subdivide mesh faces',
    operation: 'SUBDIVIDE_MESH',
    occtBinding: 'subdivideMesh',
    parameters: [
      {
        name: 'subdivisionType',
        type: 'enum',
        options: ['loop', 'catmull-clark', 'simple'],
        default: 'loop',
      },
      { name: 'levels', type: 'number', default: 1, min: 1, max: 5, step: 1 },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'subdivided', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'MeshBoolean',
    description: 'Boolean operations on meshes',
    operation: 'MESH_BOOLEAN',
    occtBinding: 'meshBoolean',
    parameters: [
      {
        name: 'operation',
        type: 'enum',
        options: ['union', 'difference', 'intersection'],
        default: 'union',
      },
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
    ],
    inputs: [
      { name: 'mesh1', type: 'Mesh', required: true },
      { name: 'mesh2', type: 'Mesh', required: true },
    ],
    outputs: [{ name: 'result', type: 'Mesh' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Repair',
    name: 'MeshOffset',
    description: 'Offset mesh surface',
    operation: 'MESH_OFFSET',
    occtBinding: 'meshOffset',
    parameters: [
      { name: 'offsetDistance', type: 'number', default: 1, min: -100, max: 100 },
      { name: 'solidify', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'offset', type: 'Mesh' }],
  },
];

/**
 * Mesh File Operations
 */
export const meshFileTemplates: NodeTemplate[] = [
  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'ImportSTL',
    description: 'Import STL mesh',
    operation: 'IMPORT_STL',
    occtBinding: 'importSTL',
    parameters: [
      { name: 'units', type: 'enum', options: ['mm', 'cm', 'm', 'inch', 'foot'], default: 'mm' },
      { name: 'validate', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [
      { name: 'mesh', type: 'Mesh' },
      { name: 'isValid', type: 'boolean' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'ExportSTL',
    description: 'Export mesh to STL',
    operation: 'EXPORT_STL',
    occtBinding: 'exportSTL',
    parameters: [
      { name: 'format', type: 'enum', options: ['ascii', 'binary'], default: 'binary' },
      { name: 'units', type: 'enum', options: ['mm', 'cm', 'm', 'inch', 'foot'], default: 'mm' },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'stlData', type: 'Data' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'ImportOBJ',
    description: 'Import OBJ mesh',
    operation: 'IMPORT_OBJ',
    occtBinding: 'importOBJ',
    parameters: [
      { name: 'importMaterials', type: 'boolean', default: true },
      { name: 'importTextures', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [
      { name: 'mesh', type: 'Mesh' },
      { name: 'materials', type: 'Data' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'ExportOBJ',
    description: 'Export mesh to OBJ',
    operation: 'EXPORT_OBJ',
    occtBinding: 'exportOBJ',
    parameters: [
      { name: 'exportNormals', type: 'boolean', default: true },
      { name: 'exportUVs', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'materials', type: 'Data', required: false },
    ],
    outputs: [
      { name: 'objData', type: 'Data' },
      { name: 'mtlData', type: 'Data' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'ImportPLY',
    description: 'Import PLY mesh',
    operation: 'IMPORT_PLY',
    occtBinding: 'importPLY',
    parameters: [
      { name: 'importColors', type: 'boolean', default: true },
      { name: 'importProperties', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [
      { name: 'mesh', type: 'Mesh' },
      { name: 'properties', type: 'Data' },
    ],
  },

  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'Export3MF',
    description: 'Export to 3MF format',
    operation: 'EXPORT_3MF',
    occtBinding: 'export3MF',
    parameters: [
      { name: 'includeColors', type: 'boolean', default: true },
      { name: 'includeMaterials', type: 'boolean', default: true },
      { name: 'includeMetadata', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'metadata', type: 'Data', required: false },
    ],
    outputs: [{ name: 'file3MF', type: 'Data' }],
  },

  {
    category: 'Mesh',
    subcategory: 'Files',
    name: 'MeshToShape',
    description: 'Convert mesh to B-Rep',
    operation: 'MESH_TO_SHAPE',
    occtBinding: 'meshToShape',
    parameters: [
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'sewFaces', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'mesh', type: 'Mesh', required: true }],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },
];

// Export all templates
export const allMeshOperationTemplates = [
  ...tessellationTemplates,
  ...meshRepairTemplates,
  ...meshFileTemplates,
];
