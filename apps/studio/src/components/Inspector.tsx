import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { NodeInstance, NodeId } from '@brepflow/types';
import { StatusIcon } from './icons/IconSystem';
import { Icon } from './icons/IconSystem';
import { Button } from './ui/Button';
import { NodeMetricsCollector, NodePerformanceData } from '../lib/monitoring/node-metrics';
import { ErrorDiagnosticsEngine, NodeErrorDiagnostic } from '../lib/diagnostics/error-diagnostics';
import { NodeConfigurationManager } from '../lib/configuration/node-config';
import { ErrorCode } from '../lib/error-handling/types';
import { createChildLogger } from '../lib/logging/logger-instance';
import './Inspector.css';

const logger = createChildLogger({ module: 'Inspector' });

interface InspectorProps {
  selectedNode: NodeInstance | null;
  onParamChange: (nodeId: NodeId, updates: Partial<NodeInstance>) => void;
}

type ParamValue = number | string | boolean | number[];

interface ParamConfig {
  name: string;
  label: string;
  type: 'number' | 'vector3' | 'angle' | 'count' | 'text' | 'select' | 'boolean' | 'range';
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  description?: string;
  validation?: (value: ParamValue) => string | null;
}

const getNodeParameterConfig = (nodeType: string): ParamConfig[] => {
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

interface ParameterFieldProps {
  config: ParamConfig;
  value: ParamValue;
  onChange: (value: ParamValue) => void;
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
    <div style={{ marginBottom: 'var(--spacing-3)' }}>
      <label
        style={{
          display: 'block',
          marginBottom: 'var(--spacing-2)',
          fontSize: 'var(--font-size-xs)',
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
          value={value || 0}
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

export function Inspector({ selectedNode, onParamChange }: InspectorProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    parameters: true,
    preview: true,
    performance: false,
    diagnostics: false,
    configuration: false,
    inputs: false,
    outputs: false,
  });
  const [performanceData, setPerformanceData] = useState<NodePerformanceData | null>(null);
  const [diagnostics, setDiagnostics] = useState<NodeErrorDiagnostic[]>([]);
  const [showConfigurationDialog, setShowConfigurationDialog] = useState(false);

  const nodeMetricsCollector = useMemo(() => NodeMetricsCollector.getInstance(), []);
  const diagnosticsEngine = useMemo(() => ErrorDiagnosticsEngine.getInstance(), []);
  const configManager = useMemo(() => NodeConfigurationManager.getInstance(), []);

  const parameterConfigs = useMemo(() => {
    return selectedNode ? getNodeParameterConfig(selectedNode.type) : [];
  }, [selectedNode?.type]);

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

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const formatNodeType = useCallback((type: string) => {
    const parts = type.split('::');
    return parts[parts.length - 1];
  }, []);

  // Load performance data and diagnostics when node changes
  useEffect(() => {
    if (selectedNode) {
      const perfData = nodeMetricsCollector.getNodePerformanceData(selectedNode.id);
      setPerformanceData(perfData);

      const nodeHistory = diagnosticsEngine.getErrorHistory(selectedNode.id);
      setDiagnostics(nodeHistory);
    } else {
      setPerformanceData(null);
      setDiagnostics([]);
    }
  }, [selectedNode, nodeMetricsCollector, diagnosticsEngine]);

  // Define hooks before early return
  const handleParamChange = useCallback(
    (paramName: string, value: ParamValue) => {
      if (!selectedNode) return;

      const newParams = { ...selectedNode.params, [paramName]: value };

      // Real-time validation
      const fieldErrors = validateParams({ [paramName]: value });
      if (!fieldErrors[paramName] && validationErrors[paramName]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[paramName];
          return newErrors;
        });
      }

      // Update immediately for live editing
      onParamChange(selectedNode.id, {
        params: newParams,
        dirty: true,
      });
    },
    [selectedNode, validateParams, validationErrors, onParamChange]
  );

  if (!selectedNode) {
    return (
      <div className="inspector">
        <div className="inspector-empty">Select a node to view properties</div>
      </div>
    );
  }

  return (
    <div className="inspector">
      <div className="inspector-header">
        <h3>{formatNodeType(selectedNode.type)}</h3>
        <div className="inspector-type">{selectedNode.type}</div>
        <div className="inspector-id">{selectedNode.id}</div>
        <div className="inspector-status">
          <StatusIcon
            status={
              selectedNode.state?.error ? 'error' : selectedNode.dirty ? 'computing' : 'success'
            }
            size={16}
          />
          <span>
            {selectedNode.state?.error ? 'Error' : selectedNode.dirty ? 'Dirty' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Geometry Preview Section */}
      <div className="inspector-section">
        <div className="inspector-section-header" onClick={() => toggleSection('preview')}>
          <h4>Preview</h4>
          <span className={`expand-icon ${expandedSections.preview ? 'expanded' : ''}`}>▼</span>
        </div>
        {expandedSections.preview && (
          <div className="inspector-section-content">
            <div className="inspector-preview-container">
              <div className="geometry-preview-placeholder">
                <div className="preview-icon">📐</div>
                <div className="preview-text">Geometry Preview</div>
                <div className="preview-note">Preview will be available in future release</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Parameters Section */}
      {parameterConfigs.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-section-header" onClick={() => toggleSection('parameters')}>
            <h4>Parameters</h4>
            <span className={`expand-icon ${expandedSections.parameters ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.parameters && (
            <div className="inspector-section-content">
              {parameterConfigs.map((config) => (
                <ParameterField
                  key={config.name}
                  config={config}
                  value={selectedNode.params?.[config.name]}
                  onChange={(value) => handleParamChange(config.name, value)}
                  error={validationErrors[config.name]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inputs Section */}
      {selectedNode.inputs && Object.keys(selectedNode.inputs).length > 0 && (
        <div className="inspector-section">
          <div className="inspector-section-header" onClick={() => toggleSection('inputs')}>
            <h4>Inputs</h4>
            <span className={`expand-icon ${expandedSections.inputs ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.inputs && (
            <div className="inspector-section-content">
              {Object.entries(selectedNode.inputs).map(([key, value]) => (
                <div key={key} className="inspector-field">
                  <label>{key}</label>
                  <div className="inspector-value">
                    <StatusIcon status={value ? 'success' : 'error'} size={12} />
                    <span>{value ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outputs Section */}
      {selectedNode.outputs && (
        <div className="inspector-section">
          <div className="inspector-section-header" onClick={() => toggleSection('outputs')}>
            <h4>Outputs</h4>
            <span className={`expand-icon ${expandedSections.outputs ? 'expanded' : ''}`}>▼</span>
          </div>
          {expandedSections.outputs && (
            <div className="inspector-section-content">
              {Object.entries(selectedNode.outputs).map(([key, value]) => (
                <div key={key} className="inspector-field">
                  <label>{key}</label>
                  <div className="inspector-value">
                    <StatusIcon status={value ? 'success' : 'computing'} size={12} />
                    <span>{value ? 'Computed' : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance Section */}
      {performanceData && (
        <div className="inspector-section">
          <div className="inspector-section-header" onClick={() => toggleSection('performance')}>
            <h4>Performance</h4>
            <span className={`expand-icon ${expandedSections.performance ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.performance && (
            <div className="inspector-section-content">
              <div className="performance-metrics">
                <div className="metric-item">
                  <label>Compute Time</label>
                  <div className="metric-value">
                    {performanceData.metrics.averageComputeTime.toFixed(2)}ms
                    {performanceData.trends.computeTimeGrowth !== 0 && (
                      <span
                        className={`trend ${performanceData.trends.computeTimeGrowth > 0 ? 'increasing' : 'decreasing'}`}
                      >
                        {performanceData.trends.computeTimeGrowth > 0 ? '↗' : '↘'}{' '}
                        {Math.abs(performanceData.trends.computeTimeGrowth).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="metric-item">
                  <label>Memory Usage</label>
                  <div className="metric-value">
                    {(performanceData.metrics.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB
                    {performanceData.trends.memoryGrowth !== 0 && (
                      <span
                        className={`trend ${performanceData.trends.memoryGrowth > 0 ? 'increasing' : 'decreasing'}`}
                      >
                        {performanceData.trends.memoryGrowth > 0 ? '↗' : '↘'}{' '}
                        {Math.abs(performanceData.trends.memoryGrowth).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="metric-item">
                  <label>Success Rate</label>
                  <div className="metric-value">
                    {performanceData.metrics.successRate.toFixed(1)}%
                    <div
                      className={`reliability-indicator ${performanceData.trends.reliability > 90 ? 'excellent' : performanceData.trends.reliability > 75 ? 'good' : 'warning'}`}
                    >
                      {performanceData.trends.reliability > 90
                        ? '●'
                        : performanceData.trends.reliability > 75
                          ? '●'
                          : '●'}
                    </div>
                  </div>
                </div>

                <div className="metric-item">
                  <label>Evaluations</label>
                  <div className="metric-value">
                    {performanceData.metrics.evaluationCount}
                    <span className="metric-detail">total runs</span>
                  </div>
                </div>

                <div className="metric-item">
                  <label>Last Evaluated</label>
                  <div className="metric-value">
                    {new Date(performanceData.metrics.lastEvaluated).toLocaleTimeString()}
                    <span className="metric-detail">
                      {new Date(performanceData.metrics.lastEvaluated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diagnostics Section */}
      {diagnostics.length > 0 && (
        <div className="inspector-section">
          <div className="inspector-section-header" onClick={() => toggleSection('diagnostics')}>
            <h4>Diagnostics</h4>
            <span className={`expand-icon ${expandedSections.diagnostics ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.diagnostics && (
            <div className="inspector-section-content">
              {diagnostics.slice(0, 3).map((diagnostic, index) => (
                <div key={index} className={`diagnostic-item severity-${diagnostic.severity}`}>
                  <div className="diagnostic-header">
                    <Icon name="warning" size={16} />
                    <span className="diagnostic-title">{diagnostic.errorCode}</span>
                    <span className="diagnostic-time">
                      {new Date(diagnostic.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="diagnostic-message">{diagnostic.errorMessage}</div>
                  {diagnostic.suggestions.length > 0 && (
                    <div className="diagnostic-suggestions">
                      <div className="suggestion-header">Suggestions:</div>
                      {diagnostic.suggestions.slice(0, 2).map((suggestion, suggIndex) => (
                        <div key={suggIndex} className="suggestion-item">
                          <div className="suggestion-title">
                            <Icon name="success" size={12} />
                            {suggestion.title}
                          </div>
                          <div className="suggestion-description">{suggestion.description}</div>
                          {suggestion.estimatedTime && (
                            <div className="suggestion-time">
                              Est. time: {suggestion.estimatedTime}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {diagnostics.length > 3 && (
                <div className="diagnostic-more">
                  +{diagnostics.length - 3} more diagnostic entries
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Configuration Section */}
      <div className="inspector-section">
        <div className="inspector-section-header" onClick={() => toggleSection('configuration')}>
          <h4>Configuration</h4>
          <span className={`expand-icon ${expandedSections.configuration ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {expandedSections.configuration && (
          <div className="inspector-section-content">
            <div className="configuration-actions">
              <Button
                variant="secondary"
                icon="download"
                size="md"
                fullWidth
                onClick={() => {
                  const config = configManager.exportNodeConfiguration(selectedNode, {
                    author: 'Studio User',
                    notes: `Configuration exported from ${selectedNode.type} node`,
                  });
                  logger.info('Node configuration exported', {
                    nodeId: selectedNode.id,
                    nodeType: selectedNode.type,
                    configVersion: config.version,
                  });
                  // Could show a toast notification here
                }}
              >
                Export Config
              </Button>

              <Button
                variant="secondary"
                icon="upload"
                size="md"
                fullWidth
                onClick={() => setShowConfigurationDialog(true)}
              >
                Import Config
              </Button>

              <Button
                variant="secondary"
                icon="save"
                size="md"
                fullWidth
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selectedNode, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedNode.type}_${selectedNode.id}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Save to File
              </Button>
            </div>

            <div className="configuration-info">
              <div className="config-item">
                <label>Node Type</label>
                <div className="config-value">{selectedNode.type}</div>
              </div>
              <div className="config-item">
                <label>Parameters</label>
                <div className="config-value">
                  {Object.keys(selectedNode.params || {}).length} parameters
                </div>
              </div>
              <div className="config-item">
                <label>Inputs</label>
                <div className="config-value">
                  {Object.keys(selectedNode.inputs || {}).length} connections
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position Section */}
      <div className="inspector-section">
        <h4>Position</h4>
        <div className="inspector-section-content">
          <div className="inspector-field">
            <label>X</label>
            <input
              type="number"
              value={Math.round(selectedNode.position?.x || 0)}
              readOnly
              className="param-input readonly"
            />
          </div>
          <div className="inspector-field">
            <label>Y</label>
            <input
              type="number"
              value={Math.round(selectedNode.position?.y || 0)}
              readOnly
              className="param-input readonly"
            />
          </div>
        </div>
      </div>

      {/* Configuration Dialog (placeholder for now) */}
      {showConfigurationDialog && (
        <div className="config-dialog-overlay" onClick={() => setShowConfigurationDialog(false)}>
          <div className="config-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="config-dialog-header">
              <h3>Import Configuration</h3>
              <Button
                variant="ghost"
                icon="x"
                size="sm"
                onClick={() => setShowConfigurationDialog(false)}
                aria-label="Close dialog"
              />
            </div>
            <div className="config-dialog-content">
              <p>Configuration import functionality will be available in the next update.</p>
              <p>You can currently export configurations for backup and sharing.</p>
            </div>
            <div className="config-dialog-actions">
              <Button variant="secondary" onClick={() => setShowConfigurationDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
