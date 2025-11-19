/**
 * Cloud Database Service
 * Data persistence and querying for BrepFlow cloud services
 */

import EventEmitter from 'events';
import {
  ProjectId,
  UserId,
  TeamId,
  PluginId,
  ShareId,
  ProjectMetadata,
  User,
  Team,
  Plugin,
  ShareLink,
  CloudOperation,
  VersionVector,
  SyncState,
  SearchQuery,
  SearchResult,
} from '@brepflow/cloud-api/src/types';

export interface DatabaseConfig {
  provider: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionPool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
  };
  migrations: {
    enabled: boolean;
    directory: string;
  };
  backup: {
    enabled: boolean;
    schedule: string;
    retention: number;
  };
}

export interface QueryOptions {
  transaction?: DatabaseTransaction;
  timeout?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export interface DatabaseTransaction {
  id: string;
  startTime: Date;
  queries: Array<{
    sql: string;
    params: unknown[];
    timestamp: Date;
  }>;
}

export interface PaginationOptions {
  offset: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface DatabaseConnection {
  query: (sql: string, params?: unknown[]) => Promise<unknown[]>;
  execute: (sql: string, params?: unknown[]) => Promise<unknown>;
  transaction: (callback: () => Promise<void>) => Promise<void>;
  close: () => Promise<void>;
}

interface DatabaseRow {
  [key: string]: unknown;
}

export class CloudDatabaseService extends EventEmitter {
  private config: DatabaseConfig;
  private connection?: DatabaseConnection;
  private queryCache = new Map<string, { data: unknown; expires: number }>();
  private activeTransactions = new Map<string, DatabaseTransaction>();

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  /**
   * Connection Management
   */
  async connect(): Promise<void> {
    try {
      this.connection = await this.createConnection();
      await this.runMigrations();
      this.emit('connected');
    } catch (error) {
      this.emit('connection-error', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.emit('disconnected');
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.query('SELECT 1 as health_check');
      return {
        healthy: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        error: error.message,
      };
    }
  }

  /**
   * Transaction Management
   */
  async beginTransaction(): Promise<DatabaseTransaction> {
    const transaction: DatabaseTransaction = {
      id: this.generateTransactionId(),
      startTime: new Date(),
      queries: [],
    };

    this.activeTransactions.set(transaction.id, transaction);
    await this.query('BEGIN', [], { transaction });

    return transaction;
  }

  async commitTransaction(transaction: DatabaseTransaction): Promise<void> {
    await this.query('COMMIT', [], { transaction });
    this.activeTransactions.delete(transaction.id);
  }

  async rollbackTransaction(transaction: DatabaseTransaction): Promise<void> {
    await this.query('ROLLBACK', [], { transaction });
    this.activeTransactions.delete(transaction.id);
  }

  /**
   * User Management
   */
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<User> {
    const id = this.generateUserId();
    const now = new Date();

    const userData = {
      id,
      ...user,
      createdAt: now,
      lastLoginAt: now,
    };

    await this.query(
      `INSERT INTO users (
        id, email, name, avatar, is_email_verified, preferences,
        subscription, teams, created_at, last_login_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.id,
        userData.email,
        userData.name,
        userData.avatar,
        userData.isEmailVerified,
        JSON.stringify(userData.preferences),
        JSON.stringify(userData.subscription),
        JSON.stringify(userData.teams),
        userData.createdAt,
        userData.lastLoginAt,
      ]
    );

    this.emit('user-created', userData);
    return userData;
  }

  async getUserById(userId: UserId, options: QueryOptions = {}): Promise<User | null> {
    const result = await this.query('SELECT * FROM users WHERE id = ?', [userId], options);

    return result.length > 0 ? this.parseUser(result[0]) : null;
  }

  async getUserByEmail(email: string, options: QueryOptions = {}): Promise<User | null> {
    const result = await this.query('SELECT * FROM users WHERE email = ?', [email], options);

    return result.length > 0 ? this.parseUser(result[0]) : null;
  }

  async updateUser(userId: UserId, updates: Partial<User>): Promise<User> {
    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id') continue; // Don't update ID

      const dbKey = this.camelToSnake(key);
      setClause.push(`${dbKey} = ?`);

      if (typeof value === 'object' && value !== null) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }

    values.push(userId);

    await this.query(`UPDATE users SET ${setClause.join(', ')} WHERE id = ?`, values);

    const updatedUser = await this.getUserById(userId);
    this.emit('user-updated', updatedUser);
    return updatedUser!;
  }

  async deleteUser(userId: UserId): Promise<void> {
    await this.query('DELETE FROM users WHERE id = ?', [userId]);
    this.invalidateUserCache(userId);
    this.emit('user-deleted', { userId });
  }

  /**
   * Project Management
   */
  async createProject(project: Omit<ProjectMetadata, 'id'>): Promise<ProjectMetadata> {
    const id = this.generateProjectId();
    const projectData = { id, ...project };

    await this.query(
      `INSERT INTO projects (
        id, name, description, owner_id, team_id, visibility,
        collaborators, tags, thumbnail, last_modified, size,
        node_count, cloud_metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectData.id,
        projectData.name,
        projectData.description,
        projectData.ownerId,
        projectData.teamId,
        projectData.visibility,
        JSON.stringify(projectData.collaborators),
        JSON.stringify(projectData.tags),
        projectData.thumbnail,
        projectData.lastModified,
        projectData.size,
        projectData.nodeCount,
        JSON.stringify(projectData.cloudMetadata),
      ]
    );

    this.emit('project-created', projectData);
    return projectData;
  }

  async getProjectById(
    projectId: ProjectId,
    options: QueryOptions = {}
  ): Promise<ProjectMetadata | null> {
    const result = await this.query('SELECT * FROM projects WHERE id = ?', [projectId], options);

    return result.length > 0 ? this.parseProject(result[0]) : null;
  }

  async getUserProjects(
    userId: UserId,
    pagination: PaginationOptions,
    options: QueryOptions = {}
  ): Promise<{ projects: ProjectMetadata[]; total: number }> {
    const countResult = await this.query(
      `SELECT COUNT(*) as total FROM projects
       WHERE owner_id = ? OR JSON_EXTRACT(collaborators, '$[*].userId') LIKE ?`,
      [userId, `%${userId}%`],
      options
    );

    const projectsResult = await this.query(
      `SELECT * FROM projects
       WHERE owner_id = ? OR JSON_EXTRACT(collaborators, '$[*].userId') LIKE ?
       ORDER BY ${pagination.sortBy || 'last_modified'} ${pagination.sortOrder || 'DESC'}
       LIMIT ? OFFSET ?`,
      [userId, `%${userId}%`, pagination.limit, pagination.offset],
      options
    );

    return {
      projects: projectsResult.map(this.parseProject),
      total: countResult[0].total,
    };
  }

  async updateProject(
    projectId: ProjectId,
    updates: Partial<ProjectMetadata>
  ): Promise<ProjectMetadata> {
    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id') continue;

      const dbKey = this.camelToSnake(key);
      setClause.push(`${dbKey} = ?`);

      if (typeof value === 'object' && value !== null) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }

    values.push(projectId);

    await this.query(`UPDATE projects SET ${setClause.join(', ')} WHERE id = ?`, values);

    const updatedProject = await this.getProjectById(projectId);
    this.emit('project-updated', updatedProject);
    return updatedProject!;
  }

