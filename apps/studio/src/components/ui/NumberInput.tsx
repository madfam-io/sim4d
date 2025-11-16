import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../icons/IconSystem';
import './Input.css';

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'value' | 'size'
  > {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  showSteppers?: boolean;
  label?: string;
  helpText?: string;
  errorText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'technical' | 'measurement';
  unit?: string;
  loading?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onValueChange,
      min,
      max,
      step = 1,
      precision,
      showSteppers = false,
      label,
      helpText,
      errorText,
      size = 'md',
      variant = 'default',
      unit,
      loading = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      value !== undefined ? String(value) : ''
    );
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused && value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      if (newValue === '') {
        onValueChange?.(undefined);
      } else {
        const parsed = parseFloat(newValue);
        if (!isNaN(parsed)) {
          const clamped = clampValue(parsed);
          onValueChange?.(clamped);
        }
      }
    };

    const clampValue = (val: number): number => {
      let result = val;
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      if (precision !== undefined) {
        result = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);
      }
      return result;
    };

    const handleStep = (direction: 'up' | 'down') => {
      const current = value ?? 0;
      const newValue = direction === 'up' ? current + step : current - step;
      const clamped = clampValue(newValue);
      onValueChange?.(clamped);
      setInternalValue(String(clamped));
    };

    const inputClasses = [
      'form-input',
      `form-input-${size}`,
      `form-input-${variant}`,
      showSteppers && 'form-input-with-steppers',
      errorText && 'form-input-error',
      loading && 'form-input-loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="form-label-required">*</span>}
          </label>
        )}
        <div className="form-input-wrapper">
          <div className="form-input-container">
            <input
              ref={ref}
              type="number"
              className={inputClasses}
              value={internalValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              min={min}
              max={max}
              step={step}
              disabled={disabled || loading}
              aria-invalid={!!errorText}
              aria-describedby={helpText ? `${props.id}-help` : undefined}
              {...props}
            />
            {unit && <span className="form-input-unit">{unit}</span>}
            {loading && (
              <div className="form-input-loading-indicator">
                <Icon name="loader" size={14} />
              </div>
            )}
          </div>
          {showSteppers && (
            <div className="number-input-steppers">
              <button
                type="button"
                className="number-input-stepper number-input-stepper-up"
                onClick={() => handleStep('up')}
                disabled={disabled || loading || (max !== undefined && (value ?? 0) >= max)}
                tabIndex={-1}
                aria-label="Increase value"
              />
              <button
                type="button"
                className="number-input-stepper number-input-stepper-down"
                onClick={() => handleStep('down')}
                disabled={disabled || loading || (min !== undefined && (value ?? 0) <= min)}
                tabIndex={-1}
                aria-label="Decrease value"
              />
            </div>
          )}
        </div>
        {helpText && !errorText && (
          <div id={`${props.id}-help`} className="form-help-text">
            {helpText}
          </div>
        )}
        {errorText && (
          <div className="form-error-text" role="alert">
            <Icon name="alert-circle" size={14} />
            {errorText}
          </div>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export interface CoordinateInputProps {
  value?: { x?: number; y?: number; z?: number };
  onChange?: (value: { x?: number; y?: number; z?: number }) => void;
  labels?: { x?: string; y?: string; z?: string };
  unit?: string;
  precision?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({
  value = {},
  onChange,
  labels = { x: 'X', y: 'Y', z: 'Z' },
  unit = 'mm',
  precision = 2,
  disabled = false,
  size = 'md',
}) => {
  const handleChange = (axis: 'x' | 'y' | 'z', val: number | undefined) => {
    onChange?.({
      ...value,
      [axis]: val,
    });
  };

  return (
    <div className="coordinate-input-group">
      <NumberInput
        label={labels.x}
        value={value.x}
        onValueChange={(val) => handleChange('x', val)}
        precision={precision}
        unit={unit}
        disabled={disabled}
        size={size}
        showSteppers
      />
      <NumberInput
        label={labels.y}
        value={value.y}
        onValueChange={(val) => handleChange('y', val)}
        precision={precision}
        unit={unit}
        disabled={disabled}
        size={size}
        showSteppers
      />
      <NumberInput
        label={labels.z}
        value={value.z}
        onValueChange={(val) => handleChange('z', val)}
        precision={precision}
        unit={unit}
        disabled={disabled}
        size={size}
        showSteppers
      />
    </div>
  );
};
