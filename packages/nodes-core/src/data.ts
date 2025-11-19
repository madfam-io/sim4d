/**
 * Data Manipulation Nodes for BrepFlow
 * Implements list operations, tree structures, and data management
 */

import { NodeDefinition } from '@brepflow/types';

// List Item
export const listItemNode: NodeDefinition = {
  id: 'Data::ListItem',
  category: 'Data',
  label: 'List Item',
  description: 'Get item(s) from a list by index',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    item: {
      type: 'Any',
      label: 'Item',
    },
    items: {
      type: 'Any[]',
      label: 'Items',
    },
  },
  params: {
    index: {
      type: 'number',
      default: 0,
      min: -1000,
      max: 1000,
    },
    wrap: {
      type: 'boolean',
      default: true,
    },
    multiple: {
      type: 'boolean',
      default: false,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const list = inputs.list;
    if (!list || list.length === 0) {
      return { item: null, items: [] };
    }

    if (params.multiple) {
      // Return multiple items based on indices
      const indices = Array.isArray(params.index) ? params.index : [params.index];
      const items = indices.map((i) => {
        const idx = params.wrap ? ((i % list.length) + list.length) % list.length : i;
        return list[idx];
      });
      return { item: items[0], items };
    } else {
      // Return single item
      const idx = params.wrap
        ? ((params.index % list.length) + list.length) % list.length
        : params.index;
      return { item: list[idx], items: [list[idx]] };
    }
  },
  execute: async (inputs, params, context) => {
    return listItemNode.evaluate(context, inputs, params);
  },
};

// List Length
export const listLengthNode: NodeDefinition = {
  id: 'Data::ListLength',
  category: 'Data',
  label: 'List Length',
  description: 'Get the length of a list',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    length: {
      type: 'Number',
      label: 'Length',
    },
  },
  params: {},
  evaluate: async (ctx, inputs, _params) => {
    const length = inputs.list ? inputs.list.length : 0;
    return { length };
  },
  execute: async (inputs, params, context) => {
    return listLengthNode.evaluate(context, inputs, params);
  },
};

