/**
 * BrepFlow Cloud Services
 * Main export file for cloud synchronization, storage, and collaboration services
 */

// Core Services
export { CloudSyncManager } from './sync/cloud-sync-manager';
export { ProjectSharingManager } from './sharing/project-sharing-manager';
export { PluginManager } from './plugins/plugin-manager';

// API and Communication
export { CloudApiClient } from './api/cloud-api-client';
export { WebSocketService } from './realtime/websocket-service';

// Storage and Database
export { CloudStorageService } from './storage/cloud-storage-service';
export { CloudDatabaseService } from './database/cloud-database-service';

// Collaboration Engine (re-export from engine-core)
export { BrepFlowCollaborationEngine } from '@brepflow/engine-core/src/collaboration/collaboration-engine';
export { ParameterSynchronizer } from '@brepflow/engine-core/src/collaboration/parameter-sync';

// Types (re-export from cloud-api)
export * from '@brepflow/cloud-api/src/types';

// Configuration interfaces
export type { CloudSyncConfig, SyncResult } from './sync/cloud-sync-manager';

export type { ProjectSharingConfig, SharingResult } from './sharing/project-sharing-manager';

export type {
  PluginManagerConfig,
  PluginInstallOptions,
  PluginSandbox,
} from './plugins/plugin-manager';

export type { CloudApiConfig, RequestOptions } from './api/cloud-api-client';

export type {
  WebSocketConfig,
  ClientConnection,
  WebSocketMessage,
  MessageType,
} from './realtime/websocket-service';

export type {
  StorageConfig,
  StorageObject,
  UploadOptions,
  DownloadOptions,
  ListOptions,
  StorageQuota,
} from './storage/cloud-storage-service';

export type {
  DatabaseConfig,
  QueryOptions,
  DatabaseTransaction,
  PaginationOptions,
} from './database/cloud-database-service';
