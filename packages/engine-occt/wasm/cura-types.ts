/**
 * CuraEngine WASM Type Definitions
 *
 * Type-safe interfaces for CuraEngine slicing operations
 */

/**
 * CuraEngine slicer settings
 *
 * Comprehensive configuration for FDM/FFF 3D printing
 */
export interface CuraSettings {
  // === Layer Settings ===
  /** Layer height in mm (default: 0.2) */
  layerHeight?: number;
  /** First layer height in mm (default: same as layerHeight) */
  firstLayerHeight?: number;

  // === Wall Settings ===
  /** Wall thickness in mm (default: 1.2) */
  wallThickness?: number;
  /** Number of wall lines (default: 3) */
  wallLineCount?: number;

  // === Infill Settings ===
  /** Infill density 0-100% (default: 20) */
  infillDensity?: number;
  /** Infill pattern: 'grid', 'lines', 'triangles', 'cubic', 'gyroid', etc. */
  infillPattern?: 'grid' | 'lines' | 'triangles' | 'cubic' | 'gyroid' | 'concentric';

  // === Speed Settings ===
  /** Print speed in mm/s (default: 60) */
  printSpeed?: number;
  /** Travel speed in mm/s (default: 150) */
  travelSpeed?: number;
  /** Infill speed in mm/s (default: same as printSpeed) */
  infillSpeed?: number;
  /** Wall speed in mm/s (default: same as printSpeed) */
  wallSpeed?: number;

  // === Temperature Settings ===
  /** Nozzle temperature in °C (default: 210) */
  nozzleTemp?: number;
  /** Bed temperature in °C (default: 60) */
  bedTemp?: number;

  // === Support Settings ===
  /** Enable support structures (default: false) */
  supportEnabled?: boolean;
  /** Support type: 'everywhere' | 'touching_buildplate' */
  supportType?: 'everywhere' | 'touching_buildplate';
  /** Support pattern: 'grid', 'lines', 'zigzag' */
  supportPattern?: 'grid' | 'lines' | 'zigzag';
  /** Support density 0-100% (default: 20) */
  supportDensity?: number;

  // === Retraction Settings ===
  /** Enable retraction (default: true) */
  retractionEnabled?: boolean;
  /** Retraction distance in mm (default: 5) */
  retractionDistance?: number;
  /** Retraction speed in mm/s (default: 45) */
  retractionSpeed?: number;

  // === Machine Settings ===
  /** Nozzle diameter in mm (default: 0.4) */
  nozzleSize?: number;
  /** Build plate width in mm (default: 220) */
  bedWidth?: number;
  /** Build plate depth in mm (default: 220) */
  bedDepth?: number;
  /** Maximum build height in mm (default: 250) */
  bedHeight?: number;
  /** Heated bed available (default: true) */
  heatedBed?: boolean;

  // === Adhesion Settings ===
  /** Build plate adhesion type */
  adhesionType?: 'none' | 'skirt' | 'brim' | 'raft';

  // === Special Modes ===
  /** Spiralize outer contour (vase mode) (default: false) */
  spiralize?: boolean;

  // === G-code Flavor ===
  /** G-code dialect for printer firmware */
  gcodeFlavor?: 'RepRap (Marlin/Sprinter)' | 'UltiGCode' | 'Makerbot' | 'Griffin' | 'Repetier' | 'RepRap (Volumetric)';

  // === Multi-Material Settings (future) ===
  /** Extruder number for multi-material (default: 0) */
  extruder?: number;
  /** Prime tower enabled for multi-material */
  primeTowerEnabled?: boolean;
}

/**
 * Slicer result with G-code and metadata
 */
export interface SlicerResult {
  /** Generated G-code string */
  gcode: string;

  /** Slicing metadata */
  metadata: {
    /** Estimated print time in seconds */
    printTime?: number;

    /** Estimated filament used in mm */
    filamentUsed?: number;

    /** Number of layers */
    layerCount?: number;

    /** Slicing time in milliseconds */
    slicingTime?: number;

    /** Input STL size in bytes */
    stlSize?: number;

    /** Output G-code size in bytes */
    gcodeSize?: number;
  };
}

/**
 * Slicer profile presets
 */
export interface SlicerProfile {
  /** Profile name */
  name: string;

  /** Profile description */
  description: string;

  /** Material type */
  material: 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'Nylon' | 'PC';

