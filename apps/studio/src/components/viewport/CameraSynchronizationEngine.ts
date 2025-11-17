/**
 * Camera Synchronization Engine
 *
 * Provides sophisticated camera synchronization across multiple viewports with
 * intelligent sync algorithms that preserve view characteristics and professional
 * CAD-style coordination behaviors.
 */

import type {
  ViewportCameraState,
  ViewportViewType,
  ViewportInstance,
} from './multi-viewport-interfaces';
import { createChildLogger } from '../../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'CameraSynchronizationEngine' });

// Synchronization modes for different professional workflows
export type SyncMode = 'none' | 'rotation' | 'pan' | 'zoom' | 'full' | 'orthographic-lock';

export type SyncDirection = 'xy' | 'xz' | 'yz' | 'all';

export interface SyncConfig {
  mode: SyncMode;
  direction?: SyncDirection;
  preserveOrthographic: boolean;
  interpolationSpeed: number; // 0-1, higher = faster transitions
  threshold: number; // Minimum change to trigger sync
  debounceMs: number; // Debounce interval for sync operations
}

export interface ViewportSyncSettings {
  participateInSync: boolean;
  receivesUpdates: boolean;
  sendsUpdates: boolean;
  priority: number; // Higher priority viewports take precedence
  syncConfig: SyncConfig;
}

export interface SyncEvent {
  sourceViewportId: string;
  timestamp: number;
  deltaCamera: Partial<ViewportCameraState>;
  syncMode: SyncMode;
}

export interface CameraSyncState {
  isActive: boolean;
  lastUpdateTimestamp: number;
  activeTransitions: Map<string, NodeJS.Timeout>;
  batchedUpdates: Map<string, Partial<ViewportCameraState>>;
  performanceMetrics: {
    syncLatency: number;
    updatesPerSecond: number;
    droppedFrames: number;
  };
}

// Standard view type constraints for orthographic preservation
const ORTHOGRAPHIC_CONSTRAINTS: Record<
  ViewportViewType,
  {
    position: [number, number, number];
    up: [number, number, number];
    lockAxis: 'x' | 'y' | 'z';
  }
> = {
  front: { position: [0, -1, 0], up: [0, 0, 1], lockAxis: 'y' },
  back: { position: [0, 1, 0], up: [0, 0, 1], lockAxis: 'y' },
  left: { position: [-1, 0, 0], up: [0, 0, 1], lockAxis: 'x' },
  right: { position: [1, 0, 0], up: [0, 0, 1], lockAxis: 'x' },
  top: { position: [0, 0, 1], up: [0, 1, 0], lockAxis: 'z' },
  bottom: { position: [0, 0, -1], up: [0, 1, 0], lockAxis: 'z' },
  perspective: { position: [1, -1, 1], up: [0, 0, 1], lockAxis: 'z' },
  iso: { position: [1, -1, 1], up: [0, 0, 1], lockAxis: 'z' },
};

/**
 * Core camera synchronization engine with professional CAD behaviors
 */
export class CameraSynchronizationEngine {
  private viewports = new Map<string, ViewportInstance>();
  private syncSettings = new Map<string, ViewportSyncSettings>();
  private syncState: CameraSyncState;
  private eventListeners = new Map<string, Array<(event: SyncEvent) => void>>();
  private frameRequestId: number | null = null;
  private lastFrameTime = 0;

  constructor() {
    this.syncState = {
      isActive: false,
      lastUpdateTimestamp: 0,
      activeTransitions: new Map(),
      batchedUpdates: new Map(),
      performanceMetrics: {
        syncLatency: 0,
        updatesPerSecond: 0,
        droppedFrames: 0,
      },
    };

    this.startPerformanceMonitoring();
  }

