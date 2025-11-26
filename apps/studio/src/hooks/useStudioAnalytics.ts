/**
 * Studio Analytics Hook
 *
 * Integrates @madfam/analytics with Sim4D Studio for ecosystem-wide telemetry.
 * Tracks CAD-specific events: node operations, model exports, collaboration sessions.
 */

import { useCallback, useEffect } from 'react';
import {
  analytics,
  useAnalytics,
  useFeatureTracking,
  useErrorTracking,
  type AnalyticsConfig
} from '@madfam/analytics';

// CAD-specific event types
export type CADEvent =
  | 'Node Added'
  | 'Node Connected'
  | 'Node Deleted'
  | 'Model Exported'
  | 'Model Imported'
  | 'Collaboration Started'
  | 'Collaboration Ended'
  | 'Template Used'
  | 'Viewport Changed'
  | 'Parameter Changed'
  | 'Undo Performed'
  | 'Redo Performed'
  | 'Session Started'
  | 'Session Ended';

export interface NodeEventProps {
  nodeType: string;
  nodeId?: string;
  source?: 'palette' | 'copy' | 'template' | 'import';
}

export interface ExportEventProps {
  format: 'step' | 'stl' | 'obj' | 'gltf' | 'brep';
  nodeCount: number;
  fileSize?: number;
  duration?: number;
}

export interface CollaborationEventProps {
  sessionId: string;
  participantCount: number;
  role: 'host' | 'guest';
}

export interface TemplateEventProps {
  templateId: string;
  templateName: string;
  category: string;
}

// Initialize analytics for sim4d studio
const STUDIO_ANALYTICS_CONFIG: AnalyticsConfig = {
  domain: import.meta.env.VITE_ANALYTICS_DOMAIN || 'sim4d.madfam.io',
  apiHost: import.meta.env.VITE_ANALYTICS_HOST || 'https://plausible.io',
  trackLocalhost: import.meta.env.DEV,
};

let analyticsInitialized = false;

export function initializeStudioAnalytics(): void {
  if (analyticsInitialized) return;

  try {
    analytics.initialize(STUDIO_ANALYTICS_CONFIG);
    analyticsInitialized = true;
    console.log('[Analytics] Studio analytics initialized');
  } catch (error) {
    console.warn('[Analytics] Failed to initialize:', error);
  }
}

/**
 * Main hook for studio analytics
 */
