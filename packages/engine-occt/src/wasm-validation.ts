/**
 * WASM Validation Module
 * Ensures OCCT WASM compilation completeness and runtime integration
 * Long-term stable solution for production deployment
 */

import { WASMLoader, type WASMCapabilities } from './wasm-loader';
import type { OCCTModule, MeshData } from './occt-bindings';

export interface WASMValidationResult {
  compiled: boolean;
  loaded: boolean;
  functional: boolean;
  performance: {
    loadTime: number;
    operationTime: number;
    memoryUsage: number;
  };
  capabilities: WASMCapabilities;
  errors: string[];
}

export class WASMValidator {
  private static instance: WASMValidator | null = null;
  private loader: WASMLoader;
  private module: OCCTModule | null = null;

  private constructor() {
    this.loader = WASMLoader.getInstance();
  }

  static getInstance(): WASMValidator {
    if (!this.instance) {
      this.instance = new WASMValidator();
    }
    return this.instance;
  }

  /**
   * Comprehensive validation of WASM compilation and integration
   */
  async validate(): Promise<WASMValidationResult> {
    const result: WASMValidationResult = {
      compiled: false,
      loaded: false,
      functional: false,
      performance: {
        loadTime: 0,
        operationTime: 0,
        memoryUsage: 0,
      },
      capabilities: await this.loader.detectCapabilities(),
      errors: [],
    };

    // Step 1: Verify WASM compilation artifacts exist
    const compilationStatus = await this.validateCompilation();
    result.compiled = compilationStatus.success;
    if (!compilationStatus.success) {
      result.errors.push(...compilationStatus.errors);
      return result;
    }

    // Step 2: Attempt to load WASM module
    const loadStart = performance.now();
    const loadStatus = await this.validateLoading();
    result.performance.loadTime = performance.now() - loadStart;
    result.loaded = loadStatus.success;
    if (!loadStatus.success) {
      result.errors.push(...loadStatus.errors);
      return result;
    }

    // Step 3: Validate functional operations
    const operationStart = performance.now();
    const functionalStatus = await this.validateFunctionality();
    result.performance.operationTime = performance.now() - operationStart;
    result.functional = functionalStatus.success;
    if (!functionalStatus.success) {
      result.errors.push(...functionalStatus.errors);
    }

    // Step 4: Measure memory usage
    result.performance.memoryUsage = await this.measureMemoryUsage();

    return result;
  }

