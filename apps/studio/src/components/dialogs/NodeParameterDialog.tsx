import React, { useState, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Icon } from '../icons/IconSystem';

interface NodeParameterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: Record<string, unknown>) => void;
  nodeType: string;
  initialParams?: Record<string, unknown>;
}

interface ParameterConfig {
  name: string;
  label: string;
  type: 'number' | 'vector3' | 'angle' | 'count';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}

const getNodeParameterConfig = (nodeType: string): ParameterConfig[] => {
  const type = nodeType.split('::')[1]?.toLowerCase();

  switch (type) {
    case 'box':
      return [
        {
          name: 'width',
          label: 'Width',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Box width dimension',
        },
        {
          name: 'height',
          label: 'Height',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Box height dimension',
        },
        {
          name: 'depth',
          label: 'Depth',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Box depth dimension',
        },
      ];
    case 'cylinder':
      return [
        {
          name: 'radius',
          label: 'Radius',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Cylinder radius',
        },
        {
          name: 'height',
          label: 'Height',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Cylinder height',
        },
      ];
    case 'sphere':
      return [
        {
          name: 'radius',
          label: 'Radius',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Sphere radius',
        },
      ];
    case 'extrude':
      return [
        {
          name: 'distance',
          label: 'Distance',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Extrusion distance',
        },
      ];
    case 'revolve':
      return [
        {
          name: 'angle',
          label: 'Angle',
          type: 'angle',
          min: 1,
          max: 360,
          step: 1,
          unit: '°',
          description: 'Revolution angle',
        },
      ];
    case 'fillet':
      return [
        {
          name: 'radius',
          label: 'Radius',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Fillet radius',
        },
      ];
    case 'chamfer':
      return [
        {
          name: 'distance',
          label: 'Distance',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Chamfer distance',
        },
      ];
    case 'move':
      return [
        {
          name: 'x',
          label: 'X',
          type: 'number',
          step: 0.1,
          unit: 'mm',
          description: 'X translation',
        },
        {
          name: 'y',
          label: 'Y',
          type: 'number',
          step: 0.1,
          unit: 'mm',
          description: 'Y translation',
        },
        {
          name: 'z',
          label: 'Z',
          type: 'number',
          step: 0.1,
          unit: 'mm',
          description: 'Z translation',
        },
      ];
    case 'rotate':
      return [
        {
          name: 'x',
          label: 'X Rotation',
          type: 'angle',
          min: -360,
          max: 360,
          step: 1,
          unit: '°',
          description: 'Rotation around X axis',
        },
        {
          name: 'y',
          label: 'Y Rotation',
          type: 'angle',
          min: -360,
          max: 360,
          step: 1,
          unit: '°',
          description: 'Rotation around Y axis',
        },
        {
          name: 'z',
          label: 'Z Rotation',
          type: 'angle',
          min: -360,
          max: 360,
          step: 1,
          unit: '°',
          description: 'Rotation around Z axis',
        },
      ];
    case 'scale':
      return [
        {
          name: 'factor',
          label: 'Scale Factor',
          type: 'number',
          min: 0.01,
          step: 0.01,
          description: 'Uniform scale factor',
        },
      ];
    case 'lineararray':
      return [
        {
          name: 'count',
          label: 'Count',
          type: 'count',
          min: 2,
          max: 100,
          step: 1,
          description: 'Number of instances',
        },
        {
          name: 'spacing',
          label: 'Spacing',
          type: 'number',
          min: 0.1,
          step: 0.1,
          unit: 'mm',
          description: 'Distance between instances',
        },
      ];
    case 'circulararray':
      return [
        {
          name: 'count',
          label: 'Count',
          type: 'count',
          min: 2,
          max: 100,
          step: 1,
          description: 'Number of instances',
        },
        {
          name: 'angle',
          label: 'Total Angle',
          type: 'angle',
          min: 1,
          max: 360,
          step: 1,
          unit: '°',
          description: 'Total angle of array',
        },
      ];
    default:
      return [];
  }
};

const getDefaultParams = (nodeType: string): Record<string, unknown> => {
  const type = nodeType.split('::')[1]?.toLowerCase();

  switch (type) {
    case 'box':
      return { width: 100, height: 100, depth: 100 };
    case 'cylinder':
      return { radius: 50, height: 100 };
    case 'sphere':
      return { radius: 50 };
    case 'extrude':
      return { distance: 100 };
    case 'revolve':
      return { angle: 360 };
    case 'fillet':
      return { radius: 10 };
    case 'chamfer':
      return { distance: 10 };
    case 'move':
      return { x: 0, y: 0, z: 0 };
    case 'rotate':
      return { x: 0, y: 0, z: 90 };
    case 'scale':
      return { factor: 2 };
    case 'lineararray':
      return { count: 5, spacing: 50 };
    case 'circulararray':
      return { count: 6, angle: 360 };
    default:
      return {};
  }
};

// Parameter value types
type ParameterValue = number | [number, number, number] | string | boolean;

