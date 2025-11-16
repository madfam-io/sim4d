// Core parameter utilities for node definitions

import type { ParamDefinition } from '@brepflow/types';

// Parameter constructor functions for node definitions
export function BoolParam(options: { default?: boolean } = {}): ParamDefinition {
  return {
    type: 'boolean',
    default: options.default ?? false,
  };
}

export function NumberParam(
  options: {
    default?: number;
    min?: number;
    max?: number;
    step?: number;
  } = {}
): ParamDefinition {
  return {
    type: 'number',
    default: options.default ?? 0,
    min: options.min,
    max: options.max,
    step: options.step,
  };
}

export function StringParam(options: { default?: string } = {}): ParamDefinition {
  return {
    type: 'string',
    default: options.default ?? '',
  };
}

export function EnumParam(options: { default?: string; options: string[] }): ParamDefinition {
  return {
    type: 'enum',
    default: options.default ?? options.options[0],
    options: options.options,
  };
}

export function Vector3Param(
  options: {
    default?: [number, number, number];
  } = {}
): ParamDefinition {
  return {
    type: 'vec3',
    default: options.default ?? [0, 0, 0],
  };
}
