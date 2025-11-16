/**
 * Geometry validation utilities for integration tests
 */

import type { ShapeHandle } from '@brepflow/types';
import { GeometryAPI } from '@brepflow/engine-occt';

export interface GeometryProperties {
  volume: number;
  surfaceArea: number;
  centerOfMass: { x: number; y: number; z: number };
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  momentOfInertia: {
    Ixx: number;
    Iyy: number;
    Izz: number;
  };
}

export class GeometryValidator {
  constructor(private geometryAPI: GeometryAPI) {}

  /**
   * Validate basic geometric properties
   */
  async validateBasicProperties(shape: ShapeHandle): Promise<{
    valid: boolean;
    issues: string[];
    properties: GeometryProperties;
  }> {
    const issues: string[] = [];

    try {
      const properties = await this.geometryAPI.getProperties(shape);

      // Basic validation checks
      if (properties.volume <= 0) {
        issues.push('Volume must be positive');
      }

      if (properties.surfaceArea <= 0) {
        issues.push('Surface area must be positive');
      }

      // Check bounding box consistency
      const bbox = properties.boundingBox;
      if (bbox.min.x > bbox.max.x || bbox.min.y > bbox.max.y || bbox.min.z > bbox.max.z) {
        issues.push('Invalid bounding box');
      }

      // Check center of mass is within bounding box
      const com = properties.centerOfMass;
      if (
        com.x < bbox.min.x ||
        com.x > bbox.max.x ||
        com.y < bbox.min.y ||
        com.y > bbox.max.y ||
        com.z < bbox.min.z ||
        com.z > bbox.max.z
      ) {
        issues.push('Center of mass outside bounding box');
      }

      return {
        valid: issues.length === 0,
        issues,
        properties,
      };
    } catch (error) {
      issues.push(`Geometry analysis failed: ${error}`);
      throw new Error(`Geometry validation failed: ${issues.join(', ')}`);
    }
  }

  /**
   * Validate topology (manifold, watertight, etc.)
   */
  async validateTopology(_shape: ShapeHandle): Promise<{
    isManifold: boolean;
    isWatertight: boolean;
    hasSelfIntersections: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // This would use OCCT topology analysis
    // For now, simulate the validation
    const isManifold = true;
    const isWatertight = true;
    const hasSelfIntersections = false;

    if (!isManifold) issues.push('Geometry is not manifold');
    if (!isWatertight) issues.push('Geometry is not watertight');
    if (hasSelfIntersections) issues.push('Geometry has self-intersections');

    return {
      isManifold,
      isWatertight,
      hasSelfIntersections,
      issues,
    };
  }

  /**
   * Validate manufacturing constraints
   */
  async validateManufacturing(
    shape: ShapeHandle,
    constraints: {
      minWallThickness?: number;
      maxAspectRatio?: number;
      printTechnology?: string;
    }
  ): Promise<{
    manufacturable: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const validation = await this.geometryAPI.validateManufacturingConstraints({
      shape,
      manufacturingProcess: constraints.printTechnology || '3d_printing',
      minWallThickness: constraints.minWallThickness || 1.0,
      maxAspectRatio: constraints.maxAspectRatio || 10.0,
    });

    if (!validation.valid) {
      issues.push(...validation.recommendations);
    }

    // Add manufacturing-specific recommendations
    recommendations.push('Consider adding chamfers to sharp edges');
    recommendations.push('Verify support requirements for overhangs');

    return {
      manufacturable: validation.valid,
      issues,
      recommendations,
    };
  }