interface ParameterFieldProps {
  config: ParameterConfig;
  value: ParameterValue;
  onChange: (value: ParameterValue) => void;
  error?: string;
}

function ParameterField({ config, value, onChange, error }: ParameterFieldProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue =
        config.type === 'number' || config.type === 'angle' || config.type === 'count'
          ? parseFloat(e.target.value) || 0
          : e.target.value;
      onChange(newValue);
    },
    [config.type, onChange]
  );

  const inputStyle = {
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: `1px solid ${error ? 'var(--color-error-500)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface-primary)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-sm)',
    fontFamily: 'var(--font-family-ui)',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  };

  const focusStyle = {
    borderColor: 'var(--color-primary-500)',
    boxShadow: '0 0 0 3px var(--color-primary-100)',
  };

  return (
    <div style={{ marginBottom: 'var(--spacing-4)' }}>
      <label
        style={{
          display: 'block',
          marginBottom: 'var(--spacing-2)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)',
        }}
      >
        {config.label}
        {config.unit && (
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
            {' '}
            ({config.unit})
          </span>
        )}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type="number"
          value={value ?? 0}
          onChange={handleChange}
          min={config.min}
          max={config.max}
          step={config.step}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) =>
            Object.assign(e.target.style, {
              borderColor: error ? 'var(--color-error-500)' : 'var(--color-border)',
              boxShadow: 'none',
            })
          }
        />
        {config.unit && (
          <div
            style={{
              position: 'absolute',
              right: 'var(--spacing-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--font-size-xs)',
              pointerEvents: 'none',
            }}
          >
            {config.unit}
          </div>
        )}
      </div>

      {config.description && (
        <div
          style={{
            marginTop: 'var(--spacing-1)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {config.description}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 'var(--spacing-1)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-error-600)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
          }}
        >
          <Icon name="warning" size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

export function NodeParameterDialog({
  isOpen,
  onClose,
  onConfirm,
  nodeType,
  initialParams,
}: NodeParameterDialogProps) {
  const parameterConfigs = getNodeParameterConfig(nodeType);
  const defaultParams = getDefaultParams(nodeType);

  const [params, setParams] = useState<Record<string, unknown>>(() => ({
    ...defaultParams,
    ...initialParams,
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateParams = useCallback(
    (paramValues: Record<string, unknown>): Record<string, string> => {
      const validationErrors: Record<string, string> = {};

      parameterConfigs.forEach((config) => {
        const value = paramValues[config.name];

        if (value === undefined || value === null || value === '') {
          validationErrors[config.name] = `${config.label} is required`;
          return;
        }

        if (typeof value === 'number') {
          if (isNaN(value)) {
            validationErrors[config.name] = `${config.label} must be a number`;
            return;
          }

          if (config.min !== undefined && value < config.min) {
            validationErrors[config.name] = `${config.label} must be at least ${config.min}`;
            return;
          }

          if (config.max !== undefined && value > config.max) {
            validationErrors[config.name] = `${config.label} must be at most ${config.max}`;
            return;
          }
        }
      });

      return validationErrors;
    },
    [parameterConfigs]
  );

  const handleParamChange = useCallback(
    (paramName: string, value: ParameterValue) => {
      const newParams = { ...params, [paramName]: value };
      setParams(newParams);

      // Clear error for this field if it becomes valid
      const fieldErrors = validateParams({ [paramName]: value });
      if (!fieldErrors[paramName] && errors[paramName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[paramName];
          return newErrors;
        });
      }
    },
    [params, errors, validateParams]
  );

  const handleConfirm = useCallback(() => {
    const validationErrors = validateParams(params);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onConfirm(params);
      onClose();
    }
  }, [params, validateParams, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    setParams({ ...defaultParams, ...initialParams });
    setErrors({});
    onClose();
  }, [defaultParams, initialParams, onClose]);

  // Extract node category and operation for display
  const [category, operation] = nodeType.split('::');
  const displayTitle = operation || nodeType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Configure ${displayTitle}`}
      size="md"
      closeOnBackdrop={false}
    >
      <div style={{ minHeight: '200px' }}>
        {/* Node info header */}
        <div
          style={{
            padding: 'var(--spacing-3)',
            background: 'var(--color-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
          }}
        >
          <div
            style={{
              padding: 'var(--spacing-2)',
              background: 'var(--color-primary-100)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-primary-700)',
            }}
          >
            <Icon name="settings" size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              {displayTitle} Node
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--letter-spacing-wide)',
              }}
            >
              {category}
            </div>
          </div>
        </div>

        {/* Parameter form */}
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          {parameterConfigs.map((config) => (
            <ParameterField
              key={config.name}
              config={config}
              value={params[config.name]}
              onChange={(value) => handleParamChange(config.name, value)}
              error={errors[config.name]}
            />
          ))}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--spacing-3)',
            paddingTop: 'var(--spacing-4)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-secondary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-500)',
              color: 'white',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-500)';
            }}
          >
            <Icon name="success" size={16} />
            Create Node
          </button>
        </div>
      </div>
    </Modal>
  );
}