  async deleteProject(projectId: ProjectId): Promise<void> {
    const transaction = await this.beginTransaction();

    try {
      // Delete related data
      await this.query('DELETE FROM project_operations WHERE project_id = ?', [projectId], {
        transaction,
      });
      await this.query('DELETE FROM share_links WHERE project_id = ?', [projectId], {
        transaction,
      });
      await this.query('DELETE FROM projects WHERE id = ?', [projectId], { transaction });

      await this.commitTransaction(transaction);
      this.emit('project-deleted', { projectId });
    } catch (error) {
      await this.rollbackTransaction(transaction);
      throw error;
    }
  }

  /**
   * Sync Operations Management
   */
  async saveOperation(
    projectId: ProjectId,
    operation: CloudOperation,
    options: QueryOptions = {}
  ): Promise<void> {
    await this.query(
      `INSERT INTO project_operations (
        id, project_id, type, data, device_id, user_id,
        timestamp, version_vector, dependencies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.id,
        projectId,
        operation.type,
        JSON.stringify(operation.data),
        operation.deviceId,
        operation.userId,
        operation.timestamp,
        JSON.stringify(operation.versionVector),
        JSON.stringify(operation.dependencies),
      ],
      options
    );
  }

  async getOperationsSince(
    projectId: ProjectId,
    since: VersionVector,
    limit: number = 100,
    options: QueryOptions = {}
  ): Promise<CloudOperation[]> {
    const result = await this.query(
      `SELECT * FROM project_operations
       WHERE project_id = ? AND timestamp > ?
       ORDER BY timestamp ASC
       LIMIT ?`,
      [projectId, since.timestamp, limit],
      options
    );

    return result.map(this.parseOperation);
  }

  async getProjectOperations(
    projectId: ProjectId,
    pagination: PaginationOptions,
    options: QueryOptions = {}
  ): Promise<{ operations: CloudOperation[]; total: number }> {
    const countResult = await this.query(
      'SELECT COUNT(*) as total FROM project_operations WHERE project_id = ?',
      [projectId],
      options
    );

    const operationsResult = await this.query(
      `SELECT * FROM project_operations
       WHERE project_id = ?
       ORDER BY timestamp DESC
       LIMIT ? OFFSET ?`,
      [projectId, pagination.limit, pagination.offset],
      options
    );

    return {
      operations: operationsResult.map(this.parseOperation),
      total: countResult[0].total,
    };
  }

  /**
   * Share Links Management
   */
  async createShareLink(shareLink: ShareLink, options: QueryOptions = {}): Promise<void> {
    await this.query(
      `INSERT INTO share_links (
        id, project_id, created_by, created_at, expires_at,
        access_level, is_public, allow_anonymous, max_uses,
        current_uses, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shareLink.id,
        shareLink.projectId,
        shareLink.createdBy,
        shareLink.createdAt,
        shareLink.expiresAt,
        shareLink.accessLevel,
        shareLink.isPublic,
        shareLink.allowAnonymous,
        shareLink.maxUses,
        shareLink.currentUses,
        shareLink.isActive,
      ],
      options
    );
  }

