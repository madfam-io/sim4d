/**
 * Enhanced Parameter Validation System
 *
 * Provides comprehensive validation rules, feedback messages, and suggestions
 * for node parameters with rich user feedback.
 */

import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'ParameterValidation' });

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  valid: boolean;
  severity?: ValidationSeverity;
  message?: string;
  suggestion?: string;
  correctedValue?: any;
}

export interface ParameterConstraints {
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  integer?: boolean;
  positive?: boolean;
  nonZero?: boolean;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

/**
 * Validate a numeric parameter with comprehensive feedback
 */
export function validateNumber(
  value: any,
  constraints: ParameterConstraints = {},
  parameterName: string = 'Parameter'
): ValidationResult {
  // Check if required
  if (constraints.required && (value === undefined || value === null || value === '')) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} is required`,
      suggestion: 'Please provide a value',
    };
  }

  // Allow empty if not required
  if (!constraints.required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }

  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if valid number
  if (typeof numValue !== 'number' || isNaN(numValue)) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be a valid number`,
      suggestion: 'Enter a numeric value',
    };
  }

  // Check for infinity
  if (!isFinite(numValue)) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be a finite number`,
      suggestion: 'Value is too large',
    };
  }

  // Check if integer required
  if (constraints.integer && !Number.isInteger(numValue)) {
    const roundedValue = Math.round(numValue);
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be a whole number`,
      suggestion: `Try ${roundedValue}`,
      correctedValue: roundedValue,
    };
  }

  // Check if positive required
  if (constraints.positive && numValue < 0) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be positive`,
      suggestion: constraints.min !== undefined ? `Try ${constraints.min}` : 'Use a positive value',
      correctedValue: constraints.min !== undefined ? constraints.min : Math.abs(numValue),
    };
  }

  // Check if non-zero required
  if (constraints.nonZero && numValue === 0) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} cannot be zero`,
      suggestion: constraints.min !== undefined ? `Try ${constraints.min}` : 'Use a non-zero value',
      correctedValue: constraints.min !== undefined ? constraints.min : 1,
    };
  }

  // Check minimum value
  if (constraints.min !== undefined && numValue < constraints.min) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be at least ${constraints.min}`,
      suggestion: `Minimum value is ${constraints.min}`,
      correctedValue: constraints.min,
    };
  }

  // Check maximum value
  if (constraints.max !== undefined && numValue > constraints.max) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be at most ${constraints.max}`,
      suggestion: `Maximum value is ${constraints.max}`,
      correctedValue: constraints.max,
    };
  }

  // Check step constraint
  if (constraints.step !== undefined && constraints.min !== undefined) {
    const steps = (numValue - constraints.min) / constraints.step;
    if (!Number.isInteger(steps) && Math.abs(steps - Math.round(steps)) > 0.0001) {
      const nearestValue = constraints.min + Math.round(steps) * constraints.step;
      return {
        valid: false,
        severity: 'warning',
        message: `${parameterName} should be a multiple of ${constraints.step}`,
        suggestion: `Try ${nearestValue.toFixed(2)}`,
        correctedValue: nearestValue,
      };
    }
  }

  // Custom validator
  if (constraints.customValidator) {
    return constraints.customValidator(numValue);
  }

  return { valid: true };
}

/**
 * Validate a string parameter
 */
export function validateString(
  value: any,
  constraints: ParameterConstraints = {},
  parameterName: string = 'Parameter'
): ValidationResult {
  // Check if required
  if (constraints.required && (!value || value.trim() === '')) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} is required`,
      suggestion: 'Please enter a value',
    };
  }

  // Allow empty if not required
  if (!constraints.required && (!value || value.trim() === '')) {
    return { valid: true };
  }

  // Check pattern
  if (constraints.pattern && !constraints.pattern.test(value)) {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} format is invalid`,
      suggestion: 'Check the expected format',
    };
  }

  // Custom validator
  if (constraints.customValidator) {
    return constraints.customValidator(value);
  }

  return { valid: true };
}

/**
 * Validate a Vector3 parameter
 */
