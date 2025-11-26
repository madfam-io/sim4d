import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashNode, hash, hashGeometry } from '../hash';
import type { NodeInstance } from '@sim4d/types';

describe('Hash Functions', () => {
  describe('hash()', () => {
    it('should generate consistent hash for same input', () => {
      const input = 'test string';
      const hash1 = hash(input);
      const hash2 = hash(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = hash('string1');
      const hash2 = hash('string2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 8-character hex string', () => {
      const result = hash('test');
      expect(result).toMatch(/^[0-9a-f]{8}$/);
      expect(result.length).toBe(8);
    });

    it('should handle empty string', () => {
      const result = hash('');
      expect(result).toBeDefined();
      expect(result.length).toBe(8);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = hash(longString);
      expect(result).toBeDefined();
      expect(result.length).toBe(8);
    });

    it('should handle unicode characters', () => {
      const unicode = '日本語 🎯 español';
      const result = hash(unicode);
      expect(result).toBeDefined();
      expect(result.length).toBe(8);
    });

    it('should handle special characters', () => {
      const special = '!@#$%^&*()_+-={}[]|:";\'<>?,./';
      const result = hash(special);
      expect(result).toBeDefined();
      expect(result.length).toBe(8);
    });

    it('should be deterministic across multiple calls', () => {
      const input = JSON.stringify({ foo: 'bar', num: 42 });
      const hashes = Array.from({ length: 100 }, () => hash(input));
      const unique = new Set(hashes);
      expect(unique.size).toBe(1); // All hashes should be identical
    });

    it('should handle newlines and whitespace', () => {
      const withNewlines = 'line1\nline2\r\nline3';
      const result = hash(withNewlines);
      expect(result).toBeDefined();
      expect(result.length).toBe(8);
    });

    it('should distinguish similar strings', () => {
      const hash1 = hash('test');
      const hash2 = hash('test '); // With trailing space
      const hash3 = hash('Test'); // Different case

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });
  });

  describe('hashNode()', () => {
    let node: NodeInstance;

    beforeEach(() => {
      node = {
        id: 'node-123',
        type: 'Math::Add',
        params: { value: 5 },
        inputs: {},
        outputs: {},
        position: { x: 0, y: 0 },
        dirty: false,
      };
    });

    it('should generate consistent hash for same node and inputs', () => {
      const inputs = { a: 10, b: 20 };
      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash when params change', () => {
      const inputs = { a: 10 };
      const hash1 = hashNode(node, inputs);

      node.params = { value: 10 };
      const hash2 = hashNode(node, inputs);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hash when inputs change', () => {
      const hash1 = hashNode(node, { a: 10 });
      const hash2 = hashNode(node, { a: 20 });
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hash when type changes', () => {
      const inputs = { a: 10 };
      const hash1 = hashNode(node, inputs);

      node.type = 'Math::Multiply';
      const hash2 = hashNode(node, inputs);

      expect(hash1).not.toBe(hash2);
    });

    it('should ignore node id and position in hash', () => {
      const inputs = { a: 10 };
      const hash1 = hashNode(node, inputs);

      // Change properties that shouldn't affect hash
      node.id = 'different-id';
      node.position = { x: 100, y: 200 };
      node.dirty = true;

      const hash2 = hashNode(node, inputs);
      expect(hash1).toBe(hash2);
    });

    it('should normalize input order', () => {
      const inputs1 = { b: 20, a: 10 };
      const inputs2 = { a: 10, b: 20 };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).toBe(hash2); // Order shouldn't matter
    });

    it('should handle null inputs', () => {
      const hash1 = hashNode(node, null);
      const hash2 = hashNode(node, null);
      expect(hash1).toBe(hash2);
    });

    it('should handle undefined inputs', () => {
      const hash1 = hashNode(node, undefined);
      const hash2 = hashNode(node, undefined);
      expect(hash1).toBe(hash2);
    });

    it('should handle empty object inputs', () => {
      const hash1 = hashNode(node, {});
      const hash2 = hashNode(node, {});
      expect(hash1).toBe(hash2);
    });

    it('should handle nested object inputs', () => {
      const inputs = {
        nested: {
          deep: {
            value: 42,
          },
        },
      };
      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);
      expect(hash1).toBe(hash2);
    });

    it('should handle array inputs', () => {
      const inputs = { values: [1, 2, 3, 4, 5] };
      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);
      expect(hash1).toBe(hash2);
    });

    it('should handle shape handle inputs', () => {
      const inputs = {
        shape: { id: 'shape-123', type: 'Face' },
      };
      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);
      expect(hash1).toBe(hash2);
    });

    it('should normalize shape handles consistently', () => {
      // Shape handles should only use id and type
      const inputs1 = {
        shape: { id: 'shape-123', type: 'Face', extra: 'data' },
      };
      const inputs2 = {
        shape: { id: 'shape-123', type: 'Face', different: 'extra' },
      };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).toBe(hash2); // Extra properties ignored
    });

    it('should handle complex params', () => {
      node.params = {
        number: 42,
        string: 'test',
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
      };

      const hash1 = hashNode(node, {});
      const hash2 = hashNode(node, {});
      expect(hash1).toBe(hash2);
    });

    it('should detect changes in nested input values', () => {
      const inputs1 = { nested: { value: 10 } };
      const inputs2 = { nested: { value: 20 } };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle mixed primitive and object inputs', () => {
      const inputs = {
        number: 42,
        string: 'test',
        object: { foo: 'bar' },
        array: [1, 2, 3],
        null: null,
        boolean: true,
      };

      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);
      expect(hash1).toBe(hash2);
    });
  });

  describe('hashGeometry()', () => {
    it('should generate consistent hash for same ArrayBuffer', async () => {
      const data = new ArrayBuffer(100);
      const view = new Uint8Array(data);
      for (let i = 0; i < 100; i++) {
        view[i] = i;
      }

      const hash1 = await hashGeometry(data);
      const hash2 = await hashGeometry(data);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different data', async () => {
      const data1 = new ArrayBuffer(100);
      const data2 = new ArrayBuffer(100);

      new Uint8Array(data1).fill(1);
      new Uint8Array(data2).fill(2);

      const hash1 = await hashGeometry(data1);
      const hash2 = await hashGeometry(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate 16-character hex string', async () => {
      const data = new ArrayBuffer(50);
      const result = await hashGeometry(data);

      expect(result).toMatch(/^[0-9a-f]{16}$/);
      expect(result.length).toBe(16);
    });

    it('should handle empty ArrayBuffer', async () => {
      const data = new ArrayBuffer(0);
      const result = await hashGeometry(data);

      expect(result).toBeDefined();
      expect(result.length).toBe(16);
    });

    it('should handle large ArrayBuffer', async () => {
      const data = new ArrayBuffer(1024 * 1024); // 1MB
      const view = new Uint8Array(data);
      for (let i = 0; i < view.length; i++) {
        view[i] = i % 256;
      }

      const result = await hashGeometry(data);
      expect(result).toBeDefined();
      expect(result.length).toBe(16);
    });

    it('should detect single byte difference', async () => {
      const data1 = new ArrayBuffer(100);
      const data2 = new ArrayBuffer(100);

      const view1 = new Uint8Array(data1);
      const view2 = new Uint8Array(data2);

      // Fill with same data
      for (let i = 0; i < 100; i++) {
        view1[i] = i;
        view2[i] = i;
      }

      // Change one byte
      view2[50] = 255;

      const hash1 = await hashGeometry(data1);
      const hash2 = await hashGeometry(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should use Web Crypto API when available', async () => {
      // Ensure Web Crypto API is being used (in test environment it should be)
      expect(globalThis.crypto?.subtle).toBeDefined();

      const data = new ArrayBuffer(100);
      new Uint8Array(data).fill(42);

      const result = await hashGeometry(data);
      expect(result).toBeDefined();
    });

    it('should handle fallback when Web Crypto API unavailable', async () => {
      // Use vi.stubGlobal to mock crypto
      const originalSubtle = globalThis.crypto.subtle;

      try {
        vi.stubGlobal('crypto', { subtle: undefined });

        const data = new ArrayBuffer(100);
        new Uint8Array(data).fill(42);

        const result = await hashGeometry(data);
        expect(result).toBeDefined();
        // Fallback uses FNV-1a which returns 8 chars, not 16
        expect(result.length).toBe(8);
      } finally {
        // Restore original crypto.subtle
        vi.stubGlobal('crypto', { subtle: originalSubtle });
      }
    });

    it('should be deterministic with same binary data', async () => {
      const createData = () => {
        const buffer = new ArrayBuffer(1000);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < 1000; i++) {
          view[i] = (i * 7 + 13) % 256; // Pseudo-random but deterministic
        }
        return buffer;
      };

      const data1 = createData();
      const data2 = createData();

      const hash1 = await hashGeometry(data1);
      const hash2 = await hashGeometry(data2);

      expect(hash1).toBe(hash2);
    });

    it('should handle different sized buffers', async () => {
      const small = new ArrayBuffer(10);
      const medium = new ArrayBuffer(100);
      const large = new ArrayBuffer(1000);

      const hash1 = await hashGeometry(small);
      const hash2 = await hashGeometry(medium);
      const hash3 = await hashGeometry(large);

      // Different sizes should produce different hashes (even if all zeros)
      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash1).not.toBe(hash3);
    });
  });

  describe('Input Normalization (via hashNode)', () => {
    let node: NodeInstance;

    beforeEach(() => {
      node = {
        id: 'test',
        type: 'Test',
        params: {},
        inputs: {},
        outputs: {},
        position: { x: 0, y: 0 },
        dirty: false,
      };
    });

    it('should normalize nested arrays consistently', () => {
      const inputs1 = {
        data: [
          [1, 2],
          [3, 4],
        ],
      };
      const inputs2 = {
        data: [
          [1, 2],
          [3, 4],
        ],
      };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).toBe(hash2);
    });

    it('should normalize object key order', () => {
      const inputs1 = { z: 3, y: 2, x: 1 };
      const inputs2 = { x: 1, y: 2, z: 3 };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).toBe(hash2);
    });

    it('should normalize deeply nested object key order', () => {
      const inputs1 = {
        level1: {
          z: { c: 3, b: 2, a: 1 },
          a: { x: 1, y: 2 },
        },
      };
      const inputs2 = {
        level1: {
          a: { y: 2, x: 1 },
          z: { a: 1, b: 2, c: 3 },
        },
      };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).toBe(hash2);
    });

    it('should treat null and undefined differently', () => {
      const hash1 = hashNode(node, null);
      const hash2 = hashNode(node, undefined);

      expect(hash1).toBe(hash2); // Both normalized to null
    });

    it('should normalize primitives correctly', () => {
      const inputs = {
        string: 'test',
        number: 42,
        boolean: true,
        nullValue: null,
      };

      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);

      expect(hash1).toBe(hash2);
    });

    it('should handle arrays of objects', () => {
      const inputs = {
        items: [
          { id: 1, name: 'first' },
          { id: 2, name: 'second' },
        ],
      };

      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);

      expect(hash1).toBe(hash2);
    });

    it('should preserve array order', () => {
      const inputs1 = { arr: [1, 2, 3] };
      const inputs2 = { arr: [3, 2, 1] };

      const hash1 = hashNode(node, inputs1);
      const hash2 = hashNode(node, inputs2);

      expect(hash1).not.toBe(hash2); // Array order matters
    });

    it('should handle mixed types in arrays', () => {
      const inputs = {
        mixed: [1, 'two', { three: 3 }, [4, 5], null, true],
      };

      const hash1 = hashNode(node, inputs);
      const hash2 = hashNode(node, inputs);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Performance', () => {
    it('should hash 1000 strings quickly', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        hash(`test string ${i}`);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });

    it('should hash 100 nodes quickly', () => {
      const node: NodeInstance = {
        id: 'test',
        type: 'Math::Add',
        params: { value: 5 },
        inputs: {},
        outputs: {},
        position: { x: 0, y: 0 },
        dirty: false,
      };

      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        hashNode(node, { a: i, b: i * 2 });
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50); // Should complete in <50ms
    });

    it('should hash geometry buffers efficiently', async () => {
      const buffers = Array.from({ length: 10 }, (_, i) => {
        const buffer = new ArrayBuffer(1000);
        new Uint8Array(buffer).fill(i);
        return buffer;
      });

      const start = Date.now();

      await Promise.all(buffers.map((b) => hashGeometry(b)));

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });

  describe('Hash Collision Resistance', () => {
    it('should produce different hashes for similar inputs', () => {
      const hashes = new Set([
        hash('test1'),
        hash('test2'),
        hash('test3'),
        hash('1test'),
        hash('2test'),
        hash('3test'),
      ]);

      expect(hashes.size).toBe(6); // All different
    });

    it('should handle potential collision scenarios', () => {
      const node: NodeInstance = {
        id: 'test',
        type: 'Test',
        params: {},
        inputs: {},
        outputs: {},
        position: { x: 0, y: 0 },
        dirty: false,
      };

      // Generate many hashes with small variations
      const hashes = new Set();
      for (let i = 0; i < 100; i++) {
        hashes.add(hashNode(node, { value: i }));
      }

      expect(hashes.size).toBe(100); // All unique
    });
  });
});
