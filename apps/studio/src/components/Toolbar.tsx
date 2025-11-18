import React from 'react';
import { useGraphStore } from '../store/graph-store';
import { Button } from './ui/Button';
import { exportGeometry, downloadFile, isExportAvailable } from '../services/wasm-export';
import { createChildLogger } from '../lib/logging/logger-instance';
import { TemplateGallery } from './templates/TemplateGallery';
import { loadTemplate } from '../utils/template-loader';
import type { Template } from '../templates/template-registry';
import { ExportProgressModal } from './export/ExportProgressModal';
import { useExportProgress } from '../hooks/useExportProgress';
import './Toolbar.css';

const logger = createChildLogger({ module: 'Toolbar' });

export function Toolbar() {
  const { evaluateGraph, clearGraph, exportGraph, importGraph, undo, redo, canUndo, canRedo } =
    useGraphStore();

  const [exportFormat, setExportFormat] = React.useState<'bflow' | 'step' | 'stl' | 'iges'>(
    'bflow'
  );
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = React.useState(false);
  const [currentExportFormat, setCurrentExportFormat] = React.useState<string>('');

  const exportProgress = useExportProgress();

  const handleEvaluate = () => {
    evaluateGraph();
  };

  const handleClear = () => {
    if (window.confirm('Clear all nodes and edges? This cannot be undone.')) {
      clearGraph();
    }
  };

  const handleExportBflow = () => {
    const graph = useGraphStore.getState().graph;
    const json = JSON.stringify(graph, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${Date.now()}.bflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCAD = async (format: 'step' | 'stl' | 'iges') => {
    try {
      // Start export progress
      setCurrentExportFormat(format);
      exportProgress.startExport(format);

      const graph = useGraphStore.getState().graph;
      const dagEngine = useGraphStore.getState().dagEngine;

      // Stage 1: Collecting geometry
      exportProgress.setStage('collecting-geometry', 'Collecting geometry from graph...');
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Find geometry outputs from DAG engine evaluation
      const geometryOutputs = dagEngine
        ? Array.from((dagEngine as any).evaluationCache?.values() || [])
            .filter((result: any) => result?.outputs?.shape || result?.outputs?.shapes)
            .map((result: any) => result.outputs.shape || result.outputs.shapes)
            .flat()
            .filter(Boolean)
        : [];

      if (geometryOutputs.length === 0) {
        exportProgress.setError('No geometry to export. Please evaluate the graph first.');
        return;
      }

      exportProgress.updateProgress({
        totalItems: geometryOutputs.length,
        processedItems: geometryOutputs.length,
      });

      // Stage 2: Check if export is available
      exportProgress.setStage('processing', 'Initializing geometry engine...');
      const exportAvailable = await isExportAvailable();
      if (!exportAvailable) {
        exportProgress.setError(
          'Geometry engine not initialized. Please wait a moment and try again.'
        );
        return;
      }

      // Stage 3: Export geometry
      exportProgress.setStage('exporting', `Generating ${format.toUpperCase()} file...`);
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        // Export geometry using WASM
        const blob = await exportGeometry(geometryOutputs, {
          format,
          binary: format === 'stl', // Use binary for STL
          precision: 0.1,
        });

        // Stage 4: Finalize
        exportProgress.setStage('finalizing', 'Preparing download...');
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Download the file
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `brepflow-export-${timestamp}.${format}`;
        downloadFile(blob, filename);

        // Complete
        exportProgress.complete();

        logger.info('Export completed successfully', { format, filename });
      } catch (exportError: unknown) {
        const errorMessage =
          exportError instanceof Error ? exportError.message : String(exportError);

        logger.error('Geometry export failed', {
          format,
          error: errorMessage,
          isNotImplemented: errorMessage?.includes('not yet implemented'),
          isNotInitialized: errorMessage?.includes('not initialized'),
        });

        // Set error with helpful message
        if (errorMessage?.includes('not yet implemented')) {
          exportProgress.setError(
            `${format.toUpperCase()} export is coming soon! The geometry engine is loaded but this specific format is still being implemented.`
          );
        } else if (errorMessage?.includes('not initialized')) {
          exportProgress.setError(
            'The geometry engine is still initializing. Please wait a moment and try again.'
          );
        } else {
          exportProgress.setError(`Export failed: ${errorMessage}`);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('Export operation failed', {
        format,
        error: errorMessage,
      });
      exportProgress.setError(`Export failed: ${errorMessage}`);
    }
  };

  const handleExport = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.bflow.json,.step,.stp,.iges,.igs,.stl';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'json' || extension === 'bflow') {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const graph = JSON.parse(e.target?.result as string);
              importGraph(graph);
            } catch (err) {
              alert('Invalid graph file');
            }
          };
          reader.readAsText(file);
        } else if (['step', 'stp', 'iges', 'igs', 'stl'].includes(extension || '')) {
          alert(
            `Import of ${extension?.toUpperCase()} files will be available once WASM geometry core is integrated.`
          );
          // TODO: When WASM is ready:
          // const geometry = await window.occtWorker.importGeometry(file);
          // createImportNode(geometry);
        }
      }
    };
    input.click();
  };

  const handleSave = () => {
    const graph = useGraphStore.getState().graph;
    localStorage.setItem('brepflow_autosave', JSON.stringify(graph));
    localStorage.setItem('brepflow_autosave_time', Date.now().toString());

    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'toolbar-toast';
    toast.textContent = 'Project saved locally';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('brepflow_autosave');
    if (saved) {
      try {
        const graph = JSON.parse(saved);
        const time = localStorage.getItem('brepflow_autosave_time');
        const date = time ? new Date(parseInt(time)).toLocaleString() : 'unknown';

        if (window.confirm(`Load autosaved project from ${date}?`)) {
          importGraph(graph);
        }
      } catch (err) {
        alert('Failed to load saved project');
      }
    } else {
      alert('No saved project found');
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    try {
      // Confirm if graph has unsaved changes
      const currentGraph = useGraphStore.getState().graph;
      if (currentGraph.nodes.length > 0) {
        const confirmed = window.confirm(
          'Loading a template will replace your current graph. Continue?'
        );
        if (!confirmed) {
          return;
        }
      }

      // Load template
      const result = await loadTemplate(template, {
        clearExisting: true,
        positionOffset: { x: 100, y: 100 },
        trackAnalytics: true,
      });

      if (result.success && result.graph) {
        importGraph(result.graph);
        setShowTemplateGallery(false);

        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'toolbar-toast';
        toast.textContent = `✅ Template "${template.name}" loaded`;
        toast.style.background = 'var(--color-success)';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        logger.info('Template loaded successfully', {
          templateId: template.id,
          templateName: template.name,
          nodeCount: result.nodeCount,
        });
      } else {
        throw new Error(result.error || 'Failed to load template');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to load template: ${errorMessage}`);
      logger.error('Template load failed', {
        templateId: template.id,
        error: errorMessage,
      });
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo()) redo();
      }
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + O: Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleImport();
      }
      // Ctrl/Cmd + E: Evaluate
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleEvaluate();
      }
      // Delete: Clear selection
      if (e.key === 'Delete' && !e.ctrlKey && !e.metaKey) {
        // TODO: Delete selected nodes
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  // Auto-save every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="toolbar" role="toolbar" aria-label="Main Toolbar">
      <div className="toolbar-group" role="group" aria-label="Graph evaluation">
        <Button
          onClick={handleEvaluate}
          variant="primary"
          icon="play"
          size="md"
          title="Evaluate Graph (Ctrl+E)"
        >
          Evaluate
        </Button>
      </div>

      <div className="toolbar-group" role="group" aria-label="History controls">
        <Button
          onClick={() => undo()}
          variant="secondary"
          icon="undo"
          size="md"
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
        >
          Undo
        </Button>
        <Button
          onClick={() => redo()}
          variant="secondary"
          icon="redo"
          size="md"
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo last action"
        >
          Redo
        </Button>
      </div>

      <div className="toolbar-group" role="group" aria-label="Project management">
        <Button
          onClick={() => setShowTemplateGallery(true)}
          variant="secondary"
          icon="template"
          size="md"
          title="Browse Templates"
          aria-label="Open template gallery"
        >
          Templates
        </Button>
        <Button
          onClick={handleSave}
          variant="secondary"
          icon="save"
          size="md"
          title="Save to Browser (Ctrl+S)"
          aria-label="Save project to browser storage"
        >
          Save
        </Button>
        <Button
          onClick={handleLoad}
          variant="secondary"
          icon="folder-open"
          size="md"
          title="Load from Browser"
          aria-label="Load project from browser storage"
        >
          Load
        </Button>
      </div>

      <div className="toolbar-group" role="group" aria-label="Import and export">
        <Button
          onClick={handleImport}
          variant="secondary"
          icon="upload"
          size="md"
          title="Import File (Ctrl+O)"
          aria-label="Import project or CAD file"
        >
          Import
        </Button>
        <div className="toolbar-dropdown" role="group" aria-label="Export menu">
          <Button
            onClick={handleExport}
            variant="secondary"
            icon="download"
            size="md"
            title="Export File"
          >
            Export ▼
          </Button>
          {showExportMenu && (
            <div className="toolbar-dropdown-menu" role="menu" aria-label="Export format selection">
              <button
                role="menuitem"
                onClick={() => {
                  handleExportBflow();
                  setShowExportMenu(false);
                }}
              >
                BrepFlow (.bflow.json)
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  handleExportCAD('step');
                  setShowExportMenu(false);
                }}
              >
                STEP (.step)
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  handleExportCAD('stl');
                  setShowExportMenu(false);
                }}
              >
                STL (.stl)
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  handleExportCAD('iges');
                  setShowExportMenu(false);
                }}
              >
                IGES (.iges)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-group" role="group" aria-label="Danger zone">
        <Button onClick={handleClear} variant="danger" icon="trash-2" size="md" title="Clear All">
          Clear
        </Button>
      </div>

      <div className="toolbar-info" role="status" aria-label="Application information">
        <span
          className="toolbar-shortcuts"
          title="Press '?' for keyboard shortcuts"
          aria-label="Keyboard shortcuts available"
        >
          ⌨️ Shortcuts
        </span>
        <span aria-label="Application version">BrepFlow Studio v0.1.0</span>
      </div>

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <div className="toolbar-modal-overlay" onClick={() => setShowTemplateGallery(false)}>
          <div className="toolbar-modal-content" onClick={(e) => e.stopPropagation()}>
            <TemplateGallery
              onTemplateSelect={handleTemplateSelect}
              onClose={() => setShowTemplateGallery(false)}
              showRecommended={true}
            />
          </div>
        </div>
      )}

      {/* Export Progress Modal */}
      <ExportProgressModal
        isOpen={
          exportProgress.isExporting ||
          exportProgress.progress.stage === 'complete' ||
          exportProgress.progress.stage === 'error'
        }
        progress={exportProgress.progress}
        format={currentExportFormat}
        onCancel={() => {
          exportProgress.setError('Export cancelled by user');
        }}
        onClose={() => {
          exportProgress.reset();
        }}
      />
    </nav>
  );
}