// List Range
export const listRangeNode: NodeDefinition = {
  id: 'Data::Range',
  category: 'Data',
  label: 'Range',
  description: 'Create a numeric range',
  inputs: {
    start: {
      type: 'Number',
      label: 'Start',
      required: false,
    },
    end: {
      type: 'Number',
      label: 'End',
      required: false,
    },
    count: {
      type: 'Number',
      label: 'Count',
      required: false,
    },
  },
  outputs: {
    range: {
      type: 'Number[]',
      label: 'Range',
    },
  },
  params: {
    start: {
      type: 'number',
      default: 0,
    },
    end: {
      type: 'number',
      default: 10,
    },
    count: {
      type: 'number',
      default: 10,
      min: 1,
      max: 10000,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const start = inputs.start ?? params.start;
    const end = inputs.end ?? params.end;
    const count = inputs.count ?? params.count;

    const range = [];
    const step = (end - start) / (count - 1);

    for (let i = 0; i < count; i++) {
      range.push(start + i * step);
    }

    return { range };
  },
  execute: async (inputs, params, context) => {
    return listRangeNode.evaluate(context, inputs, params);
  },
};

// Series
export const seriesNode: NodeDefinition = {
  id: 'Data::Series',
  category: 'Data',
  label: 'Series',
  description: 'Create arithmetic or geometric series',
  inputs: {
    start: {
      type: 'Number',
      label: 'Start',
      required: false,
    },
    step: {
      type: 'Number',
      label: 'Step/Factor',
      required: false,
    },
  },
  outputs: {
    series: {
      type: 'Number[]',
      label: 'Series',
    },
  },
  params: {
    start: {
      type: 'number',
      default: 0,
    },
    step: {
      type: 'number',
      default: 1,
    },
    count: {
      type: 'number',
      default: 10,
      min: 1,
      max: 10000,
    },
    type: {
      type: 'enum',
      default: 'arithmetic',
      options: ['arithmetic', 'geometric', 'fibonacci'],
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const start = inputs.start ?? params.start;
    const step = inputs.step ?? params.step;
    const count = params.count;
    const type = params.type;

    const series = [];

    if (type === 'arithmetic') {
      for (let i = 0; i < count; i++) {
        series.push(start + i * step);
      }
    } else if (type === 'geometric') {
      for (let i = 0; i < count; i++) {
        series.push(start * Math.pow(step, i));
      }
    } else if (type === 'fibonacci') {
      let a = 0,
        b = 1;
      for (let i = 0; i < count; i++) {
        series.push(a);
        [a, b] = [b, a + b];
      }
    }

    return { series };
  },
  execute: async (inputs, params, context) => {
    return seriesNode.evaluate(context, inputs, params);
  },
};

// Flatten
export const flattenNode: NodeDefinition = {
  id: 'Data::Flatten',
  category: 'Data',
  label: 'Flatten',
  description: 'Flatten a nested list structure',
  inputs: {
    tree: {
      type: 'Any',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    flat: {
      type: 'Any[]',
      label: 'Flattened List',
    },
  },
  params: {
    depth: {
      type: 'number',
      default: 1,
      min: 0,
      max: 10,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const flatten = (arr: any, depth: number): unknown[] => {
      if (depth === 0 || !Array.isArray(arr)) return [arr];
      return arr.reduce((acc, val) => {
        if (Array.isArray(val) && depth > 1) {
          return acc.concat(flatten(val, depth - 1));
        }
        return acc.concat(val);
      }, []);
    };

    const flat = flatten(inputs.tree, params.depth);
    return { flat };
  },
  execute: async (inputs, params, context) => {
    return flattenNode.evaluate(context, inputs, params);
  },
};

// Partition List
export const partitionNode: NodeDefinition = {
  id: 'Data::Partition',
  category: 'Data',
  label: 'Partition List',
  description: 'Partition a list into chunks',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    partitions: {
      type: 'Any[][]',
      label: 'Partitions',
    },
  },
  params: {
    size: {
      type: 'number',
      default: 3,
      min: 1,
      max: 1000,
    },
    overlap: {
      type: 'number',
      default: 0,
      min: 0,
      max: 100,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const list = inputs.list;
    const size = params.size;
    const step = Math.max(1, size - params.overlap);

    const partitions = [];
    for (let i = 0; i < list.length; i += step) {
      const partition = list.slice(i, i + size);
      // If there's overlap, only include full-sized partitions (except first)
      // If there's no overlap, include all partitions including partial ones
      if (params.overlap === 0 || partition.length === size) {
        partitions.push(partition);
      }
    }

    return { partitions };
  },
  execute: async (inputs, params, context) => {
    return partitionNode.evaluate(context, inputs, params);
  },
};

// Sort List
export const sortListNode: NodeDefinition = {
  id: 'Data::Sort',
  category: 'Data',
  label: 'Sort List',
  description: 'Sort a list of items',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
    keys: {
      type: 'Number[]',
      label: 'Sort Keys',
      required: false,
    },
  },
  outputs: {
    sorted: {
      type: 'Any[]',
      label: 'Sorted List',
    },
    indices: {
      type: 'Number[]',
      label: 'Sort Indices',
    },
  },
  params: {
    reverse: {
      type: 'boolean',
      default: false,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const list = [...inputs.list];
    const keys =
      inputs.keys ||
      list.map((item, i) => {
        if (typeof item === 'number') return item;
        if (typeof item === 'string') return item.charCodeAt(0);
        return i;
      });

    // Create array of indices
    const indexed = list.map((item, i) => ({ item, key: keys[i], index: i }));

    // Sort
    indexed.sort((a, b) => {
      const result = a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      return params.reverse ? -result : result;
    });

    // Extract sorted items and indices
    const sorted = indexed.map((x) => x.item);
    const indices = indexed.map((x) => x.index);

    return { sorted, indices };
  },
  execute: async (inputs, params, context) => {
    return sortListNode.evaluate(context, inputs, params);
  },
};

// Reverse List
export const reverseListNode: NodeDefinition = {
  id: 'Data::Reverse',
  category: 'Data',
  label: 'Reverse List',
  description: 'Reverse the order of a list',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    reversed: {
      type: 'Any[]',
      label: 'Reversed List',
    },
  },
  params: {},
  evaluate: async (ctx, inputs, _params) => {
    const reversed = [...inputs.list].reverse();
    return { reversed };
  },
  execute: async (inputs, params, context) => {
    return reverseListNode.evaluate(context, inputs, params);
  },
};

// Shift List
export const shiftListNode: NodeDefinition = {
  id: 'Data::Shift',
  category: 'Data',
  label: 'Shift List',
  description: 'Shift list items by offset',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    shifted: {
      type: 'Any[]',
      label: 'Shifted List',
    },
  },
  params: {
    offset: {
      type: 'number',
      default: 1,
      min: -100,
      max: 100,
    },
    wrap: {
      type: 'boolean',
      default: true,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const list = inputs.list;
    const offset = params.offset % list.length;

    let shifted;
    if (params.wrap) {
      if (offset > 0) {
        shifted = [...list.slice(-offset), ...list.slice(0, -offset)];
      } else {
        shifted = [...list.slice(-offset), ...list.slice(0, -offset)];
      }
    } else {
      shifted = Array(Math.abs(offset))
        .fill(null)
        .concat(list.slice(0, -Math.abs(offset)));
    }

    return { shifted };
  },
  execute: async (inputs, params, context) => {
    return shiftListNode.evaluate(context, inputs, params);
  },
};

// Cull Pattern
export const cullPatternNode: NodeDefinition = {
  id: 'Data::CullPattern',
  category: 'Data',
  label: 'Cull Pattern',
  description: 'Remove items from list based on pattern',
  inputs: {
    list: {
      type: 'Any[]',
      label: 'List',
      required: true,
    },
    pattern: {
      type: 'Boolean[]',
      label: 'Cull Pattern',
      required: true,
    },
  },
  outputs: {
    culled: {
      type: 'Any[]',
      label: 'Culled List',
    },
    removed: {
      type: 'Any[]',
      label: 'Removed Items',
    },
  },
  params: {
    invert: {
      type: 'boolean',
      default: false,
    },
  },
  evaluate: async (ctx, inputs, params) => {
    const list = inputs.list;
    const pattern = inputs.pattern;
    const invert = params.invert;

    const culled = [];
    const removed = [];

    list.forEach((item, i) => {
      const keep = pattern[i % pattern.length];
      if ((keep && !invert) || (!keep && invert)) {
        culled.push(item);
      } else {
        removed.push(item);
      }
    });

    return { culled, removed };
  },
  execute: async (inputs, params, context) => {
    return cullPatternNode.evaluate(context, inputs, params);
  },
};

// Weave
export const weaveNode: NodeDefinition = {
  id: 'Data::Weave',
  category: 'Data',
  label: 'Weave',
  description: 'Weave multiple lists together',
  inputs: {
    lists: {
      type: 'Any[][]',
      label: 'Lists',
      required: true,
    },
    pattern: {
      type: 'Number[]',
      label: 'Pattern',
      required: false,
    },
  },
  outputs: {
    woven: {
      type: 'Any[]',
      label: 'Woven List',
    },
  },
  params: {},
  evaluate: async (ctx, inputs, _params) => {
    const lists = inputs.lists;
    const pattern = inputs.pattern || lists.map((_, i) => i);

    const woven = [];
    const maxLength = Math.max(...lists.map((l) => l.length));
    const indices = new Array(lists.length).fill(0);

    for (let i = 0; i < maxLength * lists.length; i++) {
      const listIndex = pattern[i % pattern.length] % lists.length;
      if (indices[listIndex] < lists[listIndex].length) {
        woven.push(lists[listIndex][indices[listIndex]]);
        indices[listIndex]++;
      }
    }

    return { woven };
  },
  execute: async (inputs, params, context) => {
    return weaveNode.evaluate(context, inputs, params);
  },
};

// Export all data nodes
export const dataNodes = [
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
];