  /**
   * Register a viewport for synchronization
   */
  registerViewport(viewport: ViewportInstance, syncSettings?: Partial<ViewportSyncSettings>): void {
    this.viewports.set(viewport.id, viewport);

    const defaultSettings: ViewportSyncSettings = {
      participateInSync: true,
      receivesUpdates: true,
      sendsUpdates: true,
      priority: viewport.viewType === 'perspective' ? 10 : 5,
      syncConfig: {
        mode: 'rotation',
        direction: 'all',
        preserveOrthographic: true,
        interpolationSpeed: 0.8,
        threshold: 0.001,
        debounceMs: 16, // ~60fps
      },
    };

    this.syncSettings.set(viewport.id, {
      ...defaultSettings,
      ...syncSettings,
    });
  }

  /**
   * Unregister a viewport from synchronization
   */
  unregisterViewport(viewportId: string): void {
    this.viewports.delete(viewportId);
    this.syncSettings.delete(viewportId);
    this.eventListeners.delete(viewportId);

    // Clear any active transitions
    const timeout = this.syncState.activeTransitions.get(viewportId);
    if (timeout) {
      clearTimeout(timeout);
      this.syncState.activeTransitions.delete(viewportId);
    }

    this.syncState.batchedUpdates.delete(viewportId);
  }

  /**
   * Update sync settings for a viewport
   */
  updateSyncSettings(viewportId: string, settings: Partial<ViewportSyncSettings>): void {
    const current = this.syncSettings.get(viewportId);
    if (current) {
      this.syncSettings.set(viewportId, { ...current, ...settings });
    }
  }

  /**
   * Get current sync settings for a viewport
   */
  getSyncSettings(viewportId: string): ViewportSyncSettings | null {
    return this.syncSettings.get(viewportId) || null;
  }

  /**
   * Synchronize camera change from source viewport to all participating viewports
   */
  syncCameraChange(
    sourceViewportId: string,
    newCamera: ViewportCameraState,
    previousCamera: ViewportCameraState
  ): void {
    const sourceSettings = this.syncSettings.get(sourceViewportId);
    if (!sourceSettings?.sendsUpdates || !sourceSettings.participateInSync) {
      return;
    }

    const deltaCamera = this.calculateCameraDelta(newCamera, previousCamera);
    if (!this.isDeltaSignificant(deltaCamera, sourceSettings.syncConfig.threshold)) {
      return;
    }

    const syncEvent: SyncEvent = {
      sourceViewportId,
      timestamp: performance.now(),
      deltaCamera,
      syncMode: sourceSettings.syncConfig.mode,
    };

    this.broadcastSyncEvent(syncEvent);
  }

  /**
   * Apply synchronization to target viewports
   */
  private broadcastSyncEvent(event: SyncEvent): void {
    const sourceViewport = this.viewports.get(event.sourceViewportId);
    if (!sourceViewport) return;

    const eligibleTargets = Array.from(this.viewports.entries())
      .filter(([id, _viewport]) => {
        if (id === event.sourceViewportId) return false;

        const settings = this.syncSettings.get(id);
        return (
          settings?.participateInSync &&
          settings.receivesUpdates &&
          settings.syncConfig.mode !== 'none'
        );
      })
      .sort(([, a], [, b]) => {
        const settingsA = this.syncSettings.get(a.id)!;
        const settingsB = this.syncSettings.get(b.id)!;
        return settingsB.priority - settingsA.priority;
      });

    for (const [targetId, targetViewport] of eligibleTargets) {
      this.applySyncToViewport(targetId, targetViewport, sourceViewport, event);
    }
  }

  /**
   * Apply synchronization to a specific target viewport
   */
  private applySyncToViewport(
    targetId: string,
    targetViewport: ViewportInstance,
    sourceViewport: ViewportInstance,
    event: SyncEvent
  ): void {
    const targetSettings = this.syncSettings.get(targetId)!;
    const syncMode = this.resolveSyncMode(targetSettings.syncConfig.mode, event.syncMode);

    if (syncMode === 'none') return;

    const transformedCamera = this.transformCameraForViewport(
      sourceViewport,
      targetViewport,
      event.deltaCamera,
      syncMode
    );

    if (!transformedCamera) return;

    // Apply debouncing to prevent excessive updates
    this.debounceCameraUpdate(targetId, transformedCamera, targetSettings.syncConfig.debounceMs);
  }

