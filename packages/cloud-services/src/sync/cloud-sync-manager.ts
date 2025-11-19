/**
 * Cloud Sync Manager
 * Handles real-time project synchronization with conflict resolution
 */

import EventEmitter from 'events';
import {
  ProjectId,
  UserId,
  DeviceId,
  CloudOperation,
  SyncState,
  SyncDelta,
  VersionVector,
  ConflictResolution,
  ConflictResolutionStrategy,
  SyncStatus,
} from '@brepflow/cloud-api/src/types';
import { CloudApiClient } from '../api/cloud-api-client';
import { OperationalTransformEngine } from '@brepflow/engine-core';
import { GraphInstance } from '@brepflow/types';

const isCloudSyncEnabled = (): boolean => {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    'BREPFLOW_ENABLE_CLOUD_SYNC' in process.env
  ) {
    return process.env.BREPFLOW_ENABLE_CLOUD_SYNC === 'true';
  }

  if (
    typeof globalThis !== 'undefined' &&
    '__BREPFLOW_ENABLE_CLOUD_SYNC__' in (globalThis as unknown)
  ) {
    return Boolean((globalThis as unknown).__BREPFLOW_ENABLE_CLOUD_SYNC__);
  }

  return false;
};

export interface CloudSyncConfig {
  apiEndpoint: string;
  deviceId: DeviceId;
  userId: UserId;
  apiKey?: string;
  syncInterval: number; // ms
  maxRetries: number;
  batchSize: number;
  compressionEnabled: boolean;
  conflictResolution: ConflictResolutionStrategy;
  requestTimeout?: number;
}

export interface SyncResult {
  success: boolean;
  syncState: SyncState;
  appliedOperations: CloudOperation[];
  conflicts: ConflictResolution[];
  error?: string;
}

export class CloudSyncManager extends EventEmitter {
  private config: CloudSyncConfig;
  private operationalTransform: OperationalTransformEngine;
  private syncStates = new Map<ProjectId, SyncState>();
  private operationQueues = new Map<ProjectId, CloudOperation[]>();
  private syncTimers = new Map<ProjectId, NodeJS.Timeout>();
  private isOnline = true;
  private retryAttempts = new Map<ProjectId, number>();
  private conflictHistory = new Map<ProjectId, ConflictResolution[]>();
  private lastGraphs = new Map<ProjectId, GraphInstance>();
  private apiClient: CloudApiClient;

  constructor(config: CloudSyncConfig, apiClient?: CloudApiClient) {
    super();
    if (!isCloudSyncEnabled()) {
      throw new Error(
        'Cloud sync is disabled. Set BREPFLOW_ENABLE_CLOUD_SYNC=true (or window.__BREPFLOW_ENABLE_CLOUD_SYNC__ = true) to enable this experimental feature.'
      );
    }
    this.config = config;
    this.operationalTransform = new OperationalTransformEngine();
    this.setupNetworkMonitoring();
    this.apiClient =
      apiClient ??
      new CloudApiClient({
        baseUrl: config.apiEndpoint,
        apiKey: config.apiKey || '',
        userId: config.userId,
        timeout: config.requestTimeout ?? Math.max(10_000, config.syncInterval),
        retryAttempts: config.maxRetries,
        cacheEnabled: true,
        cacheTTL: 60_000,
      });
  }

  /**
   * Initialize sync for a project
   */
  async initializeProject(projectId: ProjectId, graph: GraphInstance): Promise<void> {
    try {
      // Create initial sync state
      const syncState: SyncState = {
        lastSync: new Date(0),
        deviceId: this.config.deviceId,
        localVersion: this.createVersionVector(projectId),
        remoteVersion: await this.fetchRemoteVersion(projectId),
        pendingOperations: [],
        conflictResolution: this.config.conflictResolution,
        syncStatus: 'offline',
      };

      this.syncStates.set(projectId, syncState);
      this.operationQueues.set(projectId, []);
      this.conflictHistory.set(projectId, []);
      this.lastGraphs.set(projectId, this.cloneGraph(graph));

      // Perform initial sync
      await this.performFullSync(projectId, graph);

      // Start periodic sync
      this.startPeriodicSync(projectId);

      this.emit('project-initialized', { projectId, syncState });
    } catch (error) {
      this.emit('sync-error', { projectId, error: error.message });
      throw error;
    }
  }