  /** Quality preset */
  quality: 'draft' | 'normal' | 'fine' | 'ultra-fine';

  /** Printer preset (optional) */
  printer?: 'prusa-mk4' | 'bambu-x1c' | 'ender-3' | 'custom';

  /** Cura settings */
  settings: CuraSettings;
}

/**
 * Pre-configured slicer profiles
 */
export const SLICER_PROFILES: Record<string, SlicerProfile> = {
  'pla-standard': {
    name: 'PLA Standard',
    description: 'General purpose PLA printing (0.2mm, 20% infill, 60mm/s)',
    material: 'PLA',
    quality: 'normal',
    settings: {
      layerHeight: 0.2,
      wallLineCount: 3,
      infillDensity: 20,
      infillPattern: 'grid',
      printSpeed: 60,
      nozzleTemp: 210,
      bedTemp: 60,
      supportEnabled: false,
      retractionEnabled: true,
      retractionDistance: 5,
      nozzleSize: 0.4
    }
  },

  'pla-draft': {
    name: 'PLA Draft',
    description: 'Fast PLA printing (0.3mm, 15% infill, 80mm/s)',
    material: 'PLA',
    quality: 'draft',
    settings: {
      layerHeight: 0.3,
      wallLineCount: 2,
      infillDensity: 15,
      infillPattern: 'lines',
      printSpeed: 80,
      nozzleTemp: 215,
      bedTemp: 60,
      supportEnabled: false,
      retractionEnabled: true,
      retractionDistance: 5,
      nozzleSize: 0.4
    }
  },

  'pla-fine': {
    name: 'PLA Fine Detail',
    description: 'High quality PLA (0.12mm, 25% infill, 45mm/s)',
    material: 'PLA',
    quality: 'fine',
    settings: {
      layerHeight: 0.12,
      wallLineCount: 4,
      infillDensity: 25,
      infillPattern: 'cubic',
      printSpeed: 45,
      nozzleTemp: 205,
      bedTemp: 60,
      supportEnabled: false,
      retractionEnabled: true,
      retractionDistance: 5,
      nozzleSize: 0.4
    }
  },

  'petg-standard': {
    name: 'PETG Standard',
    description: 'General purpose PETG (0.2mm, 25% infill, 50mm/s)',
    material: 'PETG',
    quality: 'normal',
    settings: {
      layerHeight: 0.2,
      wallLineCount: 3,
      infillDensity: 25,
      infillPattern: 'grid',
      printSpeed: 50,
      nozzleTemp: 240,
      bedTemp: 80,
      supportEnabled: false,
      retractionEnabled: true,
      retractionDistance: 6,
      retractionSpeed: 40,
      nozzleSize: 0.4
    }
  },

  'abs-engineering': {
    name: 'ABS Engineering',
    description: 'Strong ABS parts (0.2mm, 30% infill, 50mm/s)',
    material: 'ABS',
    quality: 'normal',
    settings: {
      layerHeight: 0.2,
      wallLineCount: 4,
      infillDensity: 30,
      infillPattern: 'gyroid',
      printSpeed: 50,
      nozzleTemp: 250,
      bedTemp: 100,
      supportEnabled: false,
      retractionEnabled: true,
      retractionDistance: 5,
      nozzleSize: 0.4
    }
  },

  'tpu-flexible': {
    name: 'TPU Flexible',
    description: 'Flexible TPU printing (0.2mm, 10% infill, 25mm/s)',
    material: 'TPU',
    quality: 'normal',
    settings: {
      layerHeight: 0.2,
      wallLineCount: 3,
      infillDensity: 10,
      infillPattern: 'concentric',
      printSpeed: 25,
      nozzleTemp: 220,
      bedTemp: 60,
      supportEnabled: false,
      retractionEnabled: false, // Flexible filament - no retraction
      nozzleSize: 0.4
    }
  },

  'vase-mode': {
    name: 'Vase Mode (Spiralize)',
    description: 'Single-wall vase mode (0.2mm, spiral)',
    material: 'PLA',
    quality: 'normal',
    settings: {
      layerHeight: 0.2,
      wallLineCount: 1,
      infillDensity: 0,
      printSpeed: 60,
      nozzleTemp: 210,
      bedTemp: 60,
      spiralize: true,
      supportEnabled: false,
      retractionEnabled: false,
      nozzleSize: 0.4
    }
  }
};