  /**
   * Intelligent camera transformation that preserves viewport characteristics
   */
  private transformCameraForViewport(
    sourceViewport: ViewportInstance,
    targetViewport: ViewportInstance,
    deltaCamera: Partial<ViewportCameraState>,
    syncMode: SyncMode
  ): Partial<ViewportCameraState> | null {
    const targetConstraints = ORTHOGRAPHIC_CONSTRAINTS[targetViewport.viewType];
    const _sourceConstraints = ORTHOGRAPHIC_CONSTRAINTS[sourceViewport.viewType];

    let transformedCamera: Partial<ViewportCameraState> = {};

    switch (syncMode) {
      case 'rotation':
        transformedCamera = this.transformRotation(
          sourceViewport,
          targetViewport,
          deltaCamera,
          targetConstraints
        );
        break;

      case 'pan':
        transformedCamera = this.transformPan(
          sourceViewport,
          targetViewport,
          deltaCamera,
          targetConstraints
        );
        break;

      case 'zoom':
        transformedCamera = { zoom: deltaCamera.zoom };
        break;

      case 'full':
        transformedCamera = this.transformFull(
          sourceViewport,
          targetViewport,
          deltaCamera,
          targetConstraints
        );
        break;

      case 'orthographic-lock':
        transformedCamera = this.transformOrthographicLock(
          sourceViewport,
          targetViewport,
          deltaCamera,
          targetConstraints
        );
        break;
    }

    return Object.keys(transformedCamera).length > 0 ? transformedCamera : null;
  }

