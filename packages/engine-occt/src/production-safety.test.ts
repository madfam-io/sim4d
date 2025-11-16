import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectEnvironment,
  validateProductionSafety,
  createProductionSafeConfig,
  createProductionErrorBoundary,
  ProductionSafetyError,
  type EnvironmentConfig,
} from './production-safety';

describe('Production Safety', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NODE_ENV;
  });

  describe('Environment Detection', () => {
    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      const env = detectEnvironment();

      expect(env.isProduction).toBe(true);
      expect(env.nodeEnv).toBe('production');
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      const env = detectEnvironment();

      expect(env.isProduction).toBe(false);
      expect(env.isDevelopment).toBe(true);
    });

    it('should detect test environment', () => {
      process.env.NODE_ENV = 'test';
      const env = detectEnvironment();

      expect(env.isTest).toBe(true);
    });

    it('should default to development when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      const env = detectEnvironment();

      expect(env.isDevelopment).toBe(true);
    });
  });

  describe('Production Safety Validation', () => {
    it('should throw error when NOT using real OCCT geometry', () => {
      const productionEnv: EnvironmentConfig = {
        isProduction: true,
        isDevelopment: false,
        isTest: false,
        nodeEnv: 'production',
      };

      expect(() => {
        validateProductionSafety(false, productionEnv); // false = NOT using real OCCT
      }).toThrow(ProductionSafetyError);

      expect(() => {
        validateProductionSafety(false, productionEnv);
      }).toThrow('ONLY real OCCT geometry is allowed');
    });

    it('should allow real OCCT geometry in production', () => {
      const productionEnv: EnvironmentConfig = {
        isProduction: true,
        isDevelopment: false,
        isTest: false,
        nodeEnv: 'production',
      };

      expect(() => {
        validateProductionSafety(true, productionEnv); // true = using real OCCT
      }).not.toThrow();
    });

    it('should enforce real OCCT in development too', () => {
      const devEnv: EnvironmentConfig = {
        isProduction: false,
        isDevelopment: true,
        isTest: false,
        nodeEnv: 'development',
      };

      expect(() => {
        validateProductionSafety(false, devEnv); // false = NOT using real OCCT
      }).toThrow(ProductionSafetyError);
    });
  });

  describe('Production Safe Configuration', () => {
    it('should create production-safe config in production', () => {
      process.env.NODE_ENV = 'production';

      const config = createProductionSafeConfig();

      expect(config.enableRealOCCT).toBe(true);
      expect(config.maxRetries).toBe(1);
      expect(config.operationTimeout).toBe(15000);
    });

    it('should create development config in development', () => {
      process.env.NODE_ENV = 'development';

      const config = createProductionSafeConfig();

      expect(config.enableRealOCCT).toBe(true);
      expect(config.maxRetries).toBe(3);
      expect(config.operationTimeout).toBe(30000);
    });

    it('should reject disabling real OCCT', () => {
      process.env.NODE_ENV = 'production';

      expect(() => {
        createProductionSafeConfig({ enableRealOCCT: false });
      }).toThrow(ProductionSafetyError);

      expect(() => {
        createProductionSafeConfig({ enableRealOCCT: false });
      }).toThrow('Real OCCT cannot be disabled');
    });
  });

  describe('Production Error Boundaries', () => {
    it('should create production-specific error', () => {
      const productionEnv: EnvironmentConfig = {
        isProduction: true,
        isDevelopment: false,
        isTest: false,
        nodeEnv: 'production',
      };

      const error = createProductionErrorBoundary('TEST_OPERATION', productionEnv);

      expect(error).toBeInstanceOf(ProductionSafetyError);
      expect(error.message).toContain('Real OCCT geometry system failed');
      expect(error.message).toContain('TEST_OPERATION');
    });
  });

  describe('ProductionSafetyError', () => {
    it('should create proper error with context', () => {
      const context = { test: 'data' };
      const error = new ProductionSafetyError('Test message', context);

      expect(error.name).toBe('ProductionSafetyError');
      expect(error.message).toBe('PRODUCTION SAFETY VIOLATION: Test message');
      expect(error.context).toEqual(context);
    });

    it('should work without context', () => {
      const error = new ProductionSafetyError('Test message');

      expect(error.name).toBe('ProductionSafetyError');
      expect(error.message).toBe('PRODUCTION SAFETY VIOLATION: Test message');
      expect(error.context).toBeUndefined();
    });
  });

  describe('Browser Environment Detection', () => {
    it('should handle browser environment without Node.js process', () => {
      const originalProcess = global.process;
      delete (global as any).process;

      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });

      const env = detectEnvironment();

      expect(env.isDevelopment).toBe(true);

      global.process = originalProcess;
    });

    it('should detect production domain', () => {
      const originalProcess = global.process;
      delete (global as any).process;

      Object.defineProperty(window, 'location', {
        value: { hostname: 'app.example.com' },
        writable: true,
      });

      const env = detectEnvironment();

      expect(env.isProduction).toBe(true);

      global.process = originalProcess;
    });
  });
});