  /**
   * Queue an operation for sync
   */
  async queueOperation(projectId: ProjectId, operation: CloudOperation): Promise<void> {
    const queue = this.operationQueues.get(projectId);
    if (!queue) {
      throw new Error(`Project ${projectId} not initialized for sync`);
    }

    // Add version vector information
    operation.versionVector = this.createVersionVector(projectId, operation.id);
    operation.deviceId = this.config.deviceId;
    operation.userId = this.config.userId;

    queue.push(operation);

    // Update local version
    const syncState = this.syncStates.get(projectId)!;
    syncState.localVersion = operation.versionVector;
    syncState.pendingOperations = [...syncState.pendingOperations, operation];

    this.emit('operation-queued', { projectId, operation });

    // Trigger immediate sync for critical operations
    if (this.isCriticalOperation(operation)) {
      await this.syncProject(projectId);
    }
  }

  /**
   * Perform sync for a project
   */
  async syncProject(projectId: ProjectId): Promise<SyncResult> {
    const syncState = this.syncStates.get(projectId);
    if (!syncState) {
      throw new Error(`Project ${projectId} not initialized`);
    }

    if (!this.isOnline) {
      syncState.syncStatus = 'offline';
      return {
        success: false,
        syncState,
        appliedOperations: [],
        conflicts: [],
        error: 'Offline',
      };
    }

    try {
      syncState.syncStatus = 'syncing';
      this.emit('sync-started', { projectId });

      // Get operations to send and receive
      const { toSend, toReceive } = await this.calculateSyncDelta(projectId);

      // Send local operations
      if (toSend.length > 0) {
        await this.sendOperations(projectId, toSend);
      }

      // Process incoming operations
      const { appliedOperations, conflicts } = await this.processIncomingOperations(
        projectId,
        toReceive
      );

      // Update sync state
      syncState.lastSync = new Date();
      syncState.syncStatus = conflicts.length > 0 ? 'conflict' : 'synced';
      if (conflicts.length > 0) {
        this.conflictHistory.set(projectId, conflicts);
      } else {
        this.conflictHistory.set(projectId, []);
      }

      this.retryAttempts.delete(projectId);

      const result: SyncResult = {
        success: true,
        syncState,
        appliedOperations,
        conflicts,
      };

      this.emit('sync-completed', { projectId, result });
      return result;
    } catch (error) {
      syncState.syncStatus = 'error';
      const retries = this.retryAttempts.get(projectId) || 0;

      if (retries < this.config.maxRetries) {
        this.retryAttempts.set(projectId, retries + 1);
        // Exponential backoff
        setTimeout(
          () => {
            this.syncProject(projectId);
          },
          Math.pow(2, retries) * 1000
        );
      }

      const result: SyncResult = {
        success: false,
        syncState,
        appliedOperations: [],
        conflicts: [],
        error: error.message,
      };

      this.emit('sync-error', { projectId, error: error.message });
      return result;
    }
  }