export function useStudioAnalytics() {
  const baseAnalytics = useAnalytics();
  const { trackFeatureUsed, trackSearch, trackFilterApplied } = useFeatureTracking();
  const { trackError } = useErrorTracking();

  // Initialize on first use
  useEffect(() => {
    initializeStudioAnalytics();
  }, []);

  // Node operations
  const trackNodeAdded = useCallback((props: NodeEventProps) => {
    trackFeatureUsed('Node Added', props.nodeType);
    baseAnalytics.trackEventBatched('Feature Used' as any, {
      feature: 'node_added',
      node_type: props.nodeType,
      source: props.source || 'palette',
    });
  }, [baseAnalytics, trackFeatureUsed]);

  const trackNodeConnected = useCallback((sourceType: string, targetType: string) => {
    trackFeatureUsed('Node Connected', `${sourceType} → ${targetType}`);
  }, [trackFeatureUsed]);

  const trackNodeDeleted = useCallback((nodeType: string, nodeCount: number = 1) => {
    trackFeatureUsed('Node Deleted', nodeType);
    baseAnalytics.trackEventBatched('Feature Used' as any, {
      feature: 'node_deleted',
      node_type: nodeType,
      count: nodeCount.toString(),
    });
  }, [baseAnalytics, trackFeatureUsed]);

  // Model operations
  const trackModelExported = useCallback((props: ExportEventProps) => {
    baseAnalytics.trackGoal('model_export', props.fileSize);
    trackFeatureUsed('Model Exported', props.format);
    baseAnalytics.trackEventBatched('Feature Used' as any, {
      feature: 'model_exported',
      format: props.format,
      node_count: props.nodeCount.toString(),
      duration_ms: props.duration?.toString(),
    });
  }, [baseAnalytics, trackFeatureUsed]);

  const trackModelImported = useCallback((format: string, success: boolean) => {
    trackFeatureUsed('Model Imported', format);
    if (!success) {
      trackError('import_failed', format, 'medium');
    }
  }, [trackFeatureUsed, trackError]);

  // Collaboration
  const trackCollaborationStarted = useCallback((props: CollaborationEventProps) => {
    baseAnalytics.trackProductFunnelStep('demo', 'sim4d-collaboration', {
      session_id: props.sessionId,
      role: props.role,
    });
    trackFeatureUsed('Collaboration Started', props.role);
  }, [baseAnalytics, trackFeatureUsed]);

  const trackCollaborationEnded = useCallback((props: CollaborationEventProps & { duration: number }) => {
    trackFeatureUsed('Collaboration Ended', props.role);
    baseAnalytics.trackEngagement('focus', 'collaboration_session', props.duration);
  }, [baseAnalytics, trackFeatureUsed]);

  // Template usage
  const trackTemplateUsed = useCallback((props: TemplateEventProps) => {
    trackFeatureUsed('Template Used', props.templateName);
    baseAnalytics.trackEventBatched('Feature Used' as any, {
      feature: 'template_used',
      template_id: props.templateId,
      template_name: props.templateName,
      category: props.category,
    });
  }, [baseAnalytics, trackFeatureUsed]);

  // Viewport interactions
  const trackViewportChanged = useCallback((action: 'zoom' | 'pan' | 'rotate' | 'fit') => {
    // Batch viewport events to avoid noise
    baseAnalytics.trackEventBatched('Feature Used' as any, {
      feature: 'viewport_changed',
      action,
    });
  }, [baseAnalytics]);

  // Parameter changes
  const trackParameterChanged = useCallback((nodeType: string, parameterName: string) => {
    baseAnalytics.trackEventBatched('Feature Used' as any, {
      feature: 'parameter_changed',
      node_type: nodeType,
      parameter: parameterName,
    });
  }, [baseAnalytics]);

  // Node search
  const trackNodeSearch = useCallback((query: string, resultsCount: number) => {
    trackSearch(query, resultsCount, 'node_palette');
  }, [trackSearch]);

  // Node filter
  const trackNodeFilter = useCallback((category: string) => {
    trackFilterApplied('node_category', category, 'node_palette');
  }, [trackFilterApplied]);

  // Session tracking
  const trackSessionStarted = useCallback(() => {
    baseAnalytics.trackPageView();
    trackFeatureUsed('Session Started', 'studio');
  }, [baseAnalytics, trackFeatureUsed]);

  const trackSessionEnded = useCallback((duration: number, nodeCount: number) => {
    baseAnalytics.trackSessionQuality(
      Math.min(100, Math.round((nodeCount / Math.max(1, duration / 60000)) * 10)),
      {
        duration_minutes: Math.round(duration / 60000).toString(),
        node_count: nodeCount.toString(),
      }
    );
    baseAnalytics.flush();
  }, [baseAnalytics]);

  // Error tracking
  const trackStudioError = useCallback((
    error: string,
    context: 'engine' | 'viewport' | 'collaboration' | 'export' | 'import',
    severity: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    trackError(error, context, severity);
  }, [trackError]);

  return {
    // Node operations
    trackNodeAdded,
    trackNodeConnected,
    trackNodeDeleted,

    // Model operations
    trackModelExported,
    trackModelImported,

    // Collaboration
    trackCollaborationStarted,
    trackCollaborationEnded,

    // Templates
    trackTemplateUsed,

    // Viewport
    trackViewportChanged,

    // Parameters
    trackParameterChanged,

    // Search & filter
    trackNodeSearch,
    trackNodeFilter,

    // Session
    trackSessionStarted,
    trackSessionEnded,

    // Errors
    trackStudioError,

    // Direct access to base analytics
    analytics: baseAnalytics,
  };
}

export default useStudioAnalytics;
