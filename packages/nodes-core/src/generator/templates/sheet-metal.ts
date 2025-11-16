/**
 * Sheet Metal Templates - Phase 4
 * Sheet metal specific operations for manufacturing
 */

import { NodeTemplate } from '../node-template';

/**
 * Sheet Metal Flanges and Bends
 */
export const flangeTemplates: NodeTemplate[] = [
  {
    category: 'SheetMetal',
    subcategory: 'Flanges',
    name: 'EdgeFlange',
    description: 'Create flange from edge',
    operation: 'SHEET_EDGE_FLANGE',
    occtBinding: 'sheetEdgeFlange',
    parameters: [
      {
        name: 'height',
        type: 'number',
        default: 25,
        min: 0.1,
        max: 1000,
        description: 'Flange height',
      },
      {
        name: 'angle',
        type: 'number',
        default: 90,
        min: 0,
        max: 180,
        description: 'Bend angle in degrees',
      },
      {
        name: 'bendRadius',
        type: 'number',
        default: 3,
        min: 0.1,
        max: 100,
        description: 'Bend radius',
      },
      {
        name: 'bendRelief',
        type: 'enum',
        options: ['rectangular', 'obround', 'tear'],
        default: 'rectangular',
      },
      { name: 'reliefRatio', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'edge', type: 'Edge', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Flanges',
    name: 'ContourFlange',
    description: 'Create flange from sketch contour',
    operation: 'SHEET_CONTOUR_FLANGE',
    occtBinding: 'sheetContourFlange',
    parameters: [
      { name: 'angle', type: 'number', default: 90, min: 0, max: 180 },
      { name: 'bendRadius', type: 'number', default: 3, min: 0.1, max: 100 },
      {
        name: 'flangePosition',
        type: 'enum',
        options: ['material-inside', 'bend-outside', 'material-outside'],
        default: 'material-inside',
      },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'contour', type: 'Wire', required: true },
      { name: 'profile', type: 'Wire', required: false, description: 'Custom profile for flange' },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Flanges',
    name: 'MiterFlange',
    description: 'Create mitered flange',
    operation: 'SHEET_MITER_FLANGE',
    occtBinding: 'sheetMiterFlange',
    parameters: [
      { name: 'height', type: 'number', default: 25, min: 0.1, max: 1000 },
      { name: 'angle', type: 'number', default: 90, min: 0, max: 180 },
      { name: 'miterAngle', type: 'number', default: 45, min: 0, max: 90 },
      { name: 'bendRadius', type: 'number', default: 3, min: 0.1, max: 100 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'edges', type: 'Edge[]', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },
];

/**
 * Sheet Metal Bends
 */
export const bendTemplates: NodeTemplate[] = [
  {
    category: 'SheetMetal',
    subcategory: 'Bends',
    name: 'SketchedBend',
    description: 'Create bend from sketch line',
    operation: 'SHEET_SKETCHED_BEND',
    occtBinding: 'sheetSketchedBend',
    parameters: [
      { name: 'angle', type: 'number', default: 90, min: -180, max: 180 },
      { name: 'bendRadius', type: 'number', default: 3, min: 0.1, max: 100 },
      { name: 'bendDirection', type: 'enum', options: ['up', 'down'], default: 'up' },
      { name: 'bendAllowance', type: 'number', default: 0, min: -10, max: 10 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'bendLine', type: 'Edge', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Bends',
    name: 'Hem',
    description: 'Create hemmed edge',
    operation: 'SHEET_HEM',
    occtBinding: 'sheetHem',
    parameters: [
      { name: 'hemType', type: 'enum', options: ['closed', 'open', 'teardrop'], default: 'closed' },
      { name: 'hemLength', type: 'number', default: 10, min: 0.1, max: 100 },
      { name: 'hemGap', type: 'number', default: 0.5, min: 0, max: 10 },
      { name: 'hemRadius', type: 'number', default: 0.5, min: 0.1, max: 10 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'edge', type: 'Edge', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Bends',
    name: 'Jog',
    description: 'Create jog offset in sheet',
    operation: 'SHEET_JOG',
    occtBinding: 'sheetJog',
    parameters: [
      { name: 'jogOffset', type: 'number', default: 10, min: 0.1, max: 1000 },
      { name: 'jogAngle', type: 'number', default: 90, min: 0, max: 180 },
      { name: 'bendRadius', type: 'number', default: 3, min: 0.1, max: 100 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'jogLine', type: 'Edge', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },
];

/**
 * Sheet Metal Corners and Relief
 */
export const cornerTemplates: NodeTemplate[] = [
  {
    category: 'SheetMetal',
    subcategory: 'Corners',
    name: 'CornerRelief',
    description: 'Add corner relief cuts',
    operation: 'SHEET_CORNER_RELIEF',
    occtBinding: 'sheetCornerRelief',
    parameters: [
      {
        name: 'reliefType',
        type: 'enum',
        options: ['circular', 'square', 'obround', 'tear'],
        default: 'circular',
      },
      { name: 'reliefSize', type: 'number', default: 5, min: 0.1, max: 100 },
      { name: 'reliefRatio', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'corners', type: 'Vertex[]', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Corners',
    name: 'BendRelief',
    description: 'Add bend relief cuts',
    operation: 'SHEET_BEND_RELIEF',
    occtBinding: 'sheetBendRelief',
    parameters: [
      {
        name: 'reliefType',
        type: 'enum',
        options: ['rectangular', 'obround', 'tear'],
        default: 'rectangular',
      },
      { name: 'reliefDepth', type: 'number', default: 5, min: 0.1, max: 100 },
      { name: 'reliefWidth', type: 'number', default: 2, min: 0.1, max: 50 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'bends', type: 'Edge[]', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Corners',
    name: 'ClosedCorner',
    description: 'Create closed corner',
    operation: 'SHEET_CLOSED_CORNER',
    occtBinding: 'sheetClosedCorner',
    parameters: [
      {
        name: 'cornerType',
        type: 'enum',
        options: ['overlap', 'underlap', 'butt'],
        default: 'overlap',
      },
      { name: 'gapDistance', type: 'number', default: 0, min: 0, max: 10 },
      { name: 'overlapRatio', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'faces', type: 'Face[]', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },
];

/**
 * Sheet Metal Features
 */
export const sheetFeatureTemplates: NodeTemplate[] = [
  {
    category: 'SheetMetal',
    subcategory: 'Features',
    name: 'Tab',
    description: 'Create tab feature',
    operation: 'SHEET_TAB',
    occtBinding: 'sheetTab',
    parameters: [
      { name: 'tabWidth', type: 'number', default: 20, min: 0.1, max: 500 },
      { name: 'tabDepth', type: 'number', default: 10, min: 0.1, max: 100 },
      {
        name: 'tabType',
        type: 'enum',
        options: ['rectangular', 'rounded', 'trapezoidal'],
        default: 'rectangular',
      },
      { name: 'cornerRadius', type: 'number', default: 2, min: 0, max: 50 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'edge', type: 'Edge', required: true },
      { name: 'position', type: 'Point', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Features',
    name: 'Slot',
    description: 'Create slot for tab',
    operation: 'SHEET_SLOT',
    occtBinding: 'sheetSlot',
    parameters: [
      { name: 'slotWidth', type: 'number', default: 20, min: 0.1, max: 500 },
      { name: 'slotDepth', type: 'number', default: 10, min: 0.1, max: 100 },
      { name: 'clearance', type: 'number', default: 0.2, min: 0, max: 5 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'edge', type: 'Edge', required: true },
      { name: 'position', type: 'Point', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Features',
    name: 'Louver',
    description: 'Create louver ventilation',
    operation: 'SHEET_LOUVER',
    occtBinding: 'sheetLouver',
    parameters: [
      { name: 'louverLength', type: 'number', default: 30, min: 1, max: 500 },
      { name: 'louverWidth', type: 'number', default: 5, min: 0.5, max: 100 },
      { name: 'louverHeight', type: 'number', default: 5, min: 0.5, max: 50 },
      { name: 'louverAngle', type: 'number', default: 45, min: 0, max: 90 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'position', type: 'Point', required: true },
      { name: 'direction', type: 'Vector', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Features',
    name: 'Lance',
    description: 'Create lanced form',
    operation: 'SHEET_LANCE',
    occtBinding: 'sheetLance',
    parameters: [
      { name: 'lanceLength', type: 'number', default: 20, min: 1, max: 200 },
      { name: 'lanceWidth', type: 'number', default: 5, min: 0.5, max: 50 },
      { name: 'lanceHeight', type: 'number', default: 3, min: 0.1, max: 50 },
      { name: 'lanceAngle', type: 'number', default: 30, min: 0, max: 90 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'sketch', type: 'Wire', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Features',
    name: 'Bead',
    description: 'Create stiffening bead',
    operation: 'SHEET_BEAD',
    occtBinding: 'sheetBead',
    parameters: [
      { name: 'beadWidth', type: 'number', default: 10, min: 0.5, max: 100 },
      { name: 'beadHeight', type: 'number', default: 3, min: 0.1, max: 50 },
      { name: 'beadProfile', type: 'enum', options: ['U', 'V', 'round'], default: 'U' },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'path', type: 'Wire', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },
];

/**
 * Sheet Metal Unfold/Fold Operations
 */
export const unfoldTemplates: NodeTemplate[] = [
  {
    category: 'SheetMetal',
    subcategory: 'Unfold',
    name: 'Unfold',
    description: 'Unfold sheet metal to flat pattern',
    operation: 'SHEET_UNFOLD',
    occtBinding: 'sheetUnfold',
    parameters: [
      {
        name: 'kFactor',
        type: 'number',
        default: 0.44,
        min: 0,
        max: 1,
        description: 'Neutral axis position',
      },
      { name: 'bendAllowance', type: 'number', default: 0, min: -10, max: 10 },
      { name: 'autoRelief', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'foldedShape', type: 'Shape', required: true },
      { name: 'fixedFace', type: 'Face', required: false, description: 'Face to keep fixed' },
    ],
    outputs: [
      { name: 'flatPattern', type: 'Shape' },
      { name: 'bendLines', type: 'Edge[]' },
      { name: 'bendTable', type: 'Data', description: 'Bend sequence information' },
    ],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Unfold',
    name: 'Fold',
    description: 'Fold flat pattern to 3D',
    operation: 'SHEET_FOLD',
    occtBinding: 'sheetFold',
    parameters: [
      { name: 'foldSequence', type: 'string', default: 'auto', description: 'Bend sequence order' },
      {
        name: 'partialFold',
        type: 'number',
        default: 1,
        min: 0,
        max: 1,
        description: 'Fold completion ratio',
      },
    ],
    inputs: [
      { name: 'flatPattern', type: 'Shape', required: true },
      { name: 'bendLines', type: 'Edge[]', required: true },
      { name: 'bendAngles', type: 'number[]', required: true },
    ],
    outputs: [{ name: 'foldedShape', type: 'Shape' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Unfold',
    name: 'ExportDXF',
    description: 'Export flat pattern to DXF',
    operation: 'SHEET_EXPORT_DXF',
    occtBinding: 'sheetExportDXF',
    parameters: [
      { name: 'inclueBendLines', type: 'boolean', default: true },
      { name: 'includeFormingTools', type: 'boolean', default: true },
      {
        name: 'layerMapping',
        type: 'enum',
        options: ['by-feature', 'by-type', 'single'],
        default: 'by-type',
      },
    ],
    inputs: [
      { name: 'flatPattern', type: 'Shape', required: true },
      { name: 'annotations', type: 'Data', required: false },
    ],
    outputs: [{ name: 'dxfData', type: 'Data' }],
  },
];

/**
 * Sheet Metal Properties
 */
export const sheetPropertiesTemplates: NodeTemplate[] = [
  {
    category: 'SheetMetal',
    subcategory: 'Properties',
    name: 'SheetMetalStyle',
    description: 'Define sheet metal parameters',
    operation: 'SHEET_STYLE',
    occtBinding: 'sheetStyle',
    parameters: [
      {
        name: 'thickness',
        type: 'number',
        default: 2,
        min: 0.1,
        max: 50,
        description: 'Material thickness',
      },
      {
        name: 'material',
        type: 'enum',
        options: ['steel', 'aluminum', 'stainless', 'copper', 'brass'],
        default: 'steel',
      },
      { name: 'kFactor', type: 'number', default: 0.44, min: 0, max: 1 },
      { name: 'minBendRadius', type: 'number', default: 2, min: 0.1, max: 50 },
      {
        name: 'reliefType',
        type: 'enum',
        options: ['rectangular', 'obround', 'tear'],
        default: 'rectangular',
      },
    ],
    inputs: [],
    outputs: [{ name: 'style', type: 'Data' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Properties',
    name: 'BendTable',
    description: 'Define bend deduction table',
    operation: 'SHEET_BEND_TABLE',
    occtBinding: 'sheetBendTable',
    parameters: [
      {
        name: 'tableType',
        type: 'enum',
        options: ['bend-deduction', 'bend-allowance', 'k-factor'],
        default: 'k-factor',
      },
    ],
    inputs: [{ name: 'tableData', type: 'Data', required: true, description: 'CSV or table data' }],
    outputs: [{ name: 'bendTable', type: 'Data' }],
  },

  {
    category: 'SheetMetal',
    subcategory: 'Properties',
    name: 'CostEstimate',
    description: 'Estimate manufacturing cost',
    operation: 'SHEET_COST_ESTIMATE',
    occtBinding: 'sheetCostEstimate',
    parameters: [
      { name: 'materialCostPerKg', type: 'number', default: 2, min: 0.1, max: 1000 },
      { name: 'setupCost', type: 'number', default: 50, min: 0, max: 10000 },
      {
        name: 'bendCost',
        type: 'number',
        default: 0.5,
        min: 0,
        max: 100,
        description: 'Cost per bend',
      },
      { name: 'cutCostPerMeter', type: 'number', default: 1, min: 0, max: 100 },
    ],
    inputs: [
      { name: 'sheet', type: 'Shape', required: true },
      { name: 'quantity', type: 'number', required: false },
    ],
    outputs: [
      { name: 'cost', type: 'number' },
      { name: 'breakdown', type: 'Data' },
    ],
  },
];

// Export all templates
export const allSheetMetalTemplates = [
  ...flangeTemplates,
  ...bendTemplates,
  ...cornerTemplates,
  ...sheetFeatureTemplates,
  ...unfoldTemplates,
  ...sheetPropertiesTemplates,
];
