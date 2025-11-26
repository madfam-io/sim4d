/**
 * Cloud API Types
 * Shared type definitions for Sim4D cloud services
 */

export type ProjectId = string;
export type UserId = string;
export type TeamId = string;
export type PluginId = string;
export type DeviceId = string;
export type ShareId = string;

// Base cloud metadata
export interface CloudMetadata {
  projectId: ProjectId;
  ownerId: UserId;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  deviceId: DeviceId;
}

// Project management
export interface ProjectMetadata {
  id: ProjectId;
  name: string;
  description?: string;
  ownerId: UserId;
  teamId?: TeamId;
  visibility: 'private' | 'team' | 'public';
  collaborators: CollaboratorAccess[];
  tags: string[];
  thumbnail?: string;
  lastModified: Date;
  size: number; // bytes
  nodeCount: number;
  cloudMetadata: CloudMetadata;
}

export interface CollaboratorAccess {
  userId: UserId;
  role: ProjectRole;
  addedAt: Date;
  addedBy: UserId;
  permissions: ProjectPermission[];
}

export type ProjectRole = 'owner' | 'editor' | 'viewer' | 'commenter';

export interface ProjectPermission {
  action: 'read' | 'write' | 'delete' | 'share' | 'export' | 'admin';
  resource: 'project' | 'nodes' | 'parameters' | 'geometry' | 'comments';
  granted: boolean;
}

// Sync and versioning
export interface VersionVector {
  deviceId: DeviceId;
  timestamp: number;
  operationId: string;
  parentVersions: string[];
  checksum: string;
}

export interface SyncState {
  lastSync: Date;
  deviceId: DeviceId;
  localVersion: VersionVector;
  remoteVersion: VersionVector;
  pendingOperations: CloudOperation[];
  conflictResolution: ConflictResolutionStrategy;
  syncStatus: SyncStatus;
}

export type SyncStatus = 'synced' | 'syncing' | 'conflict' | 'offline' | 'error';
export type ConflictResolutionStrategy = 'auto' | 'manual' | 'latest-wins' | 'preserve-both';

export interface CloudOperation {
  id: string;
  type: string;
  data: unknown;
  deviceId: DeviceId;
  userId: UserId;
  timestamp: number;
  versionVector: VersionVector;
  dependencies: string[];
}

export interface SyncDelta {
  operations: CloudOperation[];
  versionVector: VersionVector;
  conflicts: ConflictResolution[];
  size: number;
  compressed: boolean;
}

export interface ConflictResolution {
  operationId: string;
  conflictType: 'data' | 'structure' | 'permission';
  localOperation: CloudOperation;
  remoteOperation: CloudOperation;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
  resolvedOperation?: CloudOperation;
}