  /**
   * Transform rotation while preserving orthographic constraints
   */
  private transformRotation(
    sourceViewport: ViewportInstance,
    targetViewport: ViewportInstance,
    deltaCamera: Partial<ViewportCameraState>,
    _constraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType]
  ): Partial<ViewportCameraState> {
    if (!deltaCamera.position || !deltaCamera.target) {
      return {};
    }

    // For orthographic views, preserve axis alignment
    if (targetViewport.camera.isOrthographic) {
      return this.preserveOrthographicRotation(targetViewport, deltaCamera, constraints);
    }

    // For perspective views, apply rotation transformation
    return {
      position: this.rotateVector3(deltaCamera.position, targetViewport.camera.target),
      target: deltaCamera.target,
    };
  }

  /**
   * Transform pan while maintaining view orientation
   */
  private transformPan(
    sourceViewport: ViewportInstance,
    targetViewport: ViewportInstance,
    deltaCamera: Partial<ViewportCameraState>,
    _constraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType]
  ): Partial<ViewportCameraState> {
    if (!deltaCamera.target) return {};

    // Project pan movement onto the target viewport's plane
    const panDelta = this.projectPanToViewPlane(
      sourceViewport.viewType,
      targetViewport.viewType,
      deltaCamera.target
    );

    return {
      target: panDelta,
      position: this.adjustPositionForPan(targetViewport.camera.position, panDelta),
    };
  }

  /**
   * Transform full camera state with intelligent constraints
   */
  private transformFull(
    sourceViewport: ViewportInstance,
    targetViewport: ViewportInstance,
    deltaCamera: Partial<ViewportCameraState>,
    constraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType]
  ): Partial<ViewportCameraState> {
    // Combine rotation, pan, and zoom transformations
    const rotation = this.transformRotation(
      sourceViewport,
      targetViewport,
      deltaCamera,
      constraints
    );
    const pan = this.transformPan(sourceViewport, targetViewport, deltaCamera, constraints);
    const zoom = deltaCamera.zoom ? { zoom: deltaCamera.zoom } : {};

    return { ...rotation, ...pan, ...zoom };
  }

  /**
   * Transform with orthographic lock to maintain axis alignment
   */
  private transformOrthographicLock(
    sourceViewport: ViewportInstance,
    targetViewport: ViewportInstance,
    deltaCamera: Partial<ViewportCameraState>,
    constraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType]
  ): Partial<ViewportCameraState> {
    if (!targetViewport.camera.isOrthographic) {
      // Non-orthographic views get normal transformation
      return this.transformFull(sourceViewport, targetViewport, deltaCamera, constraints);
    }

    // Orthographic views only get pan and zoom, maintaining axis alignment
    const pan = deltaCamera.target ? { target: deltaCamera.target } : {};
    const zoom = deltaCamera.zoom ? { zoom: deltaCamera.zoom } : {};

    return { ...pan, ...zoom };
  }

  /**
   * Preserve orthographic view characteristics during rotation
   */
  private preserveOrthographicRotation(
    targetViewport: ViewportInstance,
    deltaCamera: Partial<ViewportCameraState>,
    constraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType]
  ): Partial<ViewportCameraState> {
    // Maintain the orthographic view direction but allow target changes
    return {
      target: deltaCamera.target,
      // Position maintains the orthographic constraint
      position: this.scaleVector3(constraints.position, this.getViewDistance(targetViewport)),
    };
  }

  /**
   * Project pan movement onto target viewport's view plane
   */
  private projectPanToViewPlane(
    sourceViewType: ViewportViewType,
    targetViewType: ViewportViewType,
    panDelta: [number, number, number]
  ): [number, number, number] {
    const sourceConstraints = ORTHOGRAPHIC_CONSTRAINTS[sourceViewType];
    const targetConstraints = ORTHOGRAPHIC_CONSTRAINTS[targetViewType];

    // Create transformation matrix based on view orientations
    return this.transformVector3BetweenViews(panDelta, sourceConstraints, targetConstraints);
  }

  /**
   * Calculate camera delta between two states
   */
  private calculateCameraDelta(
    newCamera: ViewportCameraState,
    previousCamera: ViewportCameraState
  ): Partial<ViewportCameraState> {
    const delta: Partial<ViewportCameraState> = {};

    if (!this.vectorsEqual(newCamera.position, previousCamera.position)) {
      delta.position = newCamera.position;
    }

    if (!this.vectorsEqual(newCamera.target, previousCamera.target)) {
      delta.target = newCamera.target;
    }

    if (!this.vectorsEqual(newCamera.up, previousCamera.up)) {
      delta.up = newCamera.up;
    }

    if (Math.abs(newCamera.fov - previousCamera.fov) > 0.1) {
      delta.fov = newCamera.fov;
    }

    if (Math.abs(newCamera.zoom - previousCamera.zoom) > 0.001) {
      delta.zoom = newCamera.zoom;
    }

    return delta;
  }

  /**
   * Check if camera delta is significant enough to warrant sync
   */
  private isDeltaSignificant(delta: Partial<ViewportCameraState>, _threshold: number): boolean {
    return (
      Object.keys(delta).length > 0 &&
      (delta.position || delta.target || delta.zoom || delta.fov) !== undefined
    );
  }

  /**
   * Debounced camera update to prevent excessive sync operations
   */
  private debounceCameraUpdate(
    viewportId: string,
    camera: Partial<ViewportCameraState>,
    debounceMs: number
  ): void {
    // Clear existing timeout
    const existingTimeout = this.syncState.activeTransitions.get(viewportId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Batch the update
    const existing = this.syncState.batchedUpdates.get(viewportId) || {};
    this.syncState.batchedUpdates.set(viewportId, { ...existing, ...camera });

    // Set new timeout
    const timeout = setTimeout(() => {
      this.flushBatchedUpdate(viewportId);
    }, debounceMs);

    this.syncState.activeTransitions.set(viewportId, timeout);
  }

  /**
   * Flush batched camera updates
   */
  private flushBatchedUpdate(viewportId: string): void {
    const batchedCamera = this.syncState.batchedUpdates.get(viewportId);
    if (!batchedCamera) return;

    const viewport = this.viewports.get(viewportId);
    if (!viewport) return;

    // Apply the batched update
    const updatedViewport: ViewportInstance = {
      ...viewport,
      camera: { ...viewport.camera, ...batchedCamera },
    };

    this.viewports.set(viewportId, updatedViewport);

    // Notify listeners
    this.notifyListeners(viewportId, {
      sourceViewportId: 'sync-engine',
      timestamp: performance.now(),
      deltaCamera: batchedCamera,
      syncMode: 'full',
    });

    // Clean up
    this.syncState.batchedUpdates.delete(viewportId);
    this.syncState.activeTransitions.delete(viewportId);
    this.syncState.lastUpdateTimestamp = performance.now();
  }

  /**
   * Add event listener for sync events
   */
  addEventListener(viewportId: string, listener: (event: SyncEvent) => void): void {
    if (!this.eventListeners.has(viewportId)) {
      this.eventListeners.set(viewportId, []);
    }
    this.eventListeners.get(viewportId)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(viewportId: string, listener: (event: SyncEvent) => void): void {
    const listeners = this.eventListeners.get(viewportId);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners of sync events
   */
  private notifyListeners(viewportId: string, event: SyncEvent): void {
    const listeners = this.eventListeners.get(viewportId) || [];
    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        logger.warn('Sync event listener error:', error);
      }
    });
  }

  /**
   * Performance monitoring
   */
  private startPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const monitor = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        this.syncState.performanceMetrics.updatesPerSecond = frameCount;
        this.syncState.performanceMetrics.syncLatency = now - this.syncState.lastUpdateTimestamp;

        frameCount = 0;
        lastTime = now;
      }

      this.frameRequestId = requestAnimationFrame(monitor);
    };

    this.frameRequestId = requestAnimationFrame(monitor);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): CameraSyncState['performanceMetrics'] {
    return { ...this.syncState.performanceMetrics };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.frameRequestId) {
      cancelAnimationFrame(this.frameRequestId);
    }

    // Clear all timeouts
    this.syncState.activeTransitions.forEach((timeout) => clearTimeout(timeout));
    this.syncState.activeTransitions.clear();

    // Clear state
    this.viewports.clear();
    this.syncSettings.clear();
    this.eventListeners.clear();
    this.syncState.batchedUpdates.clear();
  }

  // Utility methods for vector math
  private vectorsEqual(
    a: [number, number, number],
    b: [number, number, number],
    epsilon = 0.001
  ): boolean {
    return (
      Math.abs(a[0] - b[0]) < epsilon &&
      Math.abs(a[1] - b[1]) < epsilon &&
      Math.abs(a[2] - b[2]) < epsilon
    );
  }

  private rotateVector3(
    vector: [number, number, number],
    _center: [number, number, number]
  ): [number, number, number] {
    // Simplified rotation - in real implementation, use proper 3D rotation matrices
    return [vector[0], vector[1], vector[2]];
  }

  private scaleVector3(vector: [number, number, number], scale: number): [number, number, number] {
    return [vector[0] * scale, vector[1] * scale, vector[2] * scale];
  }

  private getViewDistance(viewport: ViewportInstance): number {
    const [px, py, pz] = viewport.camera.position;
    const [tx, ty, tz] = viewport.camera.target;
    return Math.sqrt((px - tx) ** 2 + (py - ty) ** 2 + (pz - tz) ** 2);
  }

  private adjustPositionForPan(
    position: [number, number, number],
    panDelta: [number, number, number]
  ): [number, number, number] {
    return [position[0] + panDelta[0], position[1] + panDelta[1], position[2] + panDelta[2]];
  }

  private transformVector3BetweenViews(
    vector: [number, number, number],
    _sourceConstraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType],
    _targetConstraints: (typeof ORTHOGRAPHIC_CONSTRAINTS)[ViewportViewType]
  ): [number, number, number] {
    // Simplified transformation - in real implementation, use proper transformation matrices
    return vector;
  }

  private resolveSyncMode(targetMode: SyncMode, sourceMode: SyncMode): SyncMode {
    // Target viewport's mode takes precedence
    if (targetMode === 'none') return 'none';
    if (sourceMode === 'none') return 'none';

    // Use the more restrictive mode
    const modeHierarchy: SyncMode[] = [
      'none',
      'zoom',
      'pan',
      'rotation',
      'full',
      'orthographic-lock',
    ];
    const targetIndex = modeHierarchy.indexOf(targetMode);
    const sourceIndex = modeHierarchy.indexOf(sourceMode);

    return targetIndex <= sourceIndex ? targetMode : sourceMode;
  }
}
