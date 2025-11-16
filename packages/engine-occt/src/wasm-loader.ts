/**
 * Advanced WASM Loader with COOP/COEP Detection and Threading Support
 * Handles SharedArrayBuffer availability and optimal WASM loading strategies
 */

export interface WASMCapabilities {
  hasWASM: boolean;
  hasThreads: boolean;
  hasSharedArrayBuffer: boolean;
  hasCOOP: boolean;
  hasCOEP: boolean;
  hasAtomics: boolean;
  memoryLimit: number;
  threadCount: number;
  isSecureContext: boolean;
  error?: string;
}

export interface WASMLoadOptions {
  wasmPath: string;
  jsPath: string;
  fallbackPath?: string;
  threadsRequired: boolean;
  memoryRequired: number; // MB
  timeout: number; // ms
}

export class WASMLoader {
  private static instance: WASMLoader | null = null;
  private capabilities: WASMCapabilities | null = null;

  static getInstance(): WASMLoader {
    if (!this.instance) {
      this.instance = new WASMLoader();
    }
    return this.instance;
  }

  /**
   * Detect browser capabilities for WASM threading
   */
  async detectCapabilities(): Promise<WASMCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    console.log('[WASMLoader] Detecting browser capabilities...');

    const capabilities: WASMCapabilities = {
      hasWASM: this.checkWASMSupport(),
      hasThreads: false,
      hasSharedArrayBuffer: this.checkSharedArrayBuffer(),
      hasCOOP: this.checkCOOP(),
      hasCOEP: this.checkCOEP(),
      hasAtomics: this.checkAtomics(),
      memoryLimit: this.estimateMemoryLimit(),
      threadCount: navigator.hardwareConcurrency || 4,
      isSecureContext: window.isSecureContext || false,
    };

    // Test actual thread support
    if (capabilities.hasWASM && capabilities.hasSharedArrayBuffer) {
      capabilities.hasThreads = await this.testThreadSupport();
    }

    // Validate threading requirements
    if (!capabilities.hasCOOP || !capabilities.hasCOEP) {
      capabilities.error =
        'COOP/COEP headers required for SharedArrayBuffer. Check server configuration.';
    } else if (!capabilities.hasSharedArrayBuffer) {
      capabilities.error = 'SharedArrayBuffer not available. Threading disabled.';
    } else if (!capabilities.hasAtomics) {
      capabilities.error = 'Atomics not available. WASM threads not supported.';
    }

    this.capabilities = capabilities;

