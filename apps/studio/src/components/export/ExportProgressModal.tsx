/**
 * Export Progress Modal Component
 *
 * Displays real-time progress feedback during geometry export operations
 * with stage indicators, progress bar, and status messages.
 */

import React, { useEffect, useState } from 'react';
import { Icon } from '../icons/IconSystem';
import './ExportProgressModal.css';

export type ExportStage =
  | 'initializing'
  | 'collecting-geometry'
  | 'processing'
  | 'exporting'
  | 'finalizing'
  | 'complete'
  | 'error';

export interface ExportProgress {
  stage: ExportStage;
  progress: number; // 0-100
  message: string;
  currentItem?: string;
  totalItems?: number;
  processedItems?: number;
  error?: string;
}

export interface ExportProgressModalProps {
  isOpen: boolean;
  progress: ExportProgress;
  format: string;
  onCancel?: () => void;
  onClose?: () => void;
}

const STAGE_INFO: Record<ExportStage, { label: string; icon: string; color: string }> = {
  initializing: {
    label: 'Initializing Export',
    icon: 'computing',
    color: 'var(--color-info-500, #06b6d4)',
  },
  'collecting-geometry': {
    label: 'Collecting Geometry',
    icon: 'computing',
    color: 'var(--color-primary-500, #3b82f6)',
  },
  processing: {
    label: 'Processing Shapes',
    icon: 'computing',
    color: 'var(--color-primary-600, #2563eb)',
  },
  exporting: {
    label: 'Generating File',
    icon: 'computing',
    color: 'var(--color-primary-700, #1d4ed8)',
  },
  finalizing: {
    label: 'Finalizing',
    icon: 'computing',
    color: 'var(--color-success-500, #10b981)',
  },
  complete: {
    label: 'Export Complete',
    icon: 'success',
    color: 'var(--color-success-600, #059669)',
  },
  error: {
    label: 'Export Failed',
    icon: 'error',
    color: 'var(--color-error-500, #ef4444)',
  },
};

export function ExportProgressModal({
  isOpen,
  progress,
  format,
  onCancel,
  onClose,
}: ExportProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Track elapsed time
  useEffect(() => {
    if (isOpen && progress.stage !== 'complete' && progress.stage !== 'error') {
      if (!startTime) {
        setStartTime(Date.now());
      }

      const interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 100);

      return () => clearInterval(interval);
    } else if (progress.stage === 'complete' || progress.stage === 'error') {
      // Stop timer
      setStartTime(null);
    }
  }, [isOpen, progress.stage, startTime]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setElapsedTime(0);
      setStartTime(null);
    }
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (progress.stage === 'complete' && onClose) {
      const timeout = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [progress.stage, onClose]);

  if (!isOpen) return null;

  const stageInfo = STAGE_INFO[progress.stage];
  const isActive = progress.stage !== 'complete' && progress.stage !== 'error';
  const canCancel = isActive && onCancel;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="export-progress-overlay" onClick={canCancel ? onCancel : undefined}>
      <div
        className="export-progress-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="export-progress-title"
        aria-describedby="export-progress-description"
      >
        {/* Header */}
        <div className="export-progress-header">
          <div className="export-progress-title-wrapper">
            <Icon name={stageInfo.icon} size={24} style={{ color: stageInfo.color }} />
            <h2 id="export-progress-title" className="export-progress-title">
              {stageInfo.label}
            </h2>
          </div>
          {progress.stage === 'complete' && onClose && (
            <button className="export-progress-close-btn" onClick={onClose} aria-label="Close">
              <Icon name="x" size={20} />
            </button>
          )}
        </div>

        {/* Format Badge */}
        <div className="export-progress-format">
          Exporting to <strong>{format.toUpperCase()}</strong>
        </div>

        {/* Progress Bar */}
        {progress.stage !== 'error' && (
          <div className="export-progress-bar-container">
            <div className="export-progress-bar-track">
              <div
                className={`export-progress-bar-fill ${isActive ? 'animated' : ''}`}
                style={{
                  width: `${progress.progress}%`,
                  backgroundColor: stageInfo.color,
                }}
              >
                {progress.progress > 10 && (
                  <span className="export-progress-percentage">
                    {Math.round(progress.progress)}%
                  </span>
                )}
              </div>
            </div>
            {progress.progress <= 10 && (
              <span className="export-progress-percentage-external">
                {Math.round(progress.progress)}%
              </span>
            )}
          </div>
        )}

        {/* Status Message */}
        <p id="export-progress-description" className="export-progress-message">
          {progress.message}
        </p>

        {/* Item Counter */}
        {progress.totalItems && progress.processedItems !== undefined && (
          <div className="export-progress-counter">
            <Icon name="info" size={14} />
            Processing {progress.processedItems} of {progress.totalItems} items
          </div>
        )}

        {/* Current Item */}
        {progress.currentItem && (
          <div className="export-progress-current-item">
            <span className="export-progress-current-item-label">Current:</span>
            <code className="export-progress-current-item-value">{progress.currentItem}</code>
          </div>
        )}

        {/* Elapsed Time */}
        {isActive && elapsedTime > 0 && (
          <div className="export-progress-elapsed-time">
            <Icon name="computing" size={12} />
            Elapsed: {formatTime(elapsedTime)}
          </div>
        )}

        {/* Error Message */}
        {progress.stage === 'error' && progress.error && (
          <div className="export-progress-error">
            <Icon name="error" size={16} />
            <div className="export-progress-error-content">
              <strong>Error:</strong> {progress.error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="export-progress-actions">
          {canCancel && (
            <button className="export-progress-btn export-progress-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          )}
          {progress.stage === 'error' && onClose && (
            <button className="export-progress-btn export-progress-btn-primary" onClick={onClose}>
              Close
            </button>
          )}
          {progress.stage === 'complete' && onClose && (
            <button className="export-progress-btn export-progress-btn-success" onClick={onClose}>
              <Icon name="success" size={16} />
              Done
            </button>
          )}
        </div>

        {/* Stage Indicators */}
        <div className="export-progress-stages">
          {(
            [
              'initializing',
              'collecting-geometry',
              'processing',
              'exporting',
              'finalizing',
            ] as ExportStage[]
          ).map((stage) => {
            const isCurrentStage = progress.stage === stage;
            const isPastStage =
              [
                'initializing',
                'collecting-geometry',
                'processing',
                'exporting',
                'finalizing',
              ].indexOf(progress.stage) >
              [
                'initializing',
                'collecting-geometry',
                'processing',
                'exporting',
                'finalizing',
              ].indexOf(stage);
            const isCompleteStage = progress.stage === 'complete';

            return (
              <div
                key={stage}
                className={`export-progress-stage-indicator ${
                  isCurrentStage
                    ? 'active'
                    : isPastStage || isCompleteStage
                      ? 'complete'
                      : 'pending'
                }`}
                title={STAGE_INFO[stage].label}
              >
                {isPastStage || isCompleteStage ? (
                  <Icon name="success" size={12} />
                ) : (
                  <span className="export-progress-stage-dot" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