  /**
   * Resolve conflicts manually
   */
  async resolveConflicts(projectId: ProjectId, resolutions: ConflictResolution[]): Promise<void> {
    const syncState = this.syncStates.get(projectId);
    if (!syncState) {
      throw new Error(`Project ${projectId} not initialized`);
    }

    try {
      for (const resolution of resolutions) {
        await this.applyConflictResolution(projectId, resolution);
      }

      // Trigger sync after conflict resolution
      await this.syncProject(projectId);

      this.conflictHistory.set(projectId, []);

      this.emit('conflicts-resolved', { projectId, resolutions });
    } catch (error) {
      this.emit('conflict-resolution-error', { projectId, error: error.message });
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(projectId: ProjectId): SyncState | null {
    return this.syncStates.get(projectId) || null;
  }

  getConflicts(projectId: ProjectId): ConflictResolution[] {
    return this.conflictHistory.get(projectId) || [];
  }

  /**
   * Force full sync
   */
  async forceFullSync(projectId: ProjectId, graph: GraphInstance): Promise<SyncResult> {
    const syncState = this.syncStates.get(projectId);
    if (!syncState) {
      throw new Error(`Project ${projectId} not initialized`);
    }

    // Reset sync state
    syncState.lastSync = new Date(0);
    syncState.pendingOperations = [];
    syncState.localVersion = this.createVersionVector(projectId);
    this.lastGraphs.set(projectId, this.cloneGraph(graph));

    return this.performFullSync(projectId, graph);
  }

  /**
   * Cleanup project sync
   */
  cleanup(projectId: ProjectId): void {
    const timer = this.syncTimers.get(projectId);
    if (timer) {
      clearInterval(timer);
      this.syncTimers.delete(projectId);
    }

    this.syncStates.delete(projectId);
    this.operationQueues.delete(projectId);
    this.retryAttempts.delete(projectId);
    this.conflictHistory.delete(projectId);
    this.lastGraphs.delete(projectId);

    this.emit('project-cleanup', { projectId });
  }

  // Private methods

  private async performFullSync(projectId: ProjectId, graph: GraphInstance): Promise<SyncResult> {
    try {
      // Get complete remote state
      const remoteState = await this.fetchRemoteProjectState(projectId);

      // Calculate difference
      const localOperations = this.generateOperationsFromGraph(projectId, graph);
      const remoteOperations = remoteState.operations;

      // Apply operational transformation
      const { appliedOperations, conflicts } = await this.processIncomingOperations(
        projectId,
        remoteOperations
      );

      // Send local operations
      if (localOperations.length > 0) {
        await this.sendOperations(projectId, localOperations);
      }

      const syncState = this.syncStates.get(projectId)!;
      syncState.remoteVersion = remoteState.version;
      syncState.syncStatus = conflicts.length > 0 ? 'conflict' : 'synced';
      syncState.lastSync = new Date();

      if (conflicts.length > 0) {
        this.conflictHistory.set(projectId, conflicts);
      } else {
        this.conflictHistory.set(projectId, []);
      }

      return {
        success: true,
        syncState,
        appliedOperations,
        conflicts,
      };
    } catch (error) {
      throw new Error(`Full sync failed: ${error.message}`);
    }
  }

  private async calculateSyncDelta(projectId: ProjectId): Promise<{
    toSend: CloudOperation[];
    toReceive: CloudOperation[];
  }> {
    const syncState = this.syncStates.get(projectId)!;

    // Get operations since last sync
    const toSend = syncState.pendingOperations.slice(0, this.config.batchSize);

    // Fetch remote operations since our last known version
    const remoteDelta = await this.fetchRemoteDelta(projectId, syncState.remoteVersion);
    const toReceive = remoteDelta.operations;

    syncState.remoteVersion = remoteDelta.versionVector;

    return { toSend, toReceive };
  }

  private async processIncomingOperations(
    projectId: ProjectId,
    operations: CloudOperation[]
  ): Promise<{
    appliedOperations: CloudOperation[];
    conflicts: ConflictResolution[];
  }> {
    const appliedOperations: CloudOperation[] = [];
    const conflicts: ConflictResolution[] = [];
    const localOperations = this.operationQueues.get(projectId) || [];

    for (const remoteOp of operations) {
      const conflictingLocalOp = localOperations.find((localOp) =>
        this.operationsConflict(localOp, remoteOp)
      );

      if (conflictingLocalOp) {
        const resolution = await this.resolveOperationConflict(
          conflictingLocalOp,
          remoteOp,
          this.config.conflictResolution
        );
        conflicts.push(resolution);

        if (resolution.resolution !== 'local') {
          const resolved = resolution.resolvedOperation || remoteOp;
          await this.applyRemoteOperation(projectId, resolved);
          appliedOperations.push(resolved);
        }
      } else {
        await this.applyRemoteOperation(projectId, remoteOp);
        appliedOperations.push(remoteOp);
      }
    }

    if (conflicts.length > 0) {
      this.conflictHistory.set(projectId, conflicts);
    }

    return { appliedOperations, conflicts };
  }

  private async resolveOperationConflict(
    localOp: CloudOperation,
    remoteOp: CloudOperation,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolution> {
    switch (strategy) {
      case 'latest-wins':
        return {
          operationId: remoteOp.id,
          conflictType: 'data',
          localOperation: localOp,
          remoteOperation: remoteOp,
          resolution: localOp.timestamp > remoteOp.timestamp ? 'local' : 'remote',
          resolvedOperation: localOp.timestamp > remoteOp.timestamp ? localOp : remoteOp,
        };

      case 'auto':
        // Use operational transformation for automatic resolution
        const transformed = await this.operationalTransform.transform(
          this.convertToCollaborationOperation(localOp),
          this.convertToCollaborationOperation(remoteOp)
        );
        return {
          operationId: remoteOp.id,
          conflictType: 'data',
          localOperation: localOp,
          remoteOperation: remoteOp,
          resolution: 'merge',
          resolvedOperation: this.convertFromCollaborationOperation(transformed),
        };

      case 'manual':
      default:
        return {
          operationId: remoteOp.id,
          conflictType: 'data',
          localOperation: localOp,
          remoteOperation: remoteOp,
          resolution: 'manual',
        };
    }
  }

  private operationsConflict(op1: CloudOperation, op2: CloudOperation): boolean {
    // Check if operations affect the same resources
    if (op1.type === 'UPDATE_NODE_PARAMS' && op2.type === 'UPDATE_NODE_PARAMS') {
      return (op1.data as unknown).nodeId === (op2.data as unknown).nodeId;
    }

    if (op1.type === 'DELETE_NODE' && op2.type !== 'DELETE_NODE') {
      return (op2.data as unknown).nodeId === (op1.data as unknown).nodeId;
    }

    return false;
  }

  private createVersionVector(projectId: ProjectId, operationId?: string): VersionVector {
    return {
      deviceId: this.config.deviceId,
      timestamp: Date.now(),
      operationId: operationId || `${Date.now()}_${Math.random()}`,
      parentVersions: [],
      checksum: this.calculateChecksum(projectId),
    };
  }

  private calculateChecksum(projectId: ProjectId): string {
    // Simple checksum based on pending operations
    const operations = this.operationQueues.get(projectId) || [];
    const content = operations.map((op) => op.id).join('');
    return this.simpleHash(content);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private cloneGraph(graph: GraphInstance): GraphInstance {
    return JSON.parse(JSON.stringify(graph));
  }

  private isCriticalOperation(operation: CloudOperation): boolean {
    return ['DELETE_PROJECT', 'SHARE_PROJECT', 'DELETE_NODE'].includes(operation.type);
  }

  private startPeriodicSync(projectId: ProjectId): void {
    const timer = setInterval(() => {
      this.syncProject(projectId).catch((error) => {
        console.error(`Periodic sync failed for ${projectId}:`, error);
      });
    }, this.config.syncInterval);

    this.syncTimers.set(projectId, timer);
  }

  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.emit('network-status-changed', { online: true });
        // Sync all projects when back online
        for (const projectId of this.syncStates.keys()) {
          this.syncProject(projectId);
        }
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.emit('network-status-changed', { online: false });
      });
    }
  }