// Project sharing
export interface ShareLink {
  id: ShareId;
  projectId: ProjectId;
  createdBy: UserId;
  createdAt: Date;
  expiresAt?: Date;
  accessLevel: ProjectRole;
  isPublic: boolean;
  allowAnonymous: boolean;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface ShareRequest {
  projectId: ProjectId;
  targetUsers: UserId[];
  targetEmails: string[];
  role: ProjectRole;
  message?: string;
  expiresAt?: Date;
}

export interface ShareInvitation {
  id: string;
  projectId: ProjectId;
  fromUserId: UserId;
  toUserId?: UserId;
  toEmail: string;
  role: ProjectRole;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

// Authentication and authorization
export interface User {
  id: UserId;
  email: string;
  name: string;
  avatar?: string;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  subscription: SubscriptionInfo;
  teams: TeamMembership[];
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  editor: EditorSettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  projectShared: boolean;
  projectUpdated: boolean;
  collaboratorJoined: boolean;
  commentAdded: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  allowProjectDiscovery: boolean;
}

export interface EditorSettings {
  autoSave: boolean;
  autoSync: boolean;
  conflictResolution: ConflictResolutionStrategy;
  gridSnap: boolean;
  showGrid: boolean;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  quotas: ResourceQuotas;
}

export type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface ResourceQuotas {
  maxProjects: number;
  maxStorageGB: number;
  maxCollaborators: number;
  maxPlugins: number;
  computeHours: number;
  apiCallsPerMonth: number;
  maxTeamMembers: number;
}

// Team management
export interface Team {
  id: TeamId;
  name: string;
  description?: string;
  ownerId: UserId;
  members: TeamMember[];
  projects: ProjectId[];
  subscription: SubscriptionInfo;
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: UserId;
  role: TeamRole;
  joinedAt: Date;
  invitedBy: UserId;
  permissions: TeamPermission[];
  isActive: boolean;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'guest';

export interface TeamPermission {
  action: 'read' | 'write' | 'delete' | 'invite' | 'manage' | 'admin';
  resource: 'team' | 'projects' | 'members' | 'billing' | 'settings';
  granted: boolean;
}

export interface TeamMembership {
  teamId: TeamId;
  role: TeamRole;
  joinedAt: Date;
}

export interface TeamSettings {
  visibility: 'public' | 'private';
  allowPublicProjects: boolean;
  requireInviteApproval: boolean;
  defaultProjectRole: ProjectRole;
  enforceSSOLogin: boolean;
}

// Plugin ecosystem
export interface Plugin {
  id: PluginId;
  name: string;
  description: string;
  version: string;
  author: PluginAuthor;
  category: PluginCategory;
  tags: string[];
  manifest: PluginManifest;
  bundle: PluginBundle;
  marketplace: MarketplaceInfo;
  security: SecurityInfo;
  stats: PluginStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginAuthor {
  id: UserId;
  name: string;
  email: string;
  website?: string;
  verified: boolean;
}

export type PluginCategory =
  | 'geometry'
  | 'analysis'
  | 'visualization'
  | 'export'
  | 'utility'
  | 'integration'
  | 'ai-ml';

export interface PluginManifest {
  id: PluginId;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  keywords: string[];
  engines: {
    sim4d: string; // Version compatibility
    node?: string;
    npm?: string;
  };
  main: string; // Entry point
  permissions: PluginPermissions;
  dependencies: Record<string, string>;
  files: string[];
  signature: Ed25519Signature;
}

export interface PluginPermissions {
  geometryAccess: 'none' | 'read' | 'write' | 'full';
  networkAccess: NetworkPermission[];
  storageQuota: number; // MB
  workerThreads: number;
  wasmMemory: number; // MB
  fileSystemAccess: FileSystemPermission[];
  systemAPIs: SystemAPIPermission[];
}

export interface NetworkPermission {
  domain: string;
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE')[];
  description: string;
}

export interface FileSystemPermission {
  path: string;
  access: 'read' | 'write' | 'read-write';
  description: string;
}

export interface SystemAPIPermission {
  api: 'clipboard' | 'notifications' | 'camera' | 'microphone' | 'geolocation';
  description: string;
}

export interface Ed25519Signature {
  signature: string; // Base64 encoded
  publicKey: string; // Base64 encoded
  algorithm: 'ed25519';
}

export interface PluginBundle {
  format: 'esm' | 'umd' | 'wasm';
  size: number; // bytes
  checksum: string; // SHA-256
  compression: 'gzip' | 'brotli' | 'none';
  cdn: {
    url: string;
    integrity: string;
  };
}

export interface MarketplaceInfo {
  published: boolean;
  publishedAt?: Date;
  featured: boolean;
  rating: number; // 0-5
  reviewCount: number;
  downloadCount: number;
  price: PluginPrice;
  screenshots: string[];
  documentation: string;
}

export interface PluginPrice {
  type: 'free' | 'paid' | 'freemium' | 'subscription';
  amount?: number; // USD cents
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly' | 'one-time';
}

export interface SecurityInfo {
  scanDate: Date;
  scanResult: SecurityScanResult;
  vulnerabilities: SecurityVulnerability[];
  trustScore: number; // 0-100
  verifiedAuthor: boolean;
}

export interface SecurityScanResult {
  status: 'safe' | 'warning' | 'dangerous' | 'unknown';
  score: number; // 0-100
  issues: SecurityIssue[];
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'malware' | 'suspicious-network' | 'excessive-permissions' | 'code-injection';
  description: string;
  recommendation: string;
}

export interface SecurityVulnerability {
  id: string; // CVE ID or custom ID
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedVersions: string[];
  fixedInVersion?: string;
  patchAvailable: boolean;
}

export interface PluginStats {
  installs: number;
  activeUsers: number;
  lastMonth: {
    installs: number;
    uninstalls: number;
    activeUsers: number;
  };
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

// API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  metadata?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  trace?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search and filtering
export interface SearchQuery {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: SortOption[];
  pagination?: {
    page: number;
    size: number;
  };
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: Record<string, FacetResult>;
  suggestions?: string[];
}

export interface FacetResult {
  buckets: FacetBucket[];
}

export interface FacetBucket {
  key: string;
  count: number;
  selected: boolean;
}
