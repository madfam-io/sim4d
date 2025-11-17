/**
 * Script Node IDE Component
 * Advanced IDE for creating and editing scripted nodes
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Panel } from '../ui/Panel';
import { IconButton } from '../ui/Button';
import { Icon } from '../icons/IconSystem';
import type {
  ScriptedNodeDefinition,
  ScriptTemplate,
  ScriptValidationResult,
  ScriptExecutionResult,
  ScriptLanguage,
  ScriptPermissions,
  ScriptMetadata,
} from '@brepflow/engine-core';
import './ScriptNodeIDE.css';

// Import the actual script engine
import { BrepFlowScriptEngine } from '@brepflow/engine-core';
import { createChildLogger } from '../../lib/logging/logger-instance';

const scriptEngine = new BrepFlowScriptEngine();
const logger = createChildLogger({ module: 'ScriptNodeIDE' });

interface ScriptNodeIDEProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeCreated: (node: ScriptedNodeDefinition) => void;
  initialTemplate?: string;
  editingNode?: ScriptedNodeDefinition;
}

interface EditorTab {
  id: string;
  label: string;
  content: string;
  language: ScriptLanguage;
  modified: boolean;
}

export const ScriptNodeIDE: React.FC<ScriptNodeIDEProps> = ({
  isOpen,
  onClose,
  onNodeCreated,
  initialTemplate,
  editingNode,
}) => {
  // State management
  const [currentTab, setCurrentTab] = useState('editor');
  const [script, setScript] = useState('');
  const [language, setLanguage] = useState<ScriptLanguage>('javascript');
  const [metadata, setMetadata] = useState<ScriptMetadata>({
    name: 'CustomNode',
    description: 'A custom scripted node',
    author: 'User',
    version: '1.0.0',
    category: 'Custom',
    tags: [],
  });
  const [permissions, setPermissions] = useState<ScriptPermissions>({
    allowFileSystem: false,
    allowNetworkAccess: false,
    allowGeometryAPI: true,
    allowWorkerThreads: false,
    memoryLimitMB: 100,
    timeoutMS: 5000,
    allowedImports: [],
  });
  const [validationResult, setValidationResult] = useState<ScriptValidationResult | null>(null);
  const [executionResult, setExecutionResult] = useState<ScriptExecutionResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [editorTabs, setEditorTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('main');

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const validationTimeoutRef = useRef<number>();

  // Available templates and languages
  const templates = useMemo(() => scriptEngine.getTemplates(), []);
  const supportedLanguages = useMemo(() => scriptEngine.getSupportedLanguages(), []);

  // Initialize component
  useEffect(() => {
    if (isOpen) {
      if (editingNode) {
        // Load existing node for editing
        setScript(editingNode.script);
        setLanguage(editingNode.scriptLanguage);
        setMetadata(editingNode.metadata);
        setPermissions(editingNode.permissions);
      } else if (initialTemplate) {
        // Load template
        const template = templates.find((t: any) => t.name === initialTemplate);
        if (template) {
          setScript(template.template);
          setLanguage(template.language);
          setMetadata((prev) => ({
            ...prev,
            category: template.category,
          }));
          setPermissions((prev) => ({
            ...prev,
            ...template.requiredPermissions,
          }));
        }
      } else {
        // Reset to default
        setScript(templates.find((t: any) => t.name === 'Empty Script')?.template || '');
      }

      // Initialize main tab
      setEditorTabs([
        {
          id: 'main',
          label: 'Main Script',
          content: script,
          language,
          modified: false,
        },
      ]);
    }
  }, [isOpen, editingNode, initialTemplate, templates, language, script]);

  // Auto-validation on script change
  useEffect(() => {
    if (script.trim()) {
      // Debounce validation
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = window.setTimeout(() => {
        validateScript();
      }, 1000);
    }

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [script]);

  // Script validation
  const validateScript = useCallback(async () => {
    if (!script.trim()) return;

    setIsValidating(true);
    try {
      const executor = (scriptEngine as any).executors.get(language);
      if (executor) {
        const result = await executor.validate(script);
        setValidationResult(result);
      }
    } catch (error) {
      logger.error('Script validation error', {
        error: error instanceof Error ? error.message : String(error),
        language,
      });
    } finally {
      setIsValidating(false);
    }
  }, [script, language]);

  // Script testing
  const testScript = useCallback(async () => {
    setIsTesting(true);
    try {
      // Create sandbox for testing
      const sandbox = await scriptEngine.createSandbox(permissions);

      // Mock context for testing
      const mockContext = {
        script: {
          log: (message: string) => logger.debug('Script log', { message }),
          progress: (value: number) => logger.debug('Script progress', { progress: value }),
          createVector: (x: number, y: number, z: number) => ({ x, y, z }),
          measureDistance: (p1: any, p2: any) =>
            Math.sqrt(
              Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2)
            ),
          getParameter: (name: string, defaultValue?: any) => defaultValue,
          setOutput: (name: string, value: any) => logger.debug('Script output', { name, value }),
          getInput: (name: string) => undefined,
          sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
          timeout: (promise: Promise<any>, ms: number) =>
            Promise.race([
              promise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
            ]),
          startTimer: (label: string) => {
            const start = performance.now();
            return () => performance.now() - start;
          },
          recordMetric: (name: string, value: number) =>
            logger.debug('Script metric', { name, value }),
        },
        runtime: {
          nodeId: 'test-node',
          executionId: 'test-execution',
          startTime: Date.now(),
          memoryUsage: () => 0,
          isAborted: () => false,
        },
        geom: {
          invoke: async (operation: string, params: any) => {
            logger.debug('Mock geometry operation', { operation, params });
            return { mockResult: true };
          },
        },
      } as any;

      const result = await sandbox.execute(script, mockContext, permissions);
      setExecutionResult(result);

      await scriptEngine.destroySandbox(sandbox);
    } catch (error) {
      setExecutionResult({
        success: false,
        outputs: {},
        logs: [],
        metrics: [],
        executionTime: 0,
        memoryUsage: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsTesting(false);
    }
  }, [script, permissions]);

  // Create/Update node
  const createNode = useCallback(async () => {
    try {
      const nodeDefinition = await scriptEngine.compileNodeFromScript(
        script,
        metadata,
        permissions
      );

      onNodeCreated(nodeDefinition);
      onClose();
    } catch (error) {
      logger.error('Node creation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      alert(`Failed to create node: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [script, metadata, permissions, onNodeCreated, onClose]);

  // Template loading
  const loadTemplate = useCallback((template: ScriptTemplate) => {
    setScript(template.template);
    setLanguage(template.language as ScriptLanguage);
    setMetadata((prev) => ({
      ...prev,
      category: template.category,
    }));
    setPermissions((prev) => ({
      ...prev,
      ...template.requiredPermissions,
    }));
    setShowTemplates(false);
  }, []);

  // Editor features
  const insertCode = useCallback(
    (code: string) => {
      if (editorRef.current) {
        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newScript = script.substring(0, start) + code + script.substring(end);
        setScript(newScript);

        // Restore cursor position
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + code.length, start + code.length);
        }, 0);
      }
    },
    [script]
  );

  const formatCode = useCallback(async () => {
    try {
      const executor = (scriptEngine as any).executors.get(language);
      if (executor && executor.formatCode) {
        const formatted = await executor.formatCode(script);
        setScript(formatted);
      }
    } catch (error) {
      logger.error('Code formatting error', {
        error: error instanceof Error ? error.message : String(error),
        language,
      });
    }
  }, [script, language]);

  if (!isOpen) return null;

  return (
    <div className="script-node-ide-overlay">
      <div className="script-node-ide">
        {/* Header */}
        <div className="ide-header">
          <div className="ide-title">
            <Icon name="code" size={20} />
            <span>{editingNode ? 'Edit Script Node' : 'Create Script Node'}</span>
          </div>
          <div className="ide-actions">
            <IconButton
              icon="template"
              size="sm"
              variant="ghost"
              onClick={() => setShowTemplates(true)}
              title="Load Template"
              aria-label="Load Template"
            />
            <IconButton
              icon="settings"
              size="sm"
              variant="ghost"
              onClick={() => setShowPermissions(true)}
              title="Permissions"
              aria-label="Permissions"
            />
            <IconButton
              icon="x"
              size="sm"
              variant="ghost"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="ide-content">
          {/* Left panel - Editor */}
          <div className="ide-editor-panel">
            {/* Tab bar */}
            <div className="editor-tab-bar">
              <div className="tab-list">
                {editorTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`editor-tab ${activeTabId === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <span>{tab.label}</span>
                    {tab.modified && <span className="tab-modified">●</span>}
                  </button>
                ))}
              </div>
              <div className="tab-actions">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as ScriptLanguage)}
                  className="language-selector"
                >
                  {supportedLanguages.map((lang: string) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code editor */}
            <div className="code-editor">
              <textarea
                ref={editorRef}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="code-textarea"
                placeholder="Enter your script here..."
                spellCheck={false}
              />

              {/* Editor toolbar */}
              <div className="editor-toolbar">
                <IconButton
                  icon="play"
                  size="sm"
                  variant="primary"
                  onClick={testScript}
                  disabled={isTesting}
                  title="Test Script"
                  aria-label="Test Script"
                />
                <IconButton
                  icon="check"
                  size="sm"
                  variant="ghost"
                  onClick={validateScript}
                  disabled={isValidating}
                  title="Validate Script"
                  aria-label="Validate Script"
                />
                <IconButton
                  icon="code"
                  size="sm"
                  variant="ghost"
                  onClick={formatCode}
                  aria-label="Format Code"
                  title="Format Code"
                />
              </div>
            </div>
          </div>

          {/* Right panel - Properties and results */}
          <div className="ide-properties-panel">
            {/* Tab navigation */}
            <div className="properties-tabs">
              <button
                className={`properties-tab ${currentTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setCurrentTab('metadata')}
              >
                Metadata
              </button>
              <button
                className={`properties-tab ${currentTab === 'validation' ? 'active' : ''}`}
                onClick={() => setCurrentTab('validation')}
              >
                Validation
              </button>
              <button
                className={`properties-tab ${currentTab === 'testing' ? 'active' : ''}`}
                onClick={() => setCurrentTab('testing')}
              >
                Testing
              </button>
            </div>

            {/* Tab content */}
            <div className="properties-content">
              {currentTab === 'metadata' && (
                <div className="metadata-panel">
                  <div className="form-group">
                    <label>Node Name</label>
                    <input
                      type="text"
                      value={metadata.name}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={metadata.description}
                      onChange={(e) =>
                        setMetadata((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={metadata.category}
                      onChange={(e) =>
                        setMetadata((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Version</label>
                    <input
                      type="text"
                      value={metadata.version}
                      onChange={(e) =>
                        setMetadata((prev) => ({ ...prev, version: e.target.value }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={metadata.tags.join(', ')}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          tags: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {currentTab === 'validation' && (
                <div className="validation-panel">
                  {isValidating ? (
                    <div className="validation-loading">
                      <Icon name="loading" size={20} />
                      <span>Validating script...</span>
                    </div>
                  ) : validationResult ? (
                    <div className="validation-results">
                      <div
                        className={`validation-status ${validationResult.valid ? 'valid' : 'invalid'}`}
                      >
                        <Icon name={validationResult.valid ? 'check' : 'x'} size={16} />
                        <span>{validationResult.valid ? 'Valid' : 'Invalid'}</span>
                      </div>

                      {validationResult.errors && validationResult.errors.length > 0 && (
                        <div className="validation-errors">
                          <h4>Errors:</h4>
                          {validationResult.errors.map((error: any, index: number) => (
                            <div key={index} className="validation-message error">
                              <Icon name="x-circle" size={14} />
                              <span>
                                {typeof error === 'string'
                                  ? error
                                  : `Line ${error.line}: ${error.message}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {validationResult.warnings && validationResult.warnings.length > 0 && (
                        <div className="validation-warnings">
                          <h4>Warnings:</h4>
                          {validationResult.warnings.map((warning: any, index: number) => (
                            <div key={index} className="validation-message warning">
                              <Icon name="alert-triangle" size={14} />
                              <span>
                                {typeof warning === 'string'
                                  ? warning
                                  : `Line ${warning.line}: ${warning.message}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="validation-empty">
                      <Icon name="info" size={20} />
                      <span>Script validation will appear here</span>
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'testing' && (
                <div className="testing-panel">
                  {isTesting ? (
                    <div className="testing-loading">
                      <Icon name="loading" size={20} />
                      <span>Testing script...</span>
                    </div>
                  ) : executionResult ? (
                    <div className="testing-results">
                      <div
                        className={`testing-status ${executionResult.success ? 'success' : 'error'}`}
                      >
                        <Icon name={executionResult.success ? 'check' : 'x'} size={16} />
                        <span>{executionResult.success ? 'Success' : 'Failed'}</span>
                        <span className="execution-time">
                          ({executionResult.executionTime.toFixed(2)}ms)
                        </span>
                      </div>

                      {executionResult.error && (
                        <div className="testing-error">
                          <h4>Error:</h4>
                          <pre>
                            {typeof executionResult.error === 'string'
                              ? executionResult.error
                              : (executionResult.error as any)?.message ||
                                String(executionResult.error)}
                          </pre>
                        </div>
                      )}

                      {executionResult.logs.length > 0 && (
                        <div className="testing-logs">
                          <h4>Logs:</h4>
                          {executionResult.logs.map((log: any, index: number) => (
                            <div key={index} className={`log-entry ${log.level}`}>
                              <span className="log-level">[{log.level.toUpperCase()}]</span>
                              <span className="log-message">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {Object.keys(executionResult.outputs).length > 0 && (
                        <div className="testing-outputs">
                          <h4>Outputs:</h4>
                          <pre>{JSON.stringify(executionResult.outputs, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="testing-empty">
                      <Icon name="play" size={20} />
                      <span>Click the test button to run your script</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ide-footer">
          <div className="footer-info">
            <span>{script.split('\n').length} lines</span>
            <span>{script.length} characters</span>
            {validationResult && (
              <span className={validationResult.valid ? 'valid' : 'invalid'}>
                {validationResult.valid ? '✓ Valid' : '✗ Invalid'}
              </span>
            )}
          </div>
          <div className="footer-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={createNode}
              disabled={!validationResult?.valid || !metadata.name.trim()}
            >
              {editingNode ? 'Update Node' : 'Create Node'}
            </button>
          </div>
        </div>

        {/* Template selector modal */}
        {showTemplates && (
          <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Select Template</h3>
                <IconButton
                  icon="x"
                  size="sm"
                  variant="ghost"
                  aria-label="Close template selection"
                  onClick={() => setShowTemplates(false)}
                />
              </div>
              <div className="modal-body">
                <div className="template-grid">
                  {templates.map((template: any) => (
                    <div
                      key={template.name}
                      className="template-card"
                      onClick={() => loadTemplate(template)}
                    >
                      <h4>{template.name}</h4>
                      <p>{template.description}</p>
                      <div className="template-meta">
                        <span className="template-language">{template.language}</span>
                        <span className="template-category">{template.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions modal */}
        {showPermissions && (
          <div className="modal-overlay" onClick={() => setShowPermissions(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Script Permissions</h3>
                <IconButton
                  icon="x"
                  size="sm"
                  variant="ghost"
                  aria-label="Close permissions dialog"
                  onClick={() => setShowPermissions(false)}
                />
              </div>
              <div className="modal-body">
                <div className="permissions-grid">
                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={permissions.allowGeometryAPI}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowGeometryAPI: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow Geometry API</span>
                    <small>Access to geometry operations</small>
                  </label>

                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={permissions.allowFileSystem}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowFileSystem: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow File System</span>
                    <small>Read/write files</small>
                  </label>

                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={permissions.allowNetworkAccess}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowNetworkAccess: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow Network Access</span>
                    <small>Make HTTP requests</small>
                  </label>

                  <label className="permission-item">
                    <input
                      type="checkbox"
                      checked={permissions.allowWorkerThreads}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowWorkerThreads: e.target.checked,
                        }))
                      }
                    />
                    <span>Allow Worker Threads</span>
                    <small>Use setTimeout/setInterval</small>
                  </label>

                  <div className="permission-item">
                    <label>Memory Limit (MB)</label>
                    <input
                      type="number"
                      value={permissions.memoryLimitMB}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          memoryLimitMB: parseInt(e.target.value) || 100,
                        }))
                      }
                      min={1}
                      max={1000}
                    />
                  </div>

                  <div className="permission-item">
                    <label>Timeout (ms)</label>
                    <input
                      type="number"
                      value={permissions.timeoutMS}
                      onChange={(e) =>
                        setPermissions((prev) => ({
                          ...prev,
                          timeoutMS: parseInt(e.target.value) || 5000,
                        }))
                      }
                      min={1000}
                      max={60000}
                      step={1000}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowPermissions(false)}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