  // API integration methods (to be implemented with actual backend)
  private async fetchRemoteVersion(projectId: ProjectId): Promise<VersionVector> {
    return this.apiClient.getProjectVersion(projectId);
  }

  private async fetchRemoteProjectState(projectId: ProjectId): Promise<unknown> {
    return this.apiClient.getProjectState(projectId);
  }

  private async fetchRemoteDelta(projectId: ProjectId, since: VersionVector): Promise<SyncDelta> {
    return this.apiClient.getSyncDelta(projectId, since, this.config.batchSize);
  }

  private async sendOperations(projectId: ProjectId, operations: CloudOperation[]): Promise<void> {
    if (operations.length === 0) return;

    await this.apiClient.sendOperations(projectId, operations);

    const sentIds = new Set(operations.map((op) => op.id));
    const syncState = this.syncStates.get(projectId);
    if (syncState) {
      syncState.pendingOperations = syncState.pendingOperations.filter((op) => !sentIds.has(op.id));
    }

    const queue = this.operationQueues.get(projectId);
    if (queue) {
      const updatedQueue = queue.filter((op) => !sentIds.has(op.id));
      this.operationQueues.set(projectId, updatedQueue);
      queue.length = 0;
      queue.push(...updatedQueue);
    }
  }

  private async applyRemoteOperation(
    projectId: ProjectId,
    operation: CloudOperation
  ): Promise<void> {
    const queue = this.operationQueues.get(projectId) || [];
    const updatedQueue = queue.filter((op) => op.id !== operation.id);
    this.operationQueues.set(projectId, updatedQueue);
    queue.length = 0;
    queue.push(...updatedQueue);

    const syncState = this.syncStates.get(projectId);
    if (syncState) {
      if (operation.versionVector) {
        syncState.remoteVersion = operation.versionVector;
      }
      syncState.pendingOperations = syncState.pendingOperations.filter(
        (op) => op.id !== operation.id
      );
    }

    this.emit('remote-operation-applied', { projectId, operation });
  }

  private async applyConflictResolution(
    projectId: ProjectId,
    resolution: ConflictResolution
  ): Promise<void> {
    const syncState = this.syncStates.get(projectId);
    const queue = this.operationQueues.get(projectId) || [];

    const removeLocal = (operationId: string) => {
      if (syncState) {
        syncState.pendingOperations = syncState.pendingOperations.filter(
          (op) => op.id !== operationId
        );
      }
      const updatedQueue = queue.filter((op) => op.id !== operationId);
      this.operationQueues.set(projectId, updatedQueue);
      queue.length = 0;
      queue.push(...updatedQueue);
    };

    switch (resolution.resolution) {
      case 'remote':
        if (resolution.remoteOperation) {
          await this.applyRemoteOperation(projectId, resolution.remoteOperation);
        }
        if (resolution.localOperation) {
          removeLocal(resolution.localOperation.id);
        }
        break;
      case 'merge':
        if (resolution.resolvedOperation) {
          await this.sendOperations(projectId, [resolution.resolvedOperation]);
          await this.applyRemoteOperation(projectId, resolution.resolvedOperation);
        }
        if (resolution.localOperation) {
          removeLocal(resolution.localOperation.id);
        }
        break;
      case 'local':
        if (resolution.remoteOperation) {
          this.emit('remote-operation-skipped', {
            projectId,
            operation: resolution.remoteOperation,
          });
        }
        break;
      default:
        break;
    }

    this.emit('conflict-applied', { projectId, resolution });
  }