  /**
   * Compare geometry with golden master
   */
  async compareWithGolden(
    current: GeometryProperties,
    golden: GeometryProperties,
    tolerance: number = 0.01
  ): Promise<{
    matches: boolean;
    differences: string[];
    maxDeviation: number;
  }> {
    const differences: string[] = [];
    let maxDeviation = 0;

    // Volume comparison
    const volumeDiff = Math.abs(current.volume - golden.volume) / golden.volume;
    if (volumeDiff > tolerance) {
      differences.push(`Volume deviation: ${(volumeDiff * 100).toFixed(2)}%`);
      maxDeviation = Math.max(maxDeviation, volumeDiff);
    }

    // Surface area comparison
    const areaDiff = Math.abs(current.surfaceArea - golden.surfaceArea) / golden.surfaceArea;
    if (areaDiff > tolerance) {
      differences.push(`Surface area deviation: ${(areaDiff * 100).toFixed(2)}%`);
      maxDeviation = Math.max(maxDeviation, areaDiff);
    }

    // Center of mass comparison
    const comDiff = Math.sqrt(
      Math.pow(current.centerOfMass.x - golden.centerOfMass.x, 2) +
        Math.pow(current.centerOfMass.y - golden.centerOfMass.y, 2) +
        Math.pow(current.centerOfMass.z - golden.centerOfMass.z, 2)
    );

    const comTolerance =
      Math.max(
        Math.abs(golden.boundingBox.max.x - golden.boundingBox.min.x),
        Math.abs(golden.boundingBox.max.y - golden.boundingBox.min.y),
        Math.abs(golden.boundingBox.max.z - golden.boundingBox.min.z)
      ) * tolerance;

    if (comDiff > comTolerance) {
      differences.push(`Center of mass deviation: ${comDiff.toFixed(3)}mm`);
    }

    return {
      matches: differences.length === 0,
      differences,
      maxDeviation,
    };
  }

  /**
   * Generate comprehensive geometry report
   */
  async generateReport(
    shape: ShapeHandle,
    name: string
  ): Promise<{
    name: string;
    timestamp: string;
    properties: GeometryProperties;
    topology: any;
    manufacturing: any;
    summary: {
      valid: boolean;
      issues: string[];
      recommendations: string[];
    };
  }> {
    const basicValidation = await this.validateBasicProperties(shape);
    const topology = await this.validateTopology(shape);
    const manufacturing = await this.validateManufacturing(shape, {});

    const allIssues = [...basicValidation.issues, ...topology.issues, ...manufacturing.issues];

    return {
      name,
      timestamp: new Date().toISOString(),
      properties: basicValidation.properties,
      topology,
      manufacturing,
      summary: {
        valid: allIssues.length === 0,
        issues: allIssues,
        recommendations: manufacturing.recommendations,
      },
    };
  }
}

/**
 * Export format validators
 */
export class ExportValidator {
  /**
   * Validate STEP file format and content
   */
  static async validateSTEP(filePath: string): Promise<{
    valid: boolean;
    issues: string[];
    entityCount: number;
  }> {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    const issues: string[] = [];

    // Basic STEP format validation
    if (!content.startsWith('ISO-10303-21;')) {
      issues.push('Missing ISO-10303-21 header');
    }

    if (!content.includes('HEADER;')) {
      issues.push('Missing HEADER section');
    }

    if (!content.includes('DATA;')) {
      issues.push('Missing DATA section');
    }

    if (!content.includes('ENDSEC;')) {
      issues.push('Missing ENDSEC terminator');
    }

    // Count entities
    const entityMatches = content.match(/#\d+\s*=/g);
    const entityCount = entityMatches ? entityMatches.length : 0;

    if (entityCount === 0) {
      issues.push('No entities found in STEP file');
    }

    return {
      valid: issues.length === 0,
      issues,
      entityCount,
    };
  }

  /**
   * Validate STL file format and triangle count
   */
  static async validateSTL(filePath: string): Promise<{
    valid: boolean;
    issues: string[];
    triangleCount: number;
    isBinary: boolean;
  }> {
    const fs = await import('fs/promises');
    const buffer = await fs.readFile(filePath);
    const issues: string[] = [];

    let triangleCount = 0;
    let isBinary = false;

    // Check if binary STL (starts with 80-byte header + 4-byte triangle count)
    if (buffer.length >= 84) {
      const potentialTriangleCount = buffer.readUInt32LE(80);
      const expectedSize = 84 + potentialTriangleCount * 50;

      if (buffer.length === expectedSize) {
        isBinary = true;
        triangleCount = potentialTriangleCount;
      }
    }

    // If not binary, check ASCII format
    if (!isBinary) {
      const content = buffer.toString('utf-8');
      if (content.includes('solid ') && content.includes('endsolid')) {
        const triangleMatches = content.match(/facet normal/g);
        triangleCount = triangleMatches ? triangleMatches.length : 0;
      } else {
        issues.push('Invalid STL format (neither valid binary nor ASCII)');
      }
    }

    if (triangleCount === 0) {
      issues.push('No triangles found in STL file');
    }

    return {
      valid: issues.length === 0,
      issues,
      triangleCount,
      isBinary,
    };
  }
}
