/**
 * Export Progress Hook
 *
 * Manages export progress state and provides utilities for tracking
 * multi-stage export operations with progress feedback.
 */

import { useState, useCallback, useRef } from 'react';
import type { ExportProgress, ExportStage } from '../components/export/ExportProgressModal';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'ExportProgress' });

export interface ExportProgressHook {
  progress: ExportProgress;
  isExporting: boolean;
  startExport: (format: string) => void;
  updateProgress: (updates: Partial<ExportProgress>) => void;
  setStage: (stage: ExportStage, message?: string) => void;
  incrementProgress: (amount: number) => void;
  setError: (error: string) => void;
  complete: () => void;
  reset: () => void;
}

const INITIAL_PROGRESS: ExportProgress = {
  stage: 'initializing',
  progress: 0,
  message: 'Preparing export...',
};

export function useExportProgress(): ExportProgressHook {
  const [progress, setProgress] = useState<ExportProgress>(INITIAL_PROGRESS);
  const [isExporting, setIsExporting] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const startExport = useCallback((format: string) => {
    logger.info('Export started', { format });
    startTimeRef.current = Date.now();
    setIsExporting(true);
    setProgress({
      stage: 'initializing',
      progress: 0,
      message: `Initializing ${format.toUpperCase()} export...`,
    });
  }, []);

  const updateProgress = useCallback((updates: Partial<ExportProgress>) => {
    setProgress((prev) => {
      const newProgress = { ...prev, ...updates };
      logger.debug('Export progress updated', {
        stage: newProgress.stage,
        progress: newProgress.progress,
        message: newProgress.message,
      });
      return newProgress;
    });
  }, []);

  const setStage = useCallback(
    (stage: ExportStage, message?: string) => {
      const stageMessages: Record<ExportStage, string> = {
        initializing: 'Preparing export...',
        'collecting-geometry': 'Collecting geometry data...',
        processing: 'Processing shapes...',
        exporting: 'Generating file...',
        finalizing: 'Finalizing export...',
        complete: 'Export completed successfully!',
        error: 'Export failed',
      };

      const stageProgress: Record<ExportStage, number> = {
        initializing: 10,
        'collecting-geometry': 30,
        processing: 50,
        exporting: 70,
        finalizing: 90,
        complete: 100,
        error: 0,
      };

      updateProgress({
        stage,
        progress: stageProgress[stage],
        message: message || stageMessages[stage],
      });

      logger.debug('Export stage changed', { stage, progress: stageProgress[stage] });
    },
    [updateProgress]
  );

  const incrementProgress = useCallback((amount: number) => {
    setProgress((prev) => ({
      ...prev,
      progress: Math.min(100, prev.progress + amount),
    }));
  }, []);

  const setError = useCallback(
    (error: string) => {
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      logger.error('Export failed', { error, elapsedMs: elapsed });

      updateProgress({
        stage: 'error',
        error,
        message: 'Export failed',
      });
      setIsExporting(false);
    },
    [updateProgress]
  );

  const complete = useCallback(() => {
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    logger.info('Export completed', { elapsedMs: elapsed });

    updateProgress({
      stage: 'complete',
      progress: 100,
      message: 'Export completed successfully!',
    });
    setIsExporting(false);
  }, [updateProgress]);

  const reset = useCallback(() => {
    logger.debug('Export progress reset');
    setProgress(INITIAL_PROGRESS);
    setIsExporting(false);
    startTimeRef.current = null;
  }, []);

  return {
    progress,
    isExporting,
    startExport,
    updateProgress,
    setStage,
    incrementProgress,
    setError,
    complete,
    reset,
  };
}

/**
 * Helper function to simulate export progress for demonstration
 * In production, this would be replaced with real WASM export progress callbacks
 */
export async function simulateExportProgress(
  progressHook: ExportProgressHook,
  durationMs: number = 3000
): Promise<void> {
  const stages: ExportStage[] = [
    'initializing',
    'collecting-geometry',
    'processing',
    'exporting',
    'finalizing',
  ];

  const stageDelay = durationMs / stages.length;

  for (const stage of stages) {
    progressHook.setStage(stage);
    await new Promise((resolve) => setTimeout(resolve, stageDelay));
  }

  progressHook.complete();
}
