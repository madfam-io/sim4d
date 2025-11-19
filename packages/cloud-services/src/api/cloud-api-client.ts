/**
 * Cloud API Client
 * HTTP client for BrepFlow cloud services with authentication and caching
 */

import {
  ProjectId,
  UserId,
  PluginId,
  ShareId,
  CloudOperation,
  SyncDelta,
  VersionVector,
  ProjectMetadata,
  ShareLink,
  Plugin,
  ApiResponse,
  SearchQuery,
  SearchResult,
  CollaboratorAccess,
  User,
} from '@brepflow/cloud-api/src/types';

export interface CloudApiConfig {
  baseUrl: string;
  apiKey: string;
  userId: UserId;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheTTL: number; // ms
}

export interface RequestOptions {
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
  headers?: Record<string, string>;
}

export class CloudApiClient {
  private config: CloudApiConfig;
  private cache = new Map<string, { data: unknown; expires: number }>();
  private authToken?: string;

  constructor(config: CloudApiConfig) {
    this.config = config;
  }

  /**
   * Authentication
   */
  async authenticate(credentials: { email: string; password: string }): Promise<string> {
    const response = await this.request<{ token: string; user: any }>('POST', '/auth/login', {
      data: credentials,
      cache: false,
    });

    this.authToken = response.data!.token;
    return this.authToken;
  }

  async refreshToken(): Promise<string> {
    const response = await this.request<{ token: string }>('POST', '/auth/refresh', {
      cache: false,
    });

    this.authToken = response.data!.token;
    return this.authToken;
  }

  /**
   * Project Management
   */
  async getProjects(userId: UserId): Promise<ProjectMetadata[]> {
    const response = await this.request<ProjectMetadata[]>('GET', `/users/${userId}/projects`);
    return response.data!;
  }

  async getProject(projectId: ProjectId): Promise<ProjectMetadata> {
    const response = await this.request<ProjectMetadata>('GET', `/projects/${projectId}`);
    return response.data!;
  }

  async createProject(data: Partial<ProjectMetadata>): Promise<ProjectMetadata> {
    const response = await this.request<ProjectMetadata>('POST', '/projects', {
      data,
      cache: false,
    });
    return response.data!;
  }

  async updateProject(
    projectId: ProjectId,
    data: Partial<ProjectMetadata>
  ): Promise<ProjectMetadata> {
    const response = await this.request<ProjectMetadata>('PUT', `/projects/${projectId}`, {
      data,
      cache: false,
    });

    this.invalidateCache(`projects/${projectId}`);
    return response.data!;
  }

  async deleteProject(projectId: ProjectId): Promise<void> {
    await this.request('DELETE', `/projects/${projectId}`, { cache: false });
    this.invalidateCache(`projects/${projectId}`);
  }

  /**
   * Sync Operations
   */
  async getProjectVersion(projectId: ProjectId): Promise<VersionVector> {
    const response = await this.request<VersionVector>('GET', `/projects/${projectId}/version`);
    return response.data!;
  }

  async getSyncDelta(
    projectId: ProjectId,
    since: VersionVector,
    limit?: number
  ): Promise<SyncDelta> {
    const params = new URLSearchParams({
      since_timestamp: since.timestamp.toString(),
      since_operation: since.operationId,
    });

    if (limit) {
      params.set('limit', limit.toString());
    }

    const response = await this.request<SyncDelta>(
      'GET',
      `/projects/${projectId}/sync/delta?${params}`,
      { cache: false }
    );
    return response.data!;
  }

  async sendOperations(projectId: ProjectId, operations: CloudOperation[]): Promise<void> {
    await this.request('POST', `/projects/${projectId}/sync/operations`, {
      data: { operations },
      cache: false,
    });
  }

  async getProjectState(projectId: ProjectId): Promise<{
    operations: CloudOperation[];
    version: VersionVector;
    metadata: ProjectMetadata;
  }> {
    const response = await this.request<{
      operations: CloudOperation[];
      version: VersionVector;
      metadata: ProjectMetadata;
    }>('GET', `/projects/${projectId}/state`);
    return response.data!;
  }

  /**
   * Project Sharing
   */
  async createShareLink(
    projectId: ProjectId,
    options: {
      createdBy: UserId;
      accessLevel?: string;
      expiresAt?: Date;
      isPublic?: boolean;
      allowAnonymous?: boolean;
      maxUses?: number;
      description?: string;
    }
  ): Promise<ShareLink> {
    const response = await this.request<ShareLink>('POST', `/projects/${projectId}/share`, {
      data: options,
      cache: false,
    });
    return response.data!;
  }

  async getShareLink(shareId: ShareId): Promise<ShareLink> {
    const response = await this.request<ShareLink>('GET', `/share/${shareId}`);
    return response.data!;
  }