  /**
   * Verify WASM compilation artifacts
   */
  private async validateCompilation(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check for WASM files
      const wasmFiles = ['/wasm/occt.wasm', '/wasm/occt.js', '/wasm/occt_geometry.wasm'];

      for (const file of wasmFiles) {
        try {
          const url = new URL(file, window.location.origin);
          const response = await fetch(url.href, { method: 'HEAD' });

          if (!response.ok) {
            errors.push(`WASM file not found: ${file}`);
          } else {
            const size = response.headers.get('content-length');
            if (size && parseInt(size) < 1000) {
              errors.push(`WASM file too small: ${file} (${size} bytes)`);
            }
          }
        } catch (e) {
          errors.push(`Failed to verify ${file}: ${e}`);
        }
      }

      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Compilation validation failed: ${error}`],
      };
    }
  }

  /**
   * Validate WASM module loading
   */
  private async validateLoading(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Use existing loader infrastructure
      const config = this.loader.generateOCCTConfig(
        this.loader['capabilities'] || (await this.loader.detectCapabilities())
      );

      // Attempt to load the module
      this.module = await this.loader.loadModule(config);

      if (!this.module) {
        errors.push('WASM module failed to load');
        return { success: false, errors };
      }

      // Verify module structure
      const requiredFunctions = [
        'makeBox',
        'makeSphere',
        'makeCylinder',
        'performUnion',
        'performSubtract',
        'performIntersect',
        'deleteShape',
        'tessellate',
      ];

      for (const func of requiredFunctions) {
        if (typeof (this.module as any)[func] !== 'function') {
          errors.push(`Required function missing: ${func}`);
        }
      }

      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Loading validation failed: ${error}`],
      };
    }
  }

  /**
   * Validate functional operations
   */
  private async validateFunctionality(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!this.module) {
      return {
        success: false,
        errors: ['Module not loaded'],
      };
    }

    try {
      // Test 1: Create primitives
      const box = this.module.makeBox(10, 10, 10);
      if (!box || !box.id) {
        errors.push('Failed to create box primitive');
      }

      const sphere = this.module.makeSphere(5);
      if (!sphere || !sphere.id) {
        errors.push('Failed to create sphere primitive');
      }

      // Test 2: Boolean operation
      if (box && sphere) {
        const union = this.module.booleanUnion(box.id, sphere.id);
        if (!union || !union.id) {
          errors.push('Failed to perform boolean union');
        }

        // Test 3: Tessellation
        if (union) {
          const mesh = this.module.tessellate(union.id, 0.1) as MeshData;
          if (!mesh || !mesh.positions || mesh.positions.length === 0) {
            errors.push('Failed to tessellate geometry');
          }
        }

        // Cleanup
        this.module.deleteShape(union.id);
      }

      // Cleanup
      if (box) this.module.deleteShape(box.id);
      if (sphere) this.module.deleteShape(sphere.id);

      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Functionality validation failed: ${error}`],
      };
    }
  }

  /**
   * Measure memory usage
   */
  private async measureMemoryUsage(): Promise<number> {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / (1024 * 1024)); // MB
    }
    return 0;
  }

  /**
   * Generate validation report
   */
  generateReport(result: WASMValidationResult): string {
    const sections = [];

    sections.push('=== WASM COMPILATION COMPLETENESS VALIDATION ===\n');

    // Compilation Status
    sections.push(`1. COMPILATION STATUS: ${result.compiled ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    if (!result.compiled) {
      sections.push('   Issues:');
      result.errors.forEach((error) => sections.push(`   - ${error}`));
    }

    // Loading Status
    sections.push(`\n2. MODULE LOADING: ${result.loaded ? '✅ SUCCESS' : '❌ FAILED'}`);
    sections.push(`   Load Time: ${result.performance.loadTime.toFixed(2)}ms`);

    // Functionality Status
    sections.push(
      `\n3. FUNCTIONALITY: ${result.functional ? '✅ OPERATIONAL' : '❌ NON-FUNCTIONAL'}`
    );
    sections.push(`   Operation Time: ${result.performance.operationTime.toFixed(2)}ms`);

    // Performance Metrics
    sections.push('\n4. PERFORMANCE METRICS:');
    sections.push(`   Memory Usage: ${result.performance.memoryUsage}MB`);
    sections.push(`   Threading: ${result.capabilities.hasThreads ? '✅ Enabled' : '❌ Disabled'}`);
    sections.push(
      `   SharedArrayBuffer: ${result.capabilities.hasSharedArrayBuffer ? '✅ Available' : '❌ Unavailable'}`
    );

    // Capabilities
    sections.push('\n5. BROWSER CAPABILITIES:');
    sections.push(`   WASM Support: ${result.capabilities.hasWASM ? '✅' : '❌'}`);
    sections.push(`   COOP Headers: ${result.capabilities.hasCOOP ? '✅' : '❌'}`);
    sections.push(`   COEP Headers: ${result.capabilities.hasCOEP ? '✅' : '❌'}`);
    sections.push(`   Memory Limit: ${result.capabilities.memoryLimit}MB`);
    sections.push(`   CPU Threads: ${result.capabilities.threadCount}`);

    // Overall Assessment
    sections.push('\n6. OVERALL ASSESSMENT:');
    if (result.compiled && result.loaded && result.functional) {
      sections.push('   🎉 WASM COMPILATION COMPLETE AND OPERATIONAL');
      sections.push('   ✅ Ready for production deployment');
    } else {
      sections.push('   ⚠️  WASM COMPILATION INCOMPLETE');
      sections.push('   Required actions:');
      if (!result.compiled) sections.push('   - Run build:wasm script to compile OCCT');
      if (!result.loaded) sections.push('   - Fix module loading issues');
      if (!result.functional) sections.push('   - Debug geometry operation failures');
    }

    return sections.join('\n');
  }

  /**
   * Get loaded module for operations
   */
  getModule(): OCCTModule | null {
    return this.module;
  }
}

// Export validation utilities
export async function validateWASMCompilation(): Promise<WASMValidationResult> {
  const validator = WASMValidator.getInstance();
  return validator.validate();
}

export async function getWASMValidationReport(): Promise<string> {
  const validator = WASMValidator.getInstance();
  const result = await validator.validate();
  return validator.generateReport(result);
}

export function getValidatedModule(): OCCTModule | null {
  return WASMValidator.getInstance().getModule();
}
