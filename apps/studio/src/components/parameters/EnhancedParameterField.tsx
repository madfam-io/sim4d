/**
 * Enhanced Parameter Field Component
 *
 * Provides rich validation feedback with error messages, warnings, suggestions,
 * and auto-correction capabilities.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Icon } from '../icons/IconSystem';
import {
  validateParameter,
  formatValidationMessage,
  getValidationClass,
  type ValidationResult,
  type ParameterConstraints,
} from '../../utils/parameter-validation';
import './EnhancedParameterField.css';

export interface ParameterFieldConfig {
  name: string;
  label: string;
  type: 'number' | 'vector3' | 'angle' | 'count' | 'text' | 'select' | 'boolean' | 'range';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  description?: string;
  placeholder?: string;
  constraints?: ParameterConstraints;
}

export interface EnhancedParameterFieldProps {
  config: ParameterFieldConfig;
  value: any;
  onChange: (value: any) => void;
  nodeType: string;
  showLiveValidation?: boolean;
  enableAutoCorrect?: boolean;
}

export function EnhancedParameterField({
  config,
  value,
  onChange,
  nodeType,
  showLiveValidation = true,
  enableAutoCorrect = true,
}: EnhancedParameterFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true });
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Validate on value change
  useEffect(() => {
    if (showLiveValidation || !isFocused) {
      const constraints: ParameterConstraints = {
        ...config.constraints,
        min: config.min,
        max: config.max,
        step: config.step,
        required: true,
      };

      const result = validateParameter(localValue, config.name, nodeType, constraints);
      setValidationResult(result);

      // Show suggestion if there's a corrected value
      if (!result.valid && result.correctedValue !== undefined && enableAutoCorrect) {
        setShowSuggestion(true);
      } else {
        setShowSuggestion(false);
      }
    }
  }, [localValue, config, nodeType, showLiveValidation, isFocused, enableAutoCorrect]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const newValue =
        config.type === 'number' ||
        config.type === 'angle' ||
        config.type === 'count' ||
        config.type === 'range'
          ? parseFloat(e.target.value)
          : e.target.value;

      setLocalValue(newValue);

      // Only propagate valid values immediately, or all values if not showing live validation
      if (!showLiveValidation) {
        onChange(newValue);
      }
    },
    [config.type, onChange, showLiveValidation]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Validate and propagate on blur
    const constraints: ParameterConstraints = {
      ...config.constraints,
      min: config.min,
      max: config.max,
      step: config.step,
      required: true,
    };

    const result = validateParameter(localValue, config.name, nodeType, constraints);

    if (result.valid || !enableAutoCorrect) {
      onChange(localValue);
    } else if (result.correctedValue !== undefined) {
      // Auto-correct if enabled
      setLocalValue(result.correctedValue);
      onChange(result.correctedValue);
      setShowSuggestion(false);
    }
  }, [localValue, config, nodeType, onChange, enableAutoCorrect]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleApplySuggestion = useCallback(() => {
    if (validationResult.correctedValue !== undefined) {
      setLocalValue(validationResult.correctedValue);
      onChange(validationResult.correctedValue);
      setShowSuggestion(false);
    }
  }, [validationResult, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Apply suggestion with Tab key
      if (e.key === 'Tab' && showSuggestion && validationResult.correctedValue !== undefined) {
        e.preventDefault();
        handleApplySuggestion();
      }

      // Increment/decrement with arrow keys
      if (
        (config.type === 'number' || config.type === 'angle' || config.type === 'count') &&
        (e.key === 'ArrowUp' || e.key === 'ArrowDown')
      ) {
        const step = config.step || 1;
        const currentValue = typeof localValue === 'number' ? localValue : 0;
        const newValue = e.key === 'ArrowUp' ? currentValue + step : currentValue - step;

        // Clamp to min/max
        let clampedValue = newValue;
        if (config.min !== undefined) clampedValue = Math.max(clampedValue, config.min);
        if (config.max !== undefined) clampedValue = Math.min(clampedValue, config.max);

        setLocalValue(clampedValue);
        onChange(clampedValue);
      }
    },
    [config, localValue, showSuggestion, validationResult, onChange, handleApplySuggestion]
  );

  const renderInput = () => {
    const baseInputClass = `enhanced-param-input ${getValidationClass(validationResult)}`;

    switch (config.type) {
      case 'number':
      case 'angle':
      case 'count':
      case 'range':
        return (
          <div className="enhanced-param-input-wrapper">
            <input
              type="number"
              className={baseInputClass}
              value={localValue ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              min={config.min}
              max={config.max}
              step={config.step}
              placeholder={config.placeholder}
            />
            {config.unit && <span className="enhanced-param-unit">{config.unit}</span>}
            {showSuggestion && (
              <button
                type="button"
                className="enhanced-param-suggestion-btn"
                onClick={handleApplySuggestion}
                title="Apply suggested value (Tab)"
              >
                <Icon name="check" size={12} />
                {validationResult.correctedValue}
              </button>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            className={baseInputClass}
            value={localValue ?? ''}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
          >
            {config.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="enhanced-param-checkbox">
            <input
              type="checkbox"
              checked={localValue ?? false}
              onChange={(e) => {
                setLocalValue(e.target.checked);
                onChange(e.target.checked);
              }}
            />
            <span className="enhanced-param-checkbox-label">{config.label}</span>
          </label>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            className={baseInputClass}
            value={localValue ?? ''}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={config.placeholder}
          />
        );
    }
  };

  return (
    <div className="enhanced-param-field">
      {config.type !== 'boolean' && (
        <label className="enhanced-param-label">
          {config.label}
          {config.unit && <span className="enhanced-param-label-unit"> ({config.unit})</span>}
          {!validationResult.valid && validationResult.severity === 'error' && (
            <span className="enhanced-param-required-indicator" title="Required field">
              *
            </span>
          )}
        </label>
      )}

      {renderInput()}

      {config.description && !validationResult.message && (
        <div className="enhanced-param-description">
          <Icon name="info" size={12} />
          {config.description}
        </div>
      )}

      {!validationResult.valid && validationResult.message && (
        <div className={`enhanced-param-validation ${getValidationClass(validationResult)}`}>
          <Icon
            name={
              validationResult.severity === 'error'
                ? 'error'
                : validationResult.severity === 'warning'
                  ? 'warning'
                  : 'info'
            }
            size={12}
          />
          <span className="enhanced-param-validation-message">{validationResult.message}</span>
          {validationResult.suggestion && !showSuggestion && (
            <span className="enhanced-param-validation-suggestion">
              {validationResult.suggestion}
            </span>
          )}
        </div>
      )}

      {config.type === 'range' && config.min !== undefined && config.max !== undefined && (
        <div className="enhanced-param-range-labels">
          <span>{config.min}</span>
          <span>{config.max}</span>
        </div>
      )}
    </div>
  );
}