  async updateShareLink(shareId: ShareId, updates: Partial<ShareLink>): Promise<ShareLink> {
    const response = await this.request<ShareLink>('PUT', `/share/${shareId}`, {
      data: updates,
      cache: false,
    });
    return response.data!;
  }

  async revokeShareLink(shareId: ShareId): Promise<void> {
    await this.request('DELETE', `/share/${shareId}`, { cache: false });
  }

  async sendInvitation(
    projectId: ProjectId,
    invitations: {
      emails: string[];
      userIds?: string[];
      role: string;
      message?: string;
      expiresAt?: Date;
    }
  ): Promise<void> {
    await this.request('POST', `/projects/${projectId}/invite`, {
      data: invitations,
      cache: false,
    });
  }

  async logShareAccess(shareId: ShareId, payload: unknown): Promise<void> {
    await this.request('POST', `/share/${shareId}/access`, {
      data: payload,
      cache: false,
    });
  }

  async getShareAnalytics(shareId: ShareId): Promise<unknown> {
    const response = await this.request<unknown>('GET', `/share/${shareId}/analytics`, {
      cache: false,
    });
    return response.data!;
  }

  async getUser(userId: UserId): Promise<User> {
    const response = await this.request<User>('GET', `/users/${userId}`);
    return response.data!;
  }

  async getCollaborators(projectId: ProjectId): Promise<CollaboratorAccess[]> {
    const response = await this.request<CollaboratorAccess[]>(
      'GET',
      `/projects/${projectId}/collaborators`,
      { cache: false }
    );
    return response.data || [];
  }

  async addCollaborator(projectId: ProjectId, collaborator: CollaboratorAccess): Promise<void> {
    await this.request('POST', `/projects/${projectId}/collaborators`, {
      data: collaborator,
      cache: false,
    });
  }

  async updateCollaborator(projectId: ProjectId, collaborator: CollaboratorAccess): Promise<void> {
    await this.request('PUT', `/projects/${projectId}/collaborators/${collaborator.userId}`, {
      data: collaborator,
      cache: false,
    });
  }

  async removeCollaborator(projectId: ProjectId, userId: UserId): Promise<void> {
    await this.request('DELETE', `/projects/${projectId}/collaborators/${userId}`, {
      cache: false,
    });
  }

  /**
   * Plugin Management
   */
  async searchPlugins(query: SearchQuery): Promise<SearchResult<Plugin>> {
    const response = await this.request<SearchResult<Plugin>>('POST', '/plugins/search', {
      data: query,
    });
    return response.data!;
  }

  async getPlugin(pluginId: PluginId, version?: string): Promise<Plugin> {
    const url = version ? `/plugins/${pluginId}/versions/${version}` : `/plugins/${pluginId}`;

    const response = await this.request<Plugin>('GET', url);
    return response.data!;
  }

  async downloadPlugin(pluginId: PluginId, version?: string): Promise<ArrayBuffer> {
    const url = version
      ? `/plugins/${pluginId}/versions/${version}/download`
      : `/plugins/${pluginId}/download`;

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  async getUserPlugins(userId: UserId): Promise<Plugin[]> {
    const response = await this.request<Plugin[]>('GET', `/users/${userId}/plugins`);
    return response.data!;
  }

  /**
   * File Storage
   */
  async uploadFile(
    projectId: ProjectId,
    file: File | Blob,
    path: string
  ): Promise<{ url: string; checksum: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`${this.config.baseUrl}/projects/${projectId}/files`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async downloadFile(projectId: ProjectId, path: string): Promise<Blob> {
    const response = await fetch(
      `${this.config.baseUrl}/projects/${projectId}/files/${encodeURIComponent(path)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async deleteFile(projectId: ProjectId, path: string): Promise<void> {
    await this.request('DELETE', `/projects/${projectId}/files/${encodeURIComponent(path)}`, {
      cache: false,
    });
  }

  /**
   * Generic HTTP Request Handler
   */
  private async request<T = any>(
    method: string,
    path: string,
    options: RequestOptions & { data?: any } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const cacheKey = `${method}:${path}`;

    // Check cache for GET requests
    if (method === 'GET' && options.cache !== false && this.config.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      signal: AbortSignal.timeout(options.timeout || this.config.timeout),
    };

    if (options.data) {
      requestOptions.body = JSON.stringify(options.data);
    }

    let lastError: Error;
    const maxAttempts = options.retry !== false ? this.config.retryAttempts : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || `HTTP ${response.status}`);
        }

        // Cache successful GET responses
        if (method === 'GET' && options.cache !== false && this.config.cacheEnabled) {
          this.cache.set(cacheKey, {
            data: result,
            expires: Date.now() + this.config.cacheTTL,
          });
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'X-API-Key': this.config.apiKey,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private invalidateCache(pattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cache management
   */
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: number } {
    let size = 0;
    for (const [, value] of this.cache) {
      size += JSON.stringify(value).length;
    }

    return {
      size,
      entries: this.cache.size,
    };
  }
}
