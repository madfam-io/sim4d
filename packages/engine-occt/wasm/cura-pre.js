/**
 * CuraEngine WASM Pre-JS Configuration
 *
 * This file is injected before the WASM module loads.
 * It sets up the virtual filesystem and runtime configuration.
 */

// Configure Emscripten module
Module = {
  // Pre-run: Initialize virtual filesystem
  preRun: [
    function() {
      console.log('[CuraEngine] Initializing virtual filesystem...');

      // Create working directories
      FS.mkdir('/tmp');
      FS.mkdir('/input');
      FS.mkdir('/output');

      console.log('[CuraEngine] Virtual filesystem ready');
    }
  ],

  // Post-run: Module is ready
  postRun: [
    function() {
      console.log('[CuraEngine] WASM module loaded successfully');
      console.log('[CuraEngine] Version: CuraEngine 5.7.2 (WASM)');
    }
  ],

  // Print handler (stdout)
  print: function(text) {
    console.log('[CuraEngine]', text);
  },

  // Error handler (stderr)
  printErr: function(text) {
    console.error('[CuraEngine]', text);
  },

  // Memory configuration
  INITIAL_MEMORY: 128 * 1024 * 1024, // 128 MB initial
  MAXIMUM_MEMORY: 512 * 1024 * 1024, // 512 MB maximum
  ALLOW_MEMORY_GROWTH: true,

  // Environment
  getEnv: function(name) {
    return undefined; // No environment variables needed
  },

  // File system callbacks
  onRuntimeInitialized: function() {
    console.log('[CuraEngine] Runtime initialized');
  }
};
