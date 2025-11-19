/**
 * Privacy-Respecting Analytics Service
 *
 * Tracks user journey metrics to understand activation patterns:
 * - Time to first node
 * - Feature discovery
 * - Export usage
 * - Session duration
 *
 * Privacy principles:
 * - No PII collection
 * - Local storage only (no external trackers)
 * - User can opt-out via localStorage
 * - Data cleared after 30 days
 */

import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'Analytics' });

export type AnalyticsEvent =
  | 'app_loaded'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'onboarding_skill_selected'
  | 'first_node_created'
  | 'first_connection_made'
  | 'first_parameter_edited'
  | 'first_export_attempted'
  | 'first_export_completed'
  | 'template_loaded'
  | 'collaboration_joined'
  | 'error_encountered';

export interface AnalyticsMetrics {
  event: AnalyticsEvent;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface UserJourneyMetrics {
  sessionId: string;
  firstSeen: number;
  timeToFirstNode?: number; // milliseconds
  timeToFirstExport?: number;
  onboardingCompleted: boolean;
  totalNodes: number;
  totalExports: number;
  lastActive: number;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStart: number;
  private metrics: AnalyticsMetrics[] = [];
  private readonly STORAGE_KEY = 'brepflow_analytics';
  private readonly JOURNEY_KEY = 'brepflow_user_journey';
  private readonly MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.loadMetrics();
    this.initializeJourney();

    // Auto-save on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.save());
    }
  }

  /**
   * Check if user has opted out of analytics
   */
  private isOptedOut(): boolean {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem('brepflow_analytics_opt_out') === 'true';
  }

  /**
   * Opt out of analytics tracking
   */
  optOut(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('brepflow_analytics_opt_out', 'true');
    this.clearAllData();
  }

  /**
   * Opt back in to analytics tracking
   */
  optIn(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('brepflow_analytics_opt_out');
  }

  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent, metadata?: Record<string, string | number | boolean>): void {
    if (this.isOptedOut()) return;

    const metric: AnalyticsMetrics = {
      event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata,
    };

    this.metrics.push(metric);
    this.updateJourney(event, metadata);
    this.save();

    // Log in development for debugging
    if (import.meta.env.DEV) {
      logger.debug('[Analytics]', { event, metadata });
    }
  }

  /**
   * Get user journey metrics
   */
  getJourneyMetrics(): UserJourneyMetrics | null {
    if (this.isOptedOut()) return null;
    if (typeof localStorage === 'undefined') return null;

    const data = localStorage.getItem(this.JOURNEY_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Get activation metrics for product analytics
   */
  getActivationMetrics() {
    const journey = this.getJourneyMetrics();
    if (!journey) return null;

    return {
      timeToFirstNode: journey.timeToFirstNode,
      timeToFirstExport: journey.timeToFirstExport,
      onboardingCompleted: journey.onboardingCompleted,
      isActivated: !!(journey.timeToFirstNode && journey.timeToFirstNode < 300000), // < 5 min
      sessionDuration: Date.now() - this.sessionStart,
      totalNodes: journey.totalNodes,
      totalExports: journey.totalExports,
    };
  }

  /**
   * Get all events for a specific type
   */
  getEvents(eventType: AnalyticsEvent): AnalyticsMetrics[] {
    if (this.isOptedOut()) return [];
    return this.metrics.filter((m) => m.event === eventType);
  }

  /**
   * Clear all analytics data
   */
  clearAllData(): void {
    this.metrics = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.JOURNEY_KEY);
    }
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadMetrics(): void {
    if (this.isOptedOut()) return;
    if (typeof localStorage === 'undefined') return;

    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return;

    try {
      const parsed = JSON.parse(data) as AnalyticsMetrics[];
      // Filter out old metrics (> 30 days)
      const now = Date.now();
      this.metrics = parsed.filter((m) => now - m.timestamp < this.MAX_AGE_MS);
    } catch (error) {
      logger.error('Failed to load analytics metrics', error);
      this.metrics = [];
    }
  }

  private save(): void {
    if (this.isOptedOut()) return;
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      logger.error('Failed to save analytics metrics', error);
    }
  }

  private initializeJourney(): void {
    if (this.isOptedOut()) return;
    if (typeof localStorage === 'undefined') return;

    const existing = this.getJourneyMetrics();
    if (existing) return; // Already initialized

    const journey: UserJourneyMetrics = {
      sessionId: this.sessionId,
      firstSeen: Date.now(),
      onboardingCompleted: false,
      totalNodes: 0,
      totalExports: 0,
      lastActive: Date.now(),
    };

    localStorage.setItem(this.JOURNEY_KEY, JSON.stringify(journey));
  }

  private updateJourney(
    event: AnalyticsEvent,
    metadata?: Record<string, string | number | boolean>
  ): void {
    if (this.isOptedOut()) return;
    if (typeof localStorage === 'undefined') return;

    const journey = this.getJourneyMetrics();
    if (!journey) return;

    // Update based on event type
    switch (event) {
      case 'first_node_created':
        if (!journey.timeToFirstNode) {
          journey.timeToFirstNode = Date.now() - journey.firstSeen;
        }
        journey.totalNodes++;
        break;

      case 'first_export_completed':
        if (!journey.timeToFirstExport) {
          journey.timeToFirstExport = Date.now() - journey.firstSeen;
        }
        journey.totalExports++;
        break;

      case 'onboarding_completed':
        journey.onboardingCompleted = true;
        break;
    }

    journey.lastActive = Date.now();

    try {
      localStorage.setItem(this.JOURNEY_KEY, JSON.stringify(journey));
    } catch (error) {
      logger.error('Failed to update journey metrics', error);
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Convenience functions
export function trackEvent(
  event: AnalyticsEvent,
  metadata?: Record<string, string | number | boolean>
): void {
  analytics.track(event, metadata);
}

export function getActivationMetrics() {
  return analytics.getActivationMetrics();
}

export function optOutOfAnalytics(): void {
  analytics.optOut();
}

export function optInToAnalytics(): void {
  analytics.optIn();
}
