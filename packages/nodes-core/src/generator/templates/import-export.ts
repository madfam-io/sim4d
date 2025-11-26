/**
 * Import/Export Templates - Phase 8
 * File format conversion and data exchange
 */

import { NodeTemplate } from '../node-template';

/**
 * CAD Format Import/Export
 */
export const cadFormatTemplates: NodeTemplate[] = [
  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ImportSTEP',
    description: 'Import STEP file',
    operation: 'IMPORT_STEP',
    occtBinding: 'importSTEP',
    parameters: [
      { name: 'readColors', type: 'boolean', default: true },
      { name: 'readNames', type: 'boolean', default: true },
      { name: 'readLayers', type: 'boolean', default: true },
      { name: 'preferBrep', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [
      { name: 'shape', type: 'Shape' },
      { name: 'metadata', type: 'Data' },
    ],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ExportSTEP',
    description: 'Export to STEP format',
    operation: 'EXPORT_STEP',
    occtBinding: 'exportSTEP',
    parameters: [
      { name: 'version', type: 'enum', options: ['AP203', 'AP214', 'AP242'], default: 'AP214' },
      { name: 'writeColors', type: 'boolean', default: true },
      { name: 'writeNames', type: 'boolean', default: true },
      { name: 'writeLayers', type: 'boolean', default: true },
      { name: 'units', type: 'enum', options: ['mm', 'cm', 'm', 'inch'], default: 'mm' },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'metadata', type: 'Data', required: false },
    ],
    outputs: [{ name: 'stepData', type: 'Data' }],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ImportIGES',
    description: 'Import IGES file',
    operation: 'IMPORT_IGES',
    occtBinding: 'importIGES',
    parameters: [
      { name: 'readSurfaces', type: 'boolean', default: true },
      { name: 'readCurves', type: 'boolean', default: true },
      { name: 'sequence', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ExportIGES',
    description: 'Export to IGES format',
    operation: 'EXPORT_IGES',
    occtBinding: 'exportIGES',
    parameters: [
      { name: 'brepMode', type: 'enum', options: ['faces', 'shells'], default: 'faces' },
      { name: 'units', type: 'enum', options: ['mm', 'cm', 'm', 'inch'], default: 'mm' },
      { name: 'author', type: 'string', default: '' },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'igesData', type: 'Data' }],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ImportBREP',
    description: 'Import OpenCASCADE BREP',
    operation: 'IMPORT_BREP',
    occtBinding: 'importBREP',
    parameters: [{ name: 'version', type: 'string', default: 'auto' }],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ExportBREP',
    description: 'Export to BREP format',
    operation: 'EXPORT_BREP',
    occtBinding: 'exportBREP',
    parameters: [{ name: 'binary', type: 'boolean', default: false }],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'brepData', type: 'Data' }],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ImportParasolid',
    description: 'Import Parasolid file',
    operation: 'IMPORT_PARASOLID',
    occtBinding: 'importParasolid',
    parameters: [
      { name: 'healGeometry', type: 'boolean', default: true },
      { name: 'simplifyGeometry', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },

  {
    category: 'IO',
    subcategory: 'CAD',
    name: 'ImportACIS',
    description: 'Import ACIS SAT file',
    operation: 'IMPORT_ACIS',
    occtBinding: 'importACIS',
    parameters: [
      { name: 'version', type: 'string', default: 'auto' },
      { name: 'healGeometry', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },
];

/**
 * 2D Drawing Formats
 */
export const drawingFormatTemplates: NodeTemplate[] = [
  {
    category: 'IO',
    subcategory: 'Drawing',
    name: 'ImportDXF',
    description: 'Import DXF drawing',
    operation: 'IMPORT_DXF',
    occtBinding: 'importDXF',
    parameters: [
      { name: 'importAs', type: 'enum', options: ['2d', '3d', 'both'], default: '2d' },
      { name: 'layerFilter', type: 'string', default: '*' },
      { name: 'units', type: 'enum', options: ['mm', 'cm', 'm', 'inch'], default: 'mm' },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [
      { name: 'wires', type: 'Wire[]' },
      { name: 'layers', type: 'Data' },
    ],
  },

  {
    category: 'IO',
    subcategory: 'Drawing',
    name: 'ExportDXF',
    description: 'Export to DXF format',
    operation: 'EXPORT_DXF',
    occtBinding: 'exportDXF',
    parameters: [
      {
        name: 'version',
        type: 'enum',
        options: ['R12', 'R2000', 'R2004', 'R2007', 'R2010'],
        default: 'R2010',
      },
      {
        name: 'projection',
        type: 'enum',
        options: ['top', 'front', 'right', 'iso'],
        default: 'top',
      },
      { name: 'hiddenLines', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true },
      { name: 'layers', type: 'Data', required: false },
    ],
    outputs: [{ name: 'dxfData', type: 'Data' }],
  },

  {
    category: 'IO',
    subcategory: 'Drawing',
    name: 'ExportSVG',
    description: 'Export to SVG format',
    operation: 'EXPORT_SVG',
    occtBinding: 'exportSVG',
    parameters: [
      {
        name: 'projection',
        type: 'enum',
        options: ['top', 'front', 'right', 'iso'],
        default: 'top',
      },
      { name: 'width', type: 'number', default: 800, min: 100, max: 10000 },
      { name: 'height', type: 'number', default: 600, min: 100, max: 10000 },
      { name: 'strokeWidth', type: 'number', default: 1, min: 0.1, max: 10 },
      { name: 'fillOpacity', type: 'number', default: 0.3, min: 0, max: 1 },
    ],
    inputs: [{ name: 'shapes', type: 'Shape[]', required: true }],
    outputs: [{ name: 'svgData', type: 'string' }],
  },
];

/**
 * Data Exchange Formats
 */
export const dataExchangeTemplates: NodeTemplate[] = [
  {
    category: 'IO',
    subcategory: 'Exchange',
    name: 'ImportGLTF',
    description: 'Import GLTF/GLB model',
    operation: 'IMPORT_GLTF',
    occtBinding: 'importGLTF',
    parameters: [
      { name: 'importAnimations', type: 'boolean', default: false },
      { name: 'importMaterials', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'fileData', type: 'Data', required: true }],
    outputs: [
      { name: 'mesh', type: 'Mesh' },
      { name: 'materials', type: 'Data' },
      { name: 'animations', type: 'Data' },
    ],
  },

  {
    category: 'IO',
    subcategory: 'Exchange',
    name: 'ExportGLTF',
    description: 'Export to GLTF/GLB',
    operation: 'EXPORT_GLTF',
    occtBinding: 'exportGLTF',
    parameters: [
      { name: 'format', type: 'enum', options: ['gltf', 'glb'], default: 'glb' },
      { name: 'draco', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'materials', type: 'Data', required: false },
    ],
    outputs: [{ name: 'gltfData', type: 'Data' }],
  },

  {
    category: 'IO',
    subcategory: 'Exchange',
    name: 'ImportJSON',
    description: 'Import geometry from JSON',
    operation: 'IMPORT_JSON',
    occtBinding: 'importJSON',
    parameters: [
      {
        name: 'format',
        type: 'enum',
        options: ['sim4d', 'three', 'custom'],
        default: 'sim4d',
      },
    ],
    inputs: [{ name: 'jsonData', type: 'Data', required: true }],
    outputs: [
      { name: 'shapes', type: 'Shape[]' },
      { name: 'metadata', type: 'Data' },
    ],
  },

  {
    category: 'IO',
    subcategory: 'Exchange',
    name: 'ExportJSON',
    description: 'Export geometry to JSON',
    operation: 'EXPORT_JSON',
    occtBinding: 'exportJSON',
    parameters: [
      {
        name: 'format',
        type: 'enum',
        options: ['sim4d', 'three', 'custom'],
        default: 'sim4d',
      },
      { name: 'precision', type: 'number', default: 6, min: 1, max: 15, step: 1 },
      { name: 'includeTopology', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true },
      { name: 'metadata', type: 'Data', required: false },
    ],
    outputs: [{ name: 'jsonData', type: 'string' }],
  },
];

// Export all templates
export const allImportExportTemplates = [
  ...cadFormatTemplates,
  ...drawingFormatTemplates,
  ...dataExchangeTemplates,
];
