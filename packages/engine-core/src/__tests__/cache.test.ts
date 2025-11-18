import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComputeCache } from '../cache';

describe('ComputeCache', () => {
  let cache: ComputeCache;

  beforeEach(() => {
    cache = new ComputeCache(1); // 1MB for testing
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create cache with default max size', () => {
      const defaultCache = new ComputeCache();
      const stats = defaultCache.getStats();
      expect(stats.maxSizeMB).toBe(100);
      expect(stats.entries).toBe(0);
      expect(stats.sizeBytes).toBe(0);
    });

    it('should create cache with custom max size', () => {
      const customCache = new ComputeCache(50);
      const stats = customCache.getStats();
      expect(stats.maxSizeMB).toBe(50);
    });

    it('should initialize with empty cache', () => {
      const stats = cache.getStats();
      expect(stats.entries).toBe(0);
      expect(stats.sizeBytes).toBe(0);
      expect(stats.usage).toBe(0);
    });
  });

  describe('Basic Operations', () => {
    describe('set() and get()', () => {
      it('should set and get a value', () => {
        cache.set('key1', 'value1');
        expect(cache.get('key1')).toBe('value1');
      });

      it('should return undefined for non-existent key', () => {
        expect(cache.get('nonexistent')).toBeUndefined();
      });

      it('should handle different value types', () => {
        cache.set('string', 'test');
        cache.set('number', 42);
        cache.set('object', { foo: 'bar' });
        cache.set('array', [1, 2, 3]);
        cache.set('null', null);
        cache.set('boolean', true);

        expect(cache.get('string')).toBe('test');
        expect(cache.get('number')).toBe(42);
        expect(cache.get('object')).toEqual({ foo: 'bar' });
        expect(cache.get('array')).toEqual([1, 2, 3]);
        expect(cache.get('null')).toBeNull();
        expect(cache.get('boolean')).toBe(true);
      });

      it('should update existing key', () => {
        cache.set('key1', 'value1');
        cache.set('key1', 'value2');
        expect(cache.get('key1')).toBe('value2');
      });

      it('should update timestamp on get (LRU)', () => {
        vi.useFakeTimers();

        cache.set('key1', 'value1');
        const entry1 = (cache as any).cache.get('key1');
        const timestamp1 = entry1.timestamp;

        vi.advanceTimersByTime(1000);
        cache.get('key1');

        const entry2 = (cache as any).cache.get('key1');
        const timestamp2 = entry2.timestamp;

        expect(timestamp2).toBeGreaterThan(timestamp1);

        vi.useRealTimers();
      });
    });

    describe('has()', () => {
      it('should return true for existing key', () => {
        cache.set('key1', 'value1');
        expect(cache.has('key1')).toBe(true);
      });

      it('should return false for non-existent key', () => {
        expect(cache.has('nonexistent')).toBe(false);
      });

      it('should return true after setting key', () => {
        expect(cache.has('key1')).toBe(false);
        cache.set('key1', 'value1');
        expect(cache.has('key1')).toBe(true);
      });
    });

    describe('delete()', () => {
      it('should delete existing key', () => {
        cache.set('key1', 'value1');
        const deleted = cache.delete('key1');
        expect(deleted).toBe(true);
        expect(cache.has('key1')).toBe(false);
      });

      it('should return false for non-existent key', () => {
        const deleted = cache.delete('nonexistent');
        expect(deleted).toBe(false);
      });

      it('should update currentSize when deleting', () => {
        cache.set('key1', 'value1', 1000);
        const statsBefore = cache.getStats();
        expect(statsBefore.sizeBytes).toBe(1000);

        cache.delete('key1');
        const statsAfter = cache.getStats();
        expect(statsAfter.sizeBytes).toBe(0);
      });
    });

    describe('clear()', () => {
      it('should clear all entries', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');

        cache.clear();

        expect(cache.has('key1')).toBe(false);
        expect(cache.has('key2')).toBe(false);
        expect(cache.has('key3')).toBe(false);
      });

      it('should reset currentSize to zero', () => {
        cache.set('key1', 'value1', 1000);
        cache.set('key2', 'value2', 2000);

        cache.clear();

        const stats = cache.getStats();
        expect(stats.sizeBytes).toBe(0);
        expect(stats.entries).toBe(0);
      });

      it('should work on already empty cache', () => {
        cache.clear();
        const stats = cache.getStats();
        expect(stats.entries).toBe(0);
        expect(stats.sizeBytes).toBe(0);
      });
    });
  });

  describe('Size Management', () => {
    describe('Manual size specification', () => {
      it('should use provided size', () => {
        cache.set('key1', 'value1', 5000);
        const stats = cache.getStats();
        expect(stats.sizeBytes).toBe(5000);
      });

      it('should track size accurately across operations', () => {
        cache.set('key1', 'value1', 1000);
        cache.set('key2', 'value2', 2000);
        cache.set('key3', 'value3', 3000);

        let stats = cache.getStats();
        expect(stats.sizeBytes).toBe(6000);

        cache.delete('key2');
        stats = cache.getStats();
        expect(stats.sizeBytes).toBe(4000);
      });

      it('should update size when overwriting key', () => {
        cache.set('key1', 'value1', 1000);
        let stats = cache.getStats();
        expect(stats.sizeBytes).toBe(1000);

        cache.set('key1', 'value2', 2000);
        stats = cache.getStats();
        expect(stats.sizeBytes).toBe(2000);
      });
    });

    describe('Automatic size estimation', () => {
      it('should estimate size for string values', () => {
        cache.set('key1', 'test');
        const stats = cache.getStats();
        // "test" serializes to '"test"' = 6 chars * 2 bytes = 12 bytes
        expect(stats.sizeBytes).toBe(12);
      });

      it('should estimate size for object values', () => {
        cache.set('key1', { foo: 'bar' });
        const stats = cache.getStats();
        // '{"foo":"bar"}' = 13 chars * 2 bytes = 26 bytes
        expect(stats.sizeBytes).toBe(26);
      });

      it('should estimate size for array values', () => {
        cache.set('key1', [1, 2, 3]);
        const stats = cache.getStats();
        // '[1,2,3]' = 7 chars * 2 bytes = 14 bytes
        expect(stats.sizeBytes).toBe(14);
      });

      it('should use default size for non-serializable values', () => {
        const circularObj: any = {};
        circularObj.self = circularObj;

        cache.set('key1', circularObj);
        const stats = cache.getStats();
        // Should use default 1KB for non-serializable
        expect(stats.sizeBytes).toBe(1024);
      });
    });
  });

  describe('LRU Eviction', () => {
    it('should evict least recently used entry when cache is full', () => {
      vi.useFakeTimers();

      // Fill cache to near capacity (1MB = 1048576 bytes)
      cache.set('key1', 'value1', 300000); // 300KB
      vi.advanceTimersByTime(100);

      cache.set('key2', 'value2', 300000); // 300KB
      vi.advanceTimersByTime(100);

      cache.set('key3', 'value3', 300000); // 300KB
      vi.advanceTimersByTime(100);

      // Now at 900KB, adding 300KB more should evict key1
      cache.set('key4', 'value4', 300000); // 300KB - triggers eviction

      expect(cache.has('key1')).toBe(false); // Evicted (oldest)
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);

      vi.useRealTimers();
    });

    it('should evict multiple entries if needed', () => {
      vi.useFakeTimers();

      // Add small entries
      cache.set('key1', 'value1', 300000); // 300KB
      vi.advanceTimersByTime(100);
      cache.set('key2', 'value2', 300000); // 300KB
      vi.advanceTimersByTime(100);
      cache.set('key3', 'value3', 300000); // 300KB
      vi.advanceTimersByTime(100);

      // Add large entry that requires evicting all 3 entries
      // 300KB + 300KB + 300KB = 900KB, adding 500KB = 1.4MB > 1MB
      // After evicting key1: 600KB + 500KB = 1.1MB > 1MB
      // After evicting key2: 300KB + 500KB = 800KB < 1MB (key3 remains)
      // Actually need larger entry to evict all 3
      cache.set('key4', 'value4', 800000); // 800KB
      // After evicting key1: 600KB + 800KB = 1.4MB > 1MB
      // After evicting key2: 300KB + 800KB = 1.1MB > 1MB
      // After evicting key3: 0KB + 800KB = 800KB < 1MB

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
      expect(cache.has('key4')).toBe(true);

      vi.useRealTimers();
    });

    it('should preserve most recently accessed entries', () => {
      vi.useFakeTimers();

      cache.set('key1', 'value1', 300000); // 300KB
      vi.advanceTimersByTime(100);

      cache.set('key2', 'value2', 300000); // 300KB
      vi.advanceTimersByTime(100);

      cache.set('key3', 'value3', 300000); // 300KB
      vi.advanceTimersByTime(100);

      // Access key1 to make it recent
      cache.get('key1');
      vi.advanceTimersByTime(100);

      // Add new entry - should evict key2 (oldest), not key1
      cache.set('key4', 'value4', 300000); // 300KB

      expect(cache.has('key1')).toBe(true); // Preserved (accessed recently)
      expect(cache.has('key2')).toBe(false); // Evicted (oldest)
      expect(cache.has('key3')).toBe(true);
      expect(cache.has('key4')).toBe(true);

      vi.useRealTimers();
    });

    it('should handle eviction when cache is empty', () => {
      // This tests the edge case where evictLRU is called but no entries exist
      // We'll trigger this by trying to add an entry larger than maxSize to empty cache
      const smallCache = new ComputeCache(0.001); // 1KB cache

      // Try to add 10KB entry - should not crash
      expect(() => {
        smallCache.set('key1', 'x'.repeat(5000), 10000);
      }).not.toThrow();
    });
  });

  describe('getStats()', () => {
    it('should return accurate statistics', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 2000);

      const stats = cache.getStats();

      expect(stats.entries).toBe(2);
      expect(stats.sizeBytes).toBe(3000);
      expect(stats.sizeMB).toBe(3000 / (1024 * 1024));
      expect(stats.maxSizeMB).toBe(1);
      expect(stats.usage).toBe(3000 / (1024 * 1024));
    });

    it('should calculate usage percentage correctly', () => {
      // 1MB cache = 1048576 bytes
      cache.set('key1', 'value1', 524288); // 0.5MB

      const stats = cache.getStats();
      expect(stats.usage).toBeCloseTo(0.5, 2);
    });

    it('should show zero usage for empty cache', () => {
      const stats = cache.getStats();
      expect(stats.entries).toBe(0);
      expect(stats.sizeBytes).toBe(0);
      expect(stats.usage).toBe(0);
    });

    it('should update stats after operations', () => {
      let stats = cache.getStats();
      expect(stats.entries).toBe(0);

      cache.set('key1', 'value1', 1000);
      stats = cache.getStats();
      expect(stats.entries).toBe(1);
      expect(stats.sizeBytes).toBe(1000);

      cache.set('key2', 'value2', 2000);
      stats = cache.getStats();
      expect(stats.entries).toBe(2);
      expect(stats.sizeBytes).toBe(3000);

      cache.delete('key1');
      stats = cache.getStats();
      expect(stats.entries).toBe(1);
      expect(stats.sizeBytes).toBe(2000);

      cache.clear();
      stats = cache.getStats();
      expect(stats.entries).toBe(0);
      expect(stats.sizeBytes).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string keys', () => {
      cache.set('', 'value');
      expect(cache.get('')).toBe('value');
      expect(cache.has('')).toBe(true);
    });

    it('should handle special characters in keys', () => {
      const specialKeys = [
        'key:with:colons',
        'key/with/slashes',
        'key.with.dots',
        'key-with-dashes',
      ];

      specialKeys.forEach((key) => {
        cache.set(key, 'value');
        expect(cache.get(key)).toBe('value');
      });
    });

    it('should handle undefined values', () => {
      cache.set('key1', undefined);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(true); // Key exists even with undefined value
    });

    it('should handle very large values', () => {
      const largeValue = { data: 'x'.repeat(100000) };
      cache.set('large', largeValue);
      expect(cache.get('large')).toEqual(largeValue);
    });

    it('should maintain cache integrity after multiple operations', () => {
      // Add, update, delete in various orders
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 2000);
      cache.set('key1', 'updated1', 1500);
      cache.delete('key2');
      cache.set('key3', 'value3', 3000);
      cache.clear();
      cache.set('key4', 'value4', 4000);

      const stats = cache.getStats();
      expect(stats.entries).toBe(1);
      expect(stats.sizeBytes).toBe(4000);
      expect(cache.get('key4')).toBe('value4');
    });

    it('should handle concurrent operations gracefully', () => {
      // Simulate rapid operations
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`, 1000);
      }

      const stats = cache.getStats();
      expect(stats.entries).toBeGreaterThan(0);
      expect(stats.sizeBytes).toBeLessThanOrEqual(1024 * 1024); // Not exceeding 1MB
    });

    it('should handle zero size entries', () => {
      cache.set('key1', 'value1', 0);
      const stats = cache.getStats();
      expect(stats.sizeBytes).toBe(0);
      expect(cache.has('key1')).toBe(true);
    });

    it('should handle negative size gracefully', () => {
      // While not a valid use case, ensure it doesn't break
      cache.set('key1', 'value1', -1000);
      // The implementation doesn't validate negative sizes, so it will store them
      // This is a potential bug but we document the behavior
      expect(cache.has('key1')).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle 1000 entries efficiently', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, `value${i}`, 100);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Should complete in <1s
    });

    it('should retrieve entries quickly', () => {
      // Add 100 entries
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`, 1000);
      }

      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        cache.get(`key${i}`);
      }
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Type Safety', () => {
    it('should preserve type information with generics', () => {
      interface CustomType {
        id: number;
        name: string;
      }

      const obj: CustomType = { id: 1, name: 'test' };
      cache.set<CustomType>('typed', obj);

      const retrieved = cache.get<CustomType>('typed');
      expect(retrieved).toEqual(obj);
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe('test');
    });

    it('should handle typed arrays', () => {
      const numbers: number[] = [1, 2, 3, 4, 5];
      cache.set<number[]>('numbers', numbers);

      const retrieved = cache.get<number[]>('numbers');
      expect(retrieved).toEqual(numbers);
    });
  });
});