  private generateOperationsFromGraph(
    projectId: ProjectId,
    graph: GraphInstance
  ): CloudOperation[] {
    const previous = this.lastGraphs.get(projectId);
    if (!previous) {
      this.lastGraphs.set(projectId, this.cloneGraph(graph));
      return [];
    }

    const operations: CloudOperation[] = [];

    const prevNodes = new Map(previous.nodes.map((node) => [node.id, node]));
    const currNodes = new Map(graph.nodes.map((node) => [node.id, node]));

    const createOperation = (type: string, data: unknown): CloudOperation => ({
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      type,
      data,
      deviceId: this.config.deviceId,
      userId: this.config.userId,
      timestamp: Date.now(),
      versionVector: this.createVersionVector(projectId),
      dependencies: [],
    });

    for (const [nodeId, node] of currNodes) {
      const existing = prevNodes.get(nodeId);
      if (!existing) {
        operations.push(createOperation('ADD_NODE', { node }));
        continue;
      }

      if (JSON.stringify(existing) !== JSON.stringify(node)) {
        operations.push(createOperation('UPDATE_NODE', { before: existing, after: node }));
      }
    }

    for (const [nodeId, node] of prevNodes) {
      if (!currNodes.has(nodeId)) {
        operations.push(createOperation('DELETE_NODE', { node }));
      }
    }

    const prevEdges = new Map(previous.edges.map((edge) => [edge.id, edge]));
    const currEdges = new Map(graph.edges.map((edge) => [edge.id, edge]));

    for (const [edgeId, edge] of currEdges) {
      const existing = prevEdges.get(edgeId);
      if (!existing) {
        operations.push(createOperation('ADD_EDGE', { edge }));
        continue;
      }

      if (
        existing.source !== edge.source ||
        existing.target !== edge.target ||
        existing.sourceHandle !== edge.sourceHandle ||
        existing.targetHandle !== edge.targetHandle
      ) {
        operations.push(createOperation('UPDATE_EDGE', { before: existing, after: edge }));
      }
    }

    for (const [edgeId, edge] of prevEdges) {
      if (!currEdges.has(edgeId)) {
        operations.push(createOperation('DELETE_EDGE', { edge }));
      }
    }

    if (
      previous.units !== graph.units ||
      previous.tolerance !== graph.tolerance ||
      JSON.stringify(previous.metadata) !== JSON.stringify(graph.metadata)
    ) {
      operations.push(
        createOperation('UPDATE_GRAPH_SETTINGS', {
          before: {
            units: previous.units,
            tolerance: previous.tolerance,
            metadata: previous.metadata,
          },
          after: { units: graph.units, tolerance: graph.tolerance, metadata: graph.metadata },
        })
      );
    }

    this.lastGraphs.set(projectId, this.cloneGraph(graph));

    return operations;
  }

  private convertToCollaborationOperation(
    cloudOp: CloudOperation
  ): import('@brepflow/collaboration/src/types').BaseOperation {
    // Convert cloud operation to collaboration operation format
    return {
      id: cloudOp.id,
      type: cloudOp.type as import('@brepflow/collaboration/src/types').OperationType,
      userId: cloudOp.userId,
      timestamp: cloudOp.timestamp,
      documentId: '', // Document ID will be set by caller
      ...(cloudOp.data as Record<string, unknown>),
    };
  }

  private convertFromCollaborationOperation(
    collabOp: import('@brepflow/collaboration/src/types').BaseOperation
  ): CloudOperation {
    // Convert collaboration operation back to cloud operation format
    return {
      id: collabOp.id,
      type: collabOp.type,
      data: collabOp,
      deviceId: this.config.deviceId,
      userId: collabOp.userId,
      timestamp: collabOp.timestamp,
      versionVector: this.createVersionVector('', collabOp.id),
      dependencies: [],
    };
  }
}