  async getShareLink(shareId: ShareId, options: QueryOptions = {}): Promise<ShareLink | null> {
    const result = await this.query(
      'SELECT * FROM share_links WHERE id = ? AND is_active = true',
      [shareId],
      options
    );

    return result.length > 0 ? this.parseShareLink(result[0]) : null;
  }

  async updateShareLink(shareId: ShareId, updates: Partial<ShareLink>): Promise<ShareLink> {
    const setClause = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id') continue;

      const dbKey = this.camelToSnake(key);
      setClause.push(`${dbKey} = ?`);
      values.push(value);
    }

    values.push(shareId);

    await this.query(`UPDATE share_links SET ${setClause.join(', ')} WHERE id = ?`, values);

    return (await this.getShareLink(shareId)) as ShareLink;
  }

  /**
   * Plugin Management
   */
  async savePlugin(plugin: Plugin, options: QueryOptions = {}): Promise<void> {
    await this.query(
      `INSERT INTO plugins (
        id, name, description, version, author, category,
        tags, manifest, bundle, marketplace, security,
        stats, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        version = VALUES(version),
        updated_at = VALUES(updated_at)`,
      [
        plugin.id,
        plugin.name,
        plugin.description,
        plugin.version,
        JSON.stringify(plugin.author),
        plugin.category,
        JSON.stringify(plugin.tags),
        JSON.stringify(plugin.manifest),
        JSON.stringify(plugin.bundle),
        JSON.stringify(plugin.marketplace),
        JSON.stringify(plugin.security),
        JSON.stringify(plugin.stats),
        plugin.createdAt,
        plugin.updatedAt,
      ],
      options
    );
  }