export function validateVector3(
  value: any,
  constraints: ParameterConstraints = {},
  parameterName: string = 'Vector'
): ValidationResult {
  if (!value || typeof value !== 'object') {
    return {
      valid: false,
      severity: 'error',
      message: `${parameterName} must be a valid vector`,
      suggestion: 'Provide x, y, z coordinates',
    };
  }

  // Validate each component
  const xResult = validateNumber(value.x, constraints, `${parameterName}.x`);
  if (!xResult.valid) return xResult;

  const yResult = validateNumber(value.y, constraints, `${parameterName}.y`);
  if (!yResult.valid) return yResult;

  const zResult = validateNumber(value.z, constraints, `${parameterName}.z`);
  if (!zResult.valid) return zResult;

  return { valid: true };
}

/**
 * Get validation constraints for common parameter types
 */
export function getDefaultConstraints(nodeType: string, paramName: string): ParameterConstraints {
  const type = nodeType.split('::')[1]?.toLowerCase();

  // Dimension constraints (always positive, usually >= 0.1mm)
  const dimensionConstraints: ParameterConstraints = {
    required: true,
    positive: true,
    min: 0.1,
    step: 0.1,
  };

  // Angle constraints (0-360 degrees, or -180 to 180)
  const angleConstraints: ParameterConstraints = {
    required: true,
    min: 0,
    max: 360,
    step: 1,
  };

  // Count constraints (positive integers)
  const countConstraints: ParameterConstraints = {
    required: true,
    positive: true,
    integer: true,
    min: 1,
  };

  // Radius/distance constraints
  const radiusConstraints: ParameterConstraints = {
    required: true,
    positive: true,
    nonZero: true,
    min: 0.1,
    step: 0.1,
  };

  // Map common parameter names to constraints
  const paramConstraintMap: Record<string, ParameterConstraints> = {
    width: dimensionConstraints,
    height: dimensionConstraints,
    depth: dimensionConstraints,
    length: dimensionConstraints,
    radius: radiusConstraints,
    distance: dimensionConstraints,
    angle: angleConstraints,
    count: countConstraints,
    spacing: dimensionConstraints,
    offset: dimensionConstraints,
    thickness: dimensionConstraints,
  };

  return paramConstraintMap[paramName] || { required: true };
}

/**
 * Validate parameter with automatic constraint detection
 */
export function validateParameter(
  value: any,
  paramName: string,
  nodeType: string,
  explicitConstraints?: ParameterConstraints
): ValidationResult {
  const constraints = explicitConstraints || getDefaultConstraints(nodeType, paramName);

  // Determine parameter type from name
  if (paramName.includes('angle') || paramName.includes('rotation')) {
    return validateNumber(value, constraints, paramName);
  }

  if (
    paramName.includes('count') ||
    paramName.includes('number') ||
    paramName.includes('segments')
  ) {
    return validateNumber(value, { ...constraints, integer: true }, paramName);
  }

  if (paramName === 'position' || paramName === 'scale' || paramName === 'normal') {
    return validateVector3(value, constraints, paramName);
  }

  // Default to number validation
  return validateNumber(value, constraints, paramName);
}

/**
 * Format validation message with severity icon
 */
export function formatValidationMessage(result: ValidationResult): string {
  if (result.valid) return '';

  const icon = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : 'ℹ️';

  let message = `${icon} ${result.message}`;

  if (result.suggestion) {
    message += ` (${result.suggestion})`;
  }

  return message;
}

/**
 * Get validation feedback class for styling
 */
export function getValidationClass(result: ValidationResult): string {
  if (result.valid) return 'validation-success';

  switch (result.severity) {
    case 'error':
      return 'validation-error';
    case 'warning':
      return 'validation-warning';
    case 'info':
      return 'validation-info';
    default:
      return 'validation-error';
  }
}

/**
 * Batch validate all parameters for a node
 */
export function validateNodeParameters(
  params: Record<string, any>,
  nodeType: string,
  parameterConfigs?: Array<{ name: string; constraints?: ParameterConstraints }>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  if (parameterConfigs) {
    parameterConfigs.forEach((config) => {
      const value = params[config.name];
      results[config.name] = validateParameter(value, config.name, nodeType, config.constraints);
    });
  } else {
    // Validate all parameters with auto-detected constraints
    Object.entries(params).forEach(([paramName, value]) => {
      results[paramName] = validateParameter(value, paramName, nodeType);
    });
  }

  logger.debug('Validated node parameters', {
    nodeType,
    paramCount: Object.keys(params).length,
    validCount: Object.values(results).filter((r) => r.valid).length,
    errorCount: Object.values(results).filter((r) => !r.valid && r.severity === 'error').length,
    warningCount: Object.values(results).filter((r) => !r.valid && r.severity === 'warning').length,
  });

  return results;
}
