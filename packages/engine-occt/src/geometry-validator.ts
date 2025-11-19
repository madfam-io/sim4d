/**
 * Geometry validation for production integrity
 * Ensures all geometry operations produce valid results
 */

import { getConfig } from '@brepflow/engine-core';

export class GeometryValidator {
  private enabled: boolean;

  constructor() {
    this.enabled = getConfig().validateGeometryOutput;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generic validation method
   */
  async validate(result: unknown): Promise<{ valid: boolean; errors: string[] }> {
    if (!this.enabled) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];

    try {
      // Validate based on result type
      if (result?.type === 'shape' || result?.id) {
        this.validateShape(result, 'shape');
      } else if (result?.positions && result?.indices) {
        this.validateMesh(result);
      } else if (
        typeof result === 'string' &&
        (result.includes('STEP') || result.includes('IGES'))
      ) {
        // Likely an export result
        const format = result.includes('STEP') ? 'STEP' : 'IGES';
        this.validateExport(result, format.toLowerCase());
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Validation failed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate shape handle integrity
   */
  validateShape(shape: unknown, type: string): void {
    if (!this.enabled) return;

    // Check required fields
    if (!shape.id) {
      throw new Error(`Invalid ${type}: missing shape ID`);
    }

    if (!shape.type || !['solid', 'surface', 'curve'].includes(shape.type)) {
      throw new Error(`Invalid ${type}: unknown shape type ${shape.type}`);
    }

    // Validate bounding box
    if (!this.isValidBBox(shape)) {
      throw new Error(`Invalid ${type}: malformed bounding box`);
    }

    // Check for NaN or Infinity
    const bbox = [
      shape.bbox_min_x,
      shape.bbox_min_y,
      shape.bbox_min_z,
      shape.bbox_max_x,
      shape.bbox_max_y,
      shape.bbox_max_z,
    ];

    if (bbox.some((v) => !isFinite(v))) {
      throw new Error(`Invalid ${type}: bounding box contains NaN or Infinity`);
    }

    // Validate bounding box logic
    if (
      shape.bbox_min_x > shape.bbox_max_x ||
      shape.bbox_min_y > shape.bbox_max_y ||
      shape.bbox_min_z > shape.bbox_max_z
    ) {
      throw new Error(`Invalid ${type}: inverted bounding box`);
    }

    // Check for degenerate shapes
    const volume =
      (shape.bbox_max_x - shape.bbox_min_x) *
      (shape.bbox_max_y - shape.bbox_min_y) *
      (shape.bbox_max_z - shape.bbox_min_z);

    if (volume < 1e-10) {
      logger.warn(`Warning: ${type} has near-zero volume (${volume})`);
    }
  }

  /**
   * Validate boolean operation result
   */
  validateBooleanResult(result: unknown, operation: string): void {
    if (!this.enabled) return;

    this.validateShape(result, `boolean-${operation}`);

    // Additional boolean-specific checks
    if (operation === 'intersect') {
      // Intersection should not increase bounding box
      // (This is a simplified check, actual validation would be more complex)
      const volume =
        (result.bbox_max_x - result.bbox_min_x) *
        (result.bbox_max_y - result.bbox_min_y) *
        (result.bbox_max_z - result.bbox_min_z);

      if (volume < 1e-10) {
        logger.warn('Warning: Boolean intersection resulted in near-empty shape');
      }
    }
  }

  /**
   * Validate mesh data
   */
  validateMesh(mesh: any): void {
    if (!this.enabled) return;

    if (!mesh.positions || !mesh.normals || !mesh.indices) {
      throw new Error('Invalid mesh: missing required arrays');
    }

    const positionCount = mesh.positions.length;
    const normalCount = mesh.normals.length;
    const indexCount = mesh.indices.length;

    // Positions and normals should match
    if (positionCount !== normalCount) {
      throw new Error(
        `Invalid mesh: position/normal count mismatch (${positionCount} vs ${normalCount})`
      );
    }

    // Should have 3 components per vertex
    if (positionCount % 3 !== 0) {
      throw new Error(`Invalid mesh: position array length not divisible by 3 (${positionCount})`);
    }

    // Indices should be divisible by 3 (triangles)
    if (indexCount % 3 !== 0) {
      throw new Error(`Invalid mesh: index array length not divisible by 3 (${indexCount})`);
    }

    const vertexCount = positionCount / 3;

    // Validate index bounds
    for (let i = 0; i < indexCount; i++) {
      const index = mesh.indices[i];
      if (index < 0 || index >= vertexCount) {
        throw new Error(`Invalid mesh: index ${index} out of bounds (0-${vertexCount - 1})`);
      }
    }

    // Check for NaN or Infinity in positions
    for (let i = 0; i < positionCount; i++) {
      if (!isFinite(mesh.positions[i])) {
        throw new Error(`Invalid mesh: position contains NaN or Infinity at index ${i}`);
      }
    }

    // Check for NaN in normals
    for (let i = 0; i < normalCount; i++) {
      if (!isFinite(mesh.normals[i])) {
        throw new Error(`Invalid mesh: normal contains NaN or Infinity at index ${i}`);
      }
    }

    // Validate normal vectors are normalized (within tolerance)
    for (let i = 0; i < vertexCount; i++) {
      const nx = mesh.normals[i * 3];
      const ny = mesh.normals[i * 3 + 1];
      const nz = mesh.normals[i * 3 + 2];
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

      if (Math.abs(length - 1.0) > 0.01) {
        logger.warn(`Warning: Normal vector ${i} not normalized (length=${length})`);
      }
    }

    // Check for degenerate triangles
    let degenerateCount = 0;
    for (let i = 0; i < indexCount; i += 3) {
      const i0 = mesh.indices[i];
      const i1 = mesh.indices[i + 1];
      const i2 = mesh.indices[i + 2];

      if (i0 === i1 || i1 === i2 || i0 === i2) {
        degenerateCount++;
      }
    }

    if (degenerateCount > 0) {
      logger.warn(`Warning: Mesh contains ${degenerateCount} degenerate triangles`);
    }
  }

  /**
   * Validate export data - returns validation result
   */
  async validateExport(data: unknown, format: string): Promise<{ valid: boolean; message?: string }> {
    try {
      this.validateExportInternal(data, format);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : 'Export validation failed',
      };
    }
  }

  /**
   * Internal export validation (throws on error)
   */
  private validateExportInternal(data: unknown, format: string): void {
    if (!getConfig().enableExportValidation) return;

    switch (format) {
      case 'step':
      case 'iges':
        this.validateCADExport(data, format);
        break;
      case 'stl':
        this.validateSTLExport(data);
        break;
      case 'obj':
        this.validateOBJExport(data);
        break;
      default:
        logger.warn(`No validation available for format: ${format}`);
    }
  }

  private validateCADExport(data: unknown, format: string): void {
    // Check for required headers
    if (format === 'step') {
      if (!data.includes('ISO-10303-21')) {
        throw new Error('Invalid STEP file: missing header');
      }
      if (!data.includes('FILE_SCHEMA')) {
        throw new Error('Invalid STEP file: missing schema declaration');
      }
    } else if (format === 'iges') {
      if (
        !data.startsWith(
          '                                                                        S      1'
        )
      ) {
        throw new Error('Invalid IGES file: incorrect start section');
      }
    }

    // Check for reasonable file size
    const sizeKB = new Blob([data]).size / 1024;
    const maxSizeMB = getConfig().maxExportSizeMB;

    if (sizeKB > maxSizeMB * 1024) {
      throw new Error(`Export file too large: ${sizeKB.toFixed(2)}KB exceeds ${maxSizeMB}MB limit`);
    }

    // Check for content
    if (data.length < 100) {
      throw new Error(`Export file suspiciously small: ${data.length} bytes`);
    }
  }

  private validateSTLExport(data: unknown): void {
    // Check for ASCII STL format
    if (typeof data === 'string') {
      if (!data.includes('solid') || !data.includes('facet normal')) {
        throw new Error('Invalid STL file: missing required keywords');
      }
    } else {
      // Binary STL
      if (data.byteLength < 84) {
        // Header (80) + triangle count (4)
        throw new Error('Invalid binary STL: file too small');
      }
    }
  }

  private validateOBJExport(data: string): void {
    if (!data.includes('v ') || !data.includes('f ')) {
      throw new Error('Invalid OBJ file: missing vertices or faces');
    }
  }

  private isValidBBox(shape: unknown): boolean {
    return (
      typeof shape.bbox_min_x === 'number' &&
      typeof shape.bbox_min_y === 'number' &&
      typeof shape.bbox_min_z === 'number' &&
      typeof shape.bbox_max_x === 'number' &&
      typeof shape.bbox_max_y === 'number' &&
      typeof shape.bbox_max_z === 'number'
    );
  }
}