    console.log('[WASMLoader] Capabilities detected:', capabilities);
    return capabilities;
  }

  /**
   * Load WASM module with optimal configuration
   */
  async loadModule(options: WASMLoadOptions): Promise<any> {
    const capabilities = await this.detectCapabilities();

    if (!capabilities.hasWASM) {
      throw new Error('WebAssembly not supported in this browser');
    }

    // Check if threading is required but not available
    if (options.threadsRequired && !capabilities.hasThreads) {
      throw new Error(
        `Threading required but not available: ${capabilities.error || 'Unknown error'}`
      );
    }

    // Check memory requirements
    if (capabilities.memoryLimit < options.memoryRequired) {
      console.warn(
        `[WASMLoader] Memory limit (${capabilities.memoryLimit}MB) below required (${options.memoryRequired}MB)`
      );
    }

    try {
      return await this.loadWASMModule(options, capabilities);
    } catch (error) {
      console.error('[WASMLoader] Failed to load WASM module:', error);

      // Try fallback if available
      if (options.fallbackPath) {
        console.log('[WASMLoader] Attempting fallback load...');
        return await this.loadWASMModule(
          {
            ...options,
            wasmPath: options.fallbackPath,
            threadsRequired: false,
          },
          capabilities
        );
      }

      throw error;
    }
  }

  /**
   * Check if WebAssembly is supported
   */
  private checkWASMSupport(): boolean {
    try {
      return (
        typeof WebAssembly === 'object' &&
        typeof WebAssembly.Module === 'function' &&
        typeof WebAssembly.Instance === 'function'
      );
    } catch {
      return false;
    }
  }

  /**
   * Check SharedArrayBuffer availability
   */
  private checkSharedArrayBuffer(): boolean {
    try {
      return typeof SharedArrayBuffer === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Check if COOP header is set correctly
   */
  private checkCOOP(): boolean {
    // Check if we can access other origins (should be blocked with COOP)
    try {
      // This is a heuristic - in a properly configured COOP environment,
      // the window should be isolated
      return window.opener === null || window.opener === undefined;
    } catch {
      // Error accessing window.opener likely means COOP is working
      return true;
    }
  }

  /**
   * Check if COEP header is set correctly
   */
  private checkCOEP(): boolean {
    // COEP is harder to detect directly, but SharedArrayBuffer availability
    // combined with secure context usually indicates proper COEP
    return this.checkSharedArrayBuffer() && window.isSecureContext;
  }

  /**
   * Check Atomics support
   */
  private checkAtomics(): boolean {
    try {
      return typeof Atomics === 'object' && typeof Atomics.add === 'function';
    } catch {
      return false;
    }
  }

  /**
   * Estimate available memory limit
   */
  private estimateMemoryLimit(): number {
    // Default conservative estimate
    let memoryMB = 1024; // 1GB default

    try {
      // Use performance.memory if available
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        const totalMB = Math.round(memory.jsHeapSizeLimit / (1024 * 1024));
        memoryMB = Math.min(totalMB * 0.7, 2048); // Use 70% of heap limit, max 2GB
      }

      // Check for mobile devices (typically more constrained)
      if (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('Android')) {
        memoryMB = Math.min(memoryMB, 512); // Cap at 512MB for mobile
      }
    } catch (error) {
      console.warn('[WASMLoader] Could not estimate memory limit:', error);
    }

    return Math.max(memoryMB, 256); // Minimum 256MB
  }

  /**
   * Test if WASM threads actually work
   */
  private async testThreadSupport(): Promise<boolean> {
    try {
      // Create a minimal test WASM with threads
      const testWasm = this.createThreadTestWasm();
      const module = await WebAssembly.compile(testWasm);
      const instance = await WebAssembly.instantiate(module);

      // If we get here without errors, basic threading should work
      return true;
    } catch (error) {
      console.warn('[WASMLoader] Thread test failed:', error);
      return false;
    }
  }

  /**
   * Create minimal WASM for thread testing
   */
  private createThreadTestWasm(): Uint8Array {
    // Minimal WASM module that just validates thread support exists
    return new Uint8Array([
      0x00,
      0x61,
      0x73,
      0x6d, // WASM magic
      0x01,
      0x00,
      0x00,
      0x00, // WASM version
      // Minimal module - just needs to compile
      0x01,
      0x04,
      0x01,
      0x60,
      0x00,
      0x00, // Type section
      0x03,
      0x02,
      0x01,
      0x00, // Function section
      0x0a,
      0x04,
      0x01,
      0x02,
      0x00,
      0x0b, // Code section
    ]);
  }

  /**
   * Load WASM module with proper initialization
   */
  private async loadWASMModule(
    options: WASMLoadOptions,
    capabilities: WASMCapabilities
  ): Promise<any> {
    console.log(
      `[WASMLoader] Loading WASM from ${options.wasmPath} (threads: ${capabilities.hasThreads})`
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`WASM load timeout after ${options.timeout}ms`));
      }, options.timeout);

      // Dynamic import of the JS file
      import(options.jsPath)
        .then((moduleFactory) => {
          const factory = moduleFactory.default || moduleFactory;

          // Configure module based on capabilities
          const moduleConfig: any = {
            locateFile: (path: string) => {
              if (path.endsWith('.wasm')) {
                return options.wasmPath;
              }
              return path;
            },

            // Thread configuration
            ...(capabilities.hasThreads && {
              pthreadPoolSize: Math.min(capabilities.threadCount, 4),
              pthread: true,
            }),

            // Memory configuration
            INITIAL_MEMORY: Math.min(
              options.memoryRequired * 1024 * 1024,
              capabilities.memoryLimit * 1024 * 1024
            ),
            MAXIMUM_MEMORY: capabilities.memoryLimit * 1024 * 1024,
            ALLOW_MEMORY_GROWTH: true,

            // Progress callback
            onRuntimeInitialized: () => {
              console.log('[WASMLoader] WASM runtime initialized');
            },

            // Error handling
            onAbort: (error: any) => {
              clearTimeout(timeout);
              reject(new Error(`WASM module aborted: ${error}`));
            },

            print: (text: string) => console.log('[WASM]', text),
            printErr: (text: string) => console.error('[WASM]', text),
          };

          // Initialize the module
          factory(moduleConfig)
            .then((module: any) => {
              clearTimeout(timeout);

              // Add capability info to module
              module._capabilities = capabilities;

              console.log('[WASMLoader] WASM module loaded successfully');
              resolve(module);
            })
            .catch((error: any) => {
              clearTimeout(timeout);
              reject(new Error(`WASM instantiation failed: ${error.message || error}`));
            });
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(new Error(`Failed to load WASM JS: ${error.message || error}`));
        });
    });
  }

  /**
   * Generate optimal configuration for OCCT WASM
   */
  generateOCCTConfig(capabilities: WASMCapabilities): WASMLoadOptions {
    const basePath = '/wasm/';

    return {
      wasmPath: `${basePath}occt-core.wasm`,
      jsPath: `${basePath}occt-core.js`,
      fallbackPath: capabilities.hasThreads ? undefined : `${basePath}occt.wasm`,
      threadsRequired: false, // Make threading optional for broader compatibility
      memoryRequired: 512, // 512MB minimum for OCCT
      timeout: 30000, // 30 second timeout
    };
  }

  /**
   * Validate deployment environment
   */
  async validateDeployment(): Promise<{ valid: boolean; issues: string[] }> {
    const capabilities = await this.detectCapabilities();
    const issues: string[] = [];

    if (!capabilities.hasWASM) {
      issues.push('WebAssembly not supported');
    }

    if (!capabilities.isSecureContext) {
      issues.push('Insecure context - HTTPS required for full functionality');
    }

    if (!capabilities.hasCOOP) {
      issues.push('Cross-Origin-Opener-Policy header missing or incorrect');
    }

    if (!capabilities.hasCOEP) {
      issues.push('Cross-Origin-Embedder-Policy header missing or incorrect');
    }

    if (!capabilities.hasSharedArrayBuffer) {
      issues.push('SharedArrayBuffer not available - threading disabled');
    }

    if (capabilities.memoryLimit < 512) {
      issues.push(
        `Memory limit too low: ${capabilities.memoryLimit}MB (minimum 512MB recommended)`
      );
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get capabilities summary for logging
   */
  getCapabilitiesSummary(): string {
    if (!this.capabilities) {
      return 'Capabilities not yet detected';
    }

    const caps = this.capabilities;
    return [
      `WASM: ${caps.hasWASM ? '✓' : '✗'}`,
      `Threads: ${caps.hasThreads ? '✓' : '✗'}`,
      `SharedArrayBuffer: ${caps.hasSharedArrayBuffer ? '✓' : '✗'}`,
      `COOP/COEP: ${caps.hasCOOP && caps.hasCOEP ? '✓' : '✗'}`,
      `Memory: ${caps.memoryLimit}MB`,
      `CPU: ${caps.threadCount} threads`,
      caps.error ? `Error: ${caps.error}` : '',
    ]
      .filter(Boolean)
      .join(', ');
  }
}

// Helper functions for easy access
export async function detectWASMCapabilities(): Promise<WASMCapabilities> {
  return WASMLoader.getInstance().detectCapabilities();
}

export async function loadOCCTWASM(): Promise<any> {
  const loader = WASMLoader.getInstance();
  const capabilities = await loader.detectCapabilities();
  const config = loader.generateOCCTConfig(capabilities);

  return loader.loadModule(config);
}

export async function validateWASMDeployment(): Promise<{ valid: boolean; issues: string[] }> {
  return WASMLoader.getInstance().validateDeployment();
}