  async searchPlugins(
    query: SearchQuery,
    options: QueryOptions = {}
  ): Promise<SearchResult<Plugin>> {
    // Build search SQL based on query
    let sql = 'SELECT * FROM plugins WHERE 1=1';
    const params: unknown[] = [];

    if (query.query) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR JSON_EXTRACT(tags, "$[*]") LIKE ?)';
      const searchTerm = `%${query.query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (query.filters) {
      for (const [key, value] of Object.entries(query.filters)) {
        sql += ` AND ${this.camelToSnake(key)} = ?`;
        params.push(value);
      }
    }

    // Add sorting
    if (query.sort && query.sort.length > 0) {
      const sortClauses = query.sort.map(
        (sort) => `${this.camelToSnake(sort.field)} ${sort.direction.toUpperCase()}`
      );
      sql += ` ORDER BY ${sortClauses.join(', ')}`;
    }

    // Add pagination
    if (query.pagination) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(query.pagination.size, (query.pagination.page - 1) * query.pagination.size);
    }

    const results = await this.query(sql, params, options);
    const plugins = results.map(this.parsePlugin);

    // Get total count
    const countSql = sql
      .replace(/SELECT \*/, 'SELECT COUNT(*) as total')
      .replace(/ORDER BY.*$/, '')
      .replace(/LIMIT.*$/, '');
    const countResult = await this.query(countSql, params.slice(0, -2), options);

    return {
      items: plugins,
      total: countResult[0].total,
    };
  }

  /**
   * Generic Query Interface
   */
  private async query(
    sql: string,
    params: unknown[] = [],
    options: QueryOptions = {}
  ): Promise<unknown[]> {
    const cacheKey = options.cache ? `${sql}:${JSON.stringify(params)}` : null;

    // Check cache
    if (cacheKey && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!;
      if (cached.expires > Date.now()) {
        return cached.data;
      }
    }

    // Log query if in transaction
    if (options.transaction) {
      options.transaction.queries.push({
        sql,
        params,
        timestamp: new Date(),
      });
    }

    try {
      const result = await this.executeQuery(sql, params, options);

      // Cache result
      if (cacheKey && options.cache) {
        const ttl = options.cacheTTL || 5 * 60 * 1000; // 5 minutes default
        this.queryCache.set(cacheKey, {
          data: result,
          expires: Date.now() + ttl,
        });
      }

      return result;
    } catch (error) {
      this.emit('query-error', { sql, params, error: error.message });
      throw error;
    }
  }

  /**
   * Parsing Utilities
   */
  private parseUser(row: DatabaseRow): User {
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string,
      avatar: row.avatar as string | undefined,
      isEmailVerified: row.is_email_verified as boolean,
      preferences: JSON.parse(row.preferences as string),
      subscription: JSON.parse(row.subscription as string),
      teams: JSON.parse(row.teams as string),
      createdAt: row.created_at as Date,
      lastLoginAt: row.last_login_at as Date | undefined,
    };
  }

  private parseProject(row: DatabaseRow): ProjectMetadata {
    return {
      id: row.id as ProjectId,
      name: row.name as string,
      description: row.description as string | undefined,
      ownerId: row.owner_id as UserId,
      teamId: row.team_id as TeamId | undefined,
      visibility: row.visibility as 'private' | 'team' | 'public',
      collaborators: JSON.parse(row.collaborators as string),
      tags: JSON.parse(row.tags as string),
      thumbnail: row.thumbnail as string | undefined,
      lastModified: row.last_modified as Date,
      size: row.size as number,
      nodeCount: row.node_count as number,
      cloudMetadata: JSON.parse(row.cloud_metadata as string),
    };
  }

  private parseOperation(row: DatabaseRow): CloudOperation {
    return {
      id: row.id as string,
      type: row.type as string,
      data: JSON.parse(row.data as string),
      deviceId: row.device_id as string,
      userId: row.user_id as UserId,
      timestamp: row.timestamp as number,
      versionVector: JSON.parse(row.version_vector as string),
      dependencies: JSON.parse(row.dependencies as string),
    };
  }

  private parseShareLink(row: DatabaseRow): ShareLink {
    return {
      id: row.id,
      projectId: row.project_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      accessLevel: row.access_level,
      isPublic: row.is_public,
      allowAnonymous: row.allow_anonymous,
      maxUses: row.max_uses,
      currentUses: row.current_uses,
      isActive: row.is_active,
    };
  }

  private parsePlugin(row: DatabaseRow): Plugin {
    return {
      id: row.id as PluginId,
      name: row.name as string,
      description: row.description as string,
      version: row.version as string,
      author: JSON.parse(row.author as string),
      category: row.category as import('@brepflow/cloud-api/src/types').PluginCategory,
      tags: JSON.parse(row.tags as string),
      manifest: JSON.parse(row.manifest as string),
      bundle: JSON.parse(row.bundle as string),
      marketplace: JSON.parse(row.marketplace as string),
      security: JSON.parse(row.security as string),
      stats: JSON.parse(row.stats as string),
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  /**
   * Utility Methods
   */
  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private generateUserId(): UserId {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UserId;
  }

  private generateProjectId(): ProjectId {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as ProjectId;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private invalidateUserCache(userId: UserId): void {
    for (const [key] of this.queryCache) {
      if (key.includes(userId)) {
        this.queryCache.delete(key);
      }
    }
  }

  // Provider-specific implementations
  private async createConnection(): Promise<unknown> {
    throw new Error('Database provider connection implementation required');
  }

  private async runMigrations(): Promise<void> {
    throw new Error('Database migration implementation required');
  }

  private async executeQuery(
    sql: string,
    params: unknown[],
    options: QueryOptions
  ): Promise<unknown[]> {
    throw new Error('Database query execution implementation required');
  }
}
