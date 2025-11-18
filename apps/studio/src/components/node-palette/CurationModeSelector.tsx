import React from 'react';
import type { CurationMode } from '../../hooks/useCuratedNodeFilter';
import './CurationModeSelector.css';

export interface CurationModeSelectorProps {
  currentMode: CurationMode;
  onChange: (mode: CurationMode) => void;
  stats?: {
    activeNodeCount: number | null;
    modeName: string;
    modeDescription: string;
  };
  compact?: boolean;
  className?: string;
}

/**
 * CurationModeSelector Component
 *
 * Allows users to toggle between different node catalog views:
 * - Beginner: ~20 essential nodes for learning
 * - Intermediate: ~45 nodes for productive work
 * - Curated: ~60 most commonly used nodes
 * - All: Full 1,827+ node catalog
 *
 * Default is 'Curated' to reduce cognitive load while maintaining productivity.
 */
export function CurationModeSelector({
  currentMode,
  onChange,
  stats,
  compact = false,
  className = '',
}: CurationModeSelectorProps) {
  const modes: Array<{ value: CurationMode; label: string; icon: string; description: string }> = [
    {
      value: 'beginner',
      label: 'Beginner',
      icon: '🌱',
      description: 'Essential nodes for learning',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      icon: '⚙️',
      description: 'Common operations for productive work',
    },
    {
      value: 'curated',
      label: 'Curated',
      icon: '⭐',
      description: 'Most frequently used nodes',
    },
    {
      value: 'all',
      label: 'All Nodes',
      icon: '📚',
      description: 'Complete catalog (1,827+ nodes)',
    },
  ];

  const handleModeChange = (mode: CurationMode) => {
    onChange(mode);
  };

  return (
    <div className={`curation-mode-selector ${compact ? 'compact' : ''} ${className}`}>
      <div className="mode-selector-header">
        <label className="mode-selector-label">
          <span className="label-text">Node Catalog</span>
          {stats && stats.activeNodeCount !== null && (
            <span className="node-count-badge" title={stats.modeDescription}>
              {stats.activeNodeCount}
            </span>
          )}
        </label>
      </div>

      <div className="mode-buttons">
        {modes.map((mode) => (
          <button
            key={mode.value}
            className={`mode-button ${currentMode === mode.value ? 'active' : ''}`}
            onClick={() => handleModeChange(mode.value)}
            title={mode.description}
            aria-pressed={currentMode === mode.value}
          >
            <span className="mode-icon">{mode.icon}</span>
            {!compact && <span className="mode-label">{mode.label}</span>}
          </button>
        ))}
      </div>

      {!compact && stats && (
        <div className="mode-description">
          <span className="mode-description-text">{stats.modeDescription}</span>
        </div>
      )}
    </div>
  );
}
