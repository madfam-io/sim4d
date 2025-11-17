/**
 * Session Controls Component
 *
 * UI for session sharing and geometry export
 */

import React, { useState } from 'react';
import { useSession } from '../hooks/useSession';

export function SessionControls() {
  const { sessionId, graph, getShareUrl } = useSession();
  const [exporting, setExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Export geometry to file
   */
  async function handleExport(format: 'step' | 'stl') {
    if (!sessionId || !graph) {
      console.warn('[SessionControls] Cannot export: no active session');
      return;
    }

    setExporting(true);

    try {
      const API_BASE_URL =
        import.meta.env['VITE_API_BASE_URL'] ||
        (import.meta.env['PROD'] ? '' : 'http://localhost:8080');

      // If no API server configured, export is not available in production
      if (!API_BASE_URL) {
        throw new Error(
          'Export feature requires collaboration server - not available in offline mode'
        );
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Download file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `design.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[SessionControls] Export error:', error);
      alert(
        `Failed to export ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setExporting(false);
    }
  }

  /**
   * Copy share URL to clipboard
   */
  async function handleShare() {
    const shareUrl = getShareUrl();
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('[SessionControls] Failed to copy share URL:', error);
      alert('Failed to copy share link');
    }
  }

  if (!sessionId) {
    return null;
  }

  return (
    <div
      className="session-controls"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000,
      }}
    >
      {/* Export Buttons */}
      <div style={{ display: 'flex', gap: '5px' }}>
        <button
          onClick={() => handleExport('step')}
          disabled={exporting || !graph || graph.nodes.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
          title="Export geometry as STEP file (CAD interchange format)"
        >
          {exporting ? '...' : 'Export STEP'}
        </button>

        <button
          onClick={() => handleExport('stl')}
          disabled={exporting || !graph || graph.nodes.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: exporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
          title="Export geometry as STL file (3D printing format)"
        >
          {exporting ? '...' : 'Export STL'}
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        style={{
          padding: '8px 16px',
          backgroundColor: copySuccess ? '#4CAF50' : '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'background-color 0.2s',
        }}
        title="Copy shareable link to clipboard"
      >
        {copySuccess ? '✓ Copied!' : '🔗 Share'}
      </button>

      {/* Session ID Display */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666',
          fontFamily: 'monospace',
        }}
      >
        Session: {sessionId.slice(0, 8)}
      </div>
    </div>
  );
}
