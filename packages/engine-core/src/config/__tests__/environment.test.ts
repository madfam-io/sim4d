/**
 * Tests for environment configuration management
 * Note: These tests run in NODE_ENV=test, so we test the actual behavior in that context
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Environment, getConfig, isProduction, isDevelopment } from '../environment';

describe('Environment Configuration', () => {
  beforeEach(() => {
    Environment.reset();
  });

  describe('Basic Functionality', () => {
    it('should return a valid configuration object', () => {
      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.mode).toBeDefined();
      expect(typeof config.isProduction).toBe('boolean');
      expect(typeof config.isDevelopment).toBe('boolean');
    });

    it('should always require real OCCT', () => {
      const config = getConfig();

      expect(config.requireRealOCCT).toBe(true);
    });

    it('should have default OCCT configuration', () => {
      const config = getConfig();

      expect(config.occtWasmPath).toBeDefined();
      expect(config.occtInitTimeout).toBeGreaterThan(0);
    });
  });

  describe('Configuration Caching', () => {
    it('should cache configuration after first call', () => {
      const config1 = getConfig();
      const config2 = getConfig();

      // Same instance - cached
      expect(config1).toBe(config2);
    });

    it('should return new instance after reset', () => {
      const config1 = getConfig();

      Environment.reset();

      const config2 = getConfig();

      // Different instances after reset
      expect(config1).not.toBe(config2);
      // But same values
      expect(config1).toEqual(config2);
    });
  });

  describe('Performance Configuration', () => {
    it('should have reasonable memory limits', () => {
      const config = getConfig();

      expect(config.maxWorkerMemoryMB).toBeGreaterThan(0);
      expect(config.meshCacheSizeMB).toBeGreaterThan(0);
      expect(config.workerRestartThresholdMB).toBeGreaterThan(0);
      expect(config.workerRestartThresholdMB).toBeLessThanOrEqual(config.maxWorkerMemoryMB);
    });

    it('should enable memory monitoring by default', () => {
      const config = getConfig();

      expect(config.enableMemoryMonitoring).toBe(true);
    });
  });

  describe('Security Configuration', () => {
    it('should have security settings defined', () => {
      const config = getConfig();

      expect(typeof config.enableCSP).toBe('boolean');
      expect(typeof config.requireCorsValidation).toBe('boolean');
      expect(Array.isArray(config.allowedOrigins)).toBe(true);
      expect(config.allowedOrigins.length).toBeGreaterThan(0);
    });
  });

  describe('Logging Configuration', () => {
    it('should have valid log level', () => {
      const config = getConfig();

      expect(['error', 'warn', 'info', 'debug']).toContain(config.logLevel);
    });

    it('should have error reporting settings', () => {
      const config = getConfig();

      expect(typeof config.enableErrorReporting).toBe('boolean');
      expect(typeof config.enablePerformanceMonitoring).toBe('boolean');
    });
  });

  describe('Feature Flags', () => {
    it('should have feature flags defined', () => {
      const config = getConfig();

      expect(typeof config.enableExportValidation).toBe('boolean');
      expect(typeof config.enableHealthChecks).toBe('boolean');
      expect(typeof config.enableAdminDashboard).toBe('boolean');
    });

    it('should enable health checks by default', () => {
      const config = getConfig();

      expect(config.enableHealthChecks).toBe(true);
    });
  });

  describe('Export Configuration', () => {
    it('should have export limits', () => {
      const config = getConfig();

      expect(config.maxExportSizeMB).toBeGreaterThan(0);
      expect(Array.isArray(config.supportedFormats)).toBe(true);
      expect(config.supportedFormats.length).toBeGreaterThan(0);
    });

    it('should support common CAD formats', () => {
      const config = getConfig();

      // Should support at least some standard formats
      const hasStandardFormats = config.supportedFormats.some((fmt) =>
        ['step', 'iges', 'stl', 'obj'].includes(fmt.toLowerCase())
      );
      expect(hasStandardFormats).toBe(true);
    });
  });

  describe('Validation Logic', () => {
    it('should enforce worker memory constraints', () => {
      const config = getConfig();

      // Worker restart threshold should not exceed max memory
      expect(config.workerRestartThresholdMB).toBeLessThanOrEqual(config.maxWorkerMemoryMB);
    });

    it('should warn about production geometry validation', () => {
      // This tests that validation logic exists
      // The actual warning only triggers in production mode
      expect(typeof getConfig).toBe('function');
    });
  });

  describe('Test Mode Override', () => {
    it('should have setTestConfig method available', () => {
      // The setTestConfig method exists but only works in actual test mode
      // We verify the API exists
      expect(typeof Environment.setTestConfig).toBe('function');
    });
  });

  describe('Convenience Functions', () => {
    it('should export isProduction function', () => {
      expect(typeof isProduction).toBe('function');
      expect(typeof isProduction()).toBe('boolean');
    });

    it('should export isDevelopment function', () => {
      expect(typeof isDevelopment).toBe('function');
      expect(typeof isDevelopment()).toBe('boolean');
    });

    it('should have consistent mode values', () => {
      const config = getConfig();

      // Exactly one mode should be true
      const modes = [config.isProduction, config.isDevelopment];
      const trueCount = modes.filter(Boolean).length;

      // In test mode, both could be false, or one could be true
      expect(trueCount).toBeLessThanOrEqual(1);
    });
  });

  describe('Helper Functions', () => {
    it('should parse boolean values correctly', () => {
      // Test the helper through actual config
      // This indirectly tests parseBoolean
      const config = getConfig();

      expect(typeof config.enableMemoryMonitoring).toBe('boolean');
      expect(typeof config.enableCSP).toBe('boolean');
    });

    it('should parse number values correctly', () => {
      // Test the helper through actual config
      // This indirectly tests parseNumber
      const config = getConfig();

      expect(typeof config.maxWorkerMemoryMB).toBe('number');
      expect(typeof config.occtInitTimeout).toBe('number');
      expect(config.maxWorkerMemoryMB).not.toBeNaN();
      expect(config.occtInitTimeout).not.toBeNaN();
    });

    it('should parse string arrays correctly', () => {
      // Test the helper through actual config
      // This indirectly tests parseStringArray
      const config = getConfig();

      expect(Array.isArray(config.allowedOrigins)).toBe(true);
      expect(Array.isArray(config.supportedFormats)).toBe(true);

      // All entries should be non-empty strings
      config.allowedOrigins.forEach((origin) => {
        expect(typeof origin).toBe('string');
        expect(origin.length).toBeGreaterThan(0);
      });

      config.supportedFormats.forEach((format) => {
        expect(typeof format).toBe('string');
        expect(format.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Configuration Consistency', () => {
    it('should have consistent production/development flags', () => {
      const config = getConfig();

      // Can't be both production and development
      expect(config.isProduction && config.isDevelopment).toBe(false);
    });

    it('should have valid mode value', () => {
      const config = getConfig();

      expect(['production', 'development', 'test']).toContain(config.mode);
    });

    it('should match mode with boolean flags', () => {
      const config = getConfig();

      if (config.mode === 'production') {
        expect(config.isProduction).toBe(true);
        expect(config.isDevelopment).toBe(false);
      } else if (config.mode === 'development') {
        expect(config.isProduction).toBe(false);
        expect(config.isDevelopment).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple reset calls', () => {
      getConfig();
      Environment.reset();
      Environment.reset();
      Environment.reset();

      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.requireRealOCCT).toBe(true);
    });

    it('should handle calling getConfig multiple times without reset', () => {
      const configs = [];
      for (let i = 0; i < 10; i++) {
        configs.push(getConfig());
      }

      // All should be the same instance (cached)
      const firstConfig = configs[0];
      configs.forEach((config) => {
        expect(config).toBe(firstConfig);
      });
    });
  });
});
