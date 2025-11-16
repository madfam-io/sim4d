import { describe, it, expect, beforeEach } from 'vitest';
import {
  listItemNode,
  listLengthNode,
  listRangeNode,
  seriesNode,
  flattenNode,
  partitionNode,
  sortListNode,
  reverseListNode,
  shiftListNode,
  cullPatternNode,
  weaveNode,
} from './data';

describe('Data Nodes', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = { invoke: async () => {} };
  });

  describe('List Item Node', () => {
    it('should get single item from list', async () => {
      const inputs = { list: ['a', 'b', 'c', 'd', 'e'] };
      const params = { index: 2, wrap: true, multiple: false };

      const result = await listItemNode.execute(inputs, params, mockContext);

      expect(result.item).toBe('c');
      expect(result.items).toEqual(['c']);
    });

    it('should handle negative indices with wrapping', async () => {
      const inputs = { list: ['a', 'b', 'c'] };
      const params = { index: -1, wrap: true, multiple: false };

      const result = await listItemNode.execute(inputs, params, mockContext);

      expect(result.item).toBe('c');
    });

    it('should handle out of bounds without wrapping', async () => {
      const inputs = { list: ['a', 'b', 'c'] };
      const params = { index: 5, wrap: false, multiple: false };

      const result = await listItemNode.execute(inputs, params, mockContext);

      expect(result.item).toBeUndefined();
    });

    it('should get multiple items', async () => {
      const inputs = { list: ['a', 'b', 'c', 'd'] };
      const params = { index: [0, 2, 3], wrap: true, multiple: true };

      const result = await listItemNode.execute(inputs, params, mockContext);

      expect(result.items).toEqual(['a', 'c', 'd']);
      expect(result.item).toBe('a');
    });

    it('should handle empty list', async () => {
      const inputs = { list: [] };
      const params = { index: 0, wrap: true, multiple: false };

      const result = await listItemNode.execute(inputs, params, mockContext);

      expect(result.item).toBeNull();
      expect(result.items).toEqual([]);
    });

    it('should handle null list', async () => {
      const inputs = { list: null };
      const params = { index: 0, wrap: true, multiple: false };

      const result = await listItemNode.execute(inputs, params, mockContext);

      expect(result.item).toBeNull();
      expect(result.items).toEqual([]);
    });
  });

  describe('List Length Node', () => {
    it('should return list length', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };

      const result = await listLengthNode.execute(inputs, {}, mockContext);

      expect(result.length).toBe(5);
    });

    it('should handle empty list', async () => {
      const inputs = { list: [] };

      const result = await listLengthNode.execute(inputs, {}, mockContext);

      expect(result.length).toBe(0);
    });

    it('should handle null list', async () => {
      const inputs = { list: null };

      const result = await listLengthNode.execute(inputs, {}, mockContext);

      expect(result.length).toBe(0);
    });
  });

  describe('Range Node', () => {
    it('should create range with default params', async () => {
      const inputs = {};
      const params = { start: 0, end: 10, count: 5 };

      const result = await listRangeNode.execute(inputs, params, mockContext);

      expect(result.range).toEqual([0, 2.5, 5, 7.5, 10]);
    });

    it('should use input values over params', async () => {
      const inputs = { start: 5, end: 15, count: 3 };
      const params = { start: 0, end: 10, count: 5 };

      const result = await listRangeNode.execute(inputs, params, mockContext);

      expect(result.range).toEqual([5, 10, 15]);
    });

    it('should handle negative ranges', async () => {
      const inputs = { start: 10, end: -10 };
      const params = { count: 5 };

      const result = await listRangeNode.execute(inputs, params, mockContext);

      expect(result.range).toEqual([10, 5, 0, -5, -10]);
    });

    it('should handle single point range', async () => {
      const inputs = { start: 5, end: 5, count: 3 };
      const params = {};

      const result = await listRangeNode.execute(inputs, params, mockContext);

      expect(result.range.every((v) => v === 5)).toBe(true);
    });
  });

  describe('Series Node', () => {
    it('should create arithmetic series', async () => {
      const inputs = {};
      const params = { start: 0, step: 2, count: 5, type: 'arithmetic' };

      const result = await seriesNode.execute(inputs, params, mockContext);

      expect(result.series).toEqual([0, 2, 4, 6, 8]);
    });

    it('should create geometric series', async () => {
      const inputs = { start: 1, step: 2 };
      const params = { count: 5, type: 'geometric' };

      const result = await seriesNode.execute(inputs, params, mockContext);

      expect(result.series).toEqual([1, 2, 4, 8, 16]);
    });

    it('should create fibonacci series', async () => {
      const inputs = {};
      const params = { count: 7, type: 'fibonacci' };

      const result = await seriesNode.execute(inputs, params, mockContext);

      expect(result.series).toEqual([0, 1, 1, 2, 3, 5, 8]);
    });

    it('should handle negative steps in arithmetic', async () => {
      const inputs = { start: 10, step: -2 };
      const params = { count: 5, type: 'arithmetic' };

      const result = await seriesNode.execute(inputs, params, mockContext);

      expect(result.series).toEqual([10, 8, 6, 4, 2]);
    });

    it('should handle fractional steps in geometric', async () => {
      const inputs = { start: 16, step: 0.5 };
      const params = { count: 4, type: 'geometric' };

      const result = await seriesNode.execute(inputs, params, mockContext);

      expect(result.series).toEqual([16, 8, 4, 2]);
    });
  });

  describe('Flatten Node', () => {
    it('should flatten single level', async () => {
      const inputs = { tree: [[1, 2], [3, 4], [5]] };
      const params = { depth: 1 };

      const result = await flattenNode.execute(inputs, params, mockContext);

      expect(result.flat).toEqual([1, 2, 3, 4, 5]);
    });

    it('should flatten multiple levels', async () => {
      const inputs = { tree: [[[1]], [[2, 3]], [[[4]]]] };
      const params = { depth: 2 };

      const result = await flattenNode.execute(inputs, params, mockContext);

      expect(result.flat).toEqual([1, 2, 3, [4]]);
    });

    it('should handle depth 0', async () => {
      const inputs = {
        tree: [
          [1, 2],
          [3, 4],
        ],
      };
      const params = { depth: 0 };

      const result = await flattenNode.execute(inputs, params, mockContext);

      expect(result.flat).toEqual([
        [
          [1, 2],
          [3, 4],
        ],
      ]);
    });

    it('should handle non-array input', async () => {
      const inputs = { tree: 42 };
      const params = { depth: 1 };

      const result = await flattenNode.execute(inputs, params, mockContext);

      expect(result.flat).toEqual([42]);
    });

    it('should handle mixed nested arrays', async () => {
      const inputs = { tree: [1, [2, 3], [[4]], 5] };
      const params = { depth: 2 };

      const result = await flattenNode.execute(inputs, params, mockContext);

      expect(result.flat).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Partition Node', () => {
    it('should partition list into chunks', async () => {
      const inputs = { list: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
      const params = { size: 3, overlap: 0 };

      const result = await partitionNode.execute(inputs, params, mockContext);

      expect(result.partitions).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
    });

    it('should handle overlapping partitions', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };
      const params = { size: 3, overlap: 1 };

      const result = await partitionNode.execute(inputs, params, mockContext);

      expect(result.partitions).toEqual([
        [1, 2, 3],
        [3, 4, 5],
      ]);
    });

    it('should handle partial last partition', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };
      const params = { size: 2, overlap: 0 };

      const result = await partitionNode.execute(inputs, params, mockContext);

      expect(result.partitions).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should handle overlap larger than size', async () => {
      const inputs = { list: [1, 2, 3, 4] };
      const params = { size: 2, overlap: 3 };

      const result = await partitionNode.execute(inputs, params, mockContext);

      expect(result.partitions.length).toBeGreaterThan(0);
    });
  });

  describe('Sort List Node', () => {
    it('should sort numeric list', async () => {
      const inputs = { list: [3, 1, 4, 1, 5, 9, 2] };
      const params = { reverse: false };

      const result = await sortListNode.execute(inputs, params, mockContext);

      expect(result.sorted).toEqual([1, 1, 2, 3, 4, 5, 9]);
      expect(result.indices).toEqual([1, 3, 6, 0, 2, 4, 5]);
    });

    it('should sort in reverse', async () => {
      const inputs = { list: [3, 1, 4] };
      const params = { reverse: true };

      const result = await sortListNode.execute(inputs, params, mockContext);

      expect(result.sorted).toEqual([4, 3, 1]);
    });

    it('should sort with custom keys', async () => {
      const inputs = {
        list: ['a', 'b', 'c'],
        keys: [3, 1, 2],
      };
      const params = { reverse: false };

      const result = await sortListNode.execute(inputs, params, mockContext);

      expect(result.sorted).toEqual(['b', 'c', 'a']);
    });

    it('should handle string sorting', async () => {
      const inputs = { list: ['zebra', 'apple', 'banana'] };
      const params = { reverse: false };

      const result = await sortListNode.execute(inputs, params, mockContext);

      expect(result.sorted[0]).toBe('apple');
    });
  });

  describe('Reverse List Node', () => {
    it('should reverse list', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };

      const result = await reverseListNode.execute(inputs, {}, mockContext);

      expect(result.reversed).toEqual([5, 4, 3, 2, 1]);
    });

    it('should handle empty list', async () => {
      const inputs = { list: [] };

      const result = await reverseListNode.execute(inputs, {}, mockContext);

      expect(result.reversed).toEqual([]);
    });
  });

  describe('Shift List Node', () => {
    it('should shift list with wrapping', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };
      const params = { offset: 2, wrap: true };

      const result = await shiftListNode.execute(inputs, params, mockContext);

      expect(result.shifted).toEqual([4, 5, 1, 2, 3]);
    });

    it('should shift list without wrapping', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };
      const params = { offset: 2, wrap: false };

      const result = await shiftListNode.execute(inputs, params, mockContext);

      expect(result.shifted[0]).toBeNull();
      expect(result.shifted[1]).toBeNull();
      expect(result.shifted[2]).toBe(1);
    });

    it('should handle negative offset', async () => {
      const inputs = { list: [1, 2, 3, 4, 5] };
      const params = { offset: -2, wrap: true };

      const result = await shiftListNode.execute(inputs, params, mockContext);

      expect(result.shifted).toEqual([3, 4, 5, 1, 2]);
    });
  });

  describe('Cull Pattern Node', () => {
    it('should cull items by pattern', async () => {
      const inputs = {
        list: [1, 2, 3, 4, 5, 6],
        pattern: [true, false, true],
      };
      const params = { invert: false };

      const result = await cullPatternNode.execute(inputs, params, mockContext);

      expect(result.culled).toEqual([1, 3, 4, 6]);
      expect(result.removed).toEqual([2, 5]);
    });

    it('should handle pattern inversion', async () => {
      const inputs = {
        list: [1, 2, 3, 4],
        pattern: [true, false],
      };
      const params = { invert: true };

      const result = await cullPatternNode.execute(inputs, params, mockContext);

      expect(result.culled).toEqual([2, 4]);
      expect(result.removed).toEqual([1, 3]);
    });

    it('should repeat pattern for longer lists', async () => {
      const inputs = {
        list: [1, 2, 3, 4, 5],
        pattern: [true, true],
      };
      const params = { invert: false };

      const result = await cullPatternNode.execute(inputs, params, mockContext);

      expect(result.culled).toEqual([1, 2, 3, 4, 5]);
      expect(result.removed).toEqual([]);
    });
  });

  describe('Weave Node', () => {
    it('should weave lists together', async () => {
      const inputs = {
        lists: [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
      };
      const params = {};

      const result = await weaveNode.execute(inputs, params, mockContext);

      expect(result.woven).toEqual([1, 3, 5, 2, 4, 6]);
    });

    it('should weave with custom pattern', async () => {
      const inputs = {
        lists: [
          ['a', 'b'],
          ['c', 'd'],
          ['e', 'f'],
        ],
        pattern: [0, 0, 1, 2],
      };
      const params = {};

      const result = await weaveNode.execute(inputs, params, mockContext);

      expect(result.woven).toContain('a');
      expect(result.woven).toContain('b');
    });

    it('should handle uneven list lengths', async () => {
      const inputs = {
        lists: [[1, 2, 3], [4], [5, 6]],
      };
      const params = {};

      const result = await weaveNode.execute(inputs, params, mockContext);

      expect(result.woven.length).toBe(6);
    });
  });
});
