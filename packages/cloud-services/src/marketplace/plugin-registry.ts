/**
 * Plugin Registry
 * Central registry for plugin metadata, versioning, and distribution
 */

import EventEmitter from 'events';
import {
  PluginId,
  UserId,
  Plugin,
  PluginManifest,
  PluginBundle,
  SecurityInfo,
  PluginStats,
  Ed25519Signature,
} from '@brepflow/cloud-api/src/types';

export interface RegistryConfig {
  storage: {
    provider: 'filesystem' | 's3' | 'gcs' | 'azure';
    basePath: string;
    encryption: {
      enabled: boolean;
      algorithm: 'AES-256-GCM';
    };
  };
  versioning: {
    semanticVersioningRequired: boolean;
    allowPrereleases: boolean;
    maxVersionsPerPlugin: number;
    autoCleanupOldVersions: boolean;
  };
  security: {
    signatureValidationEnabled: boolean;
    trustedSigners: string[]; // Public keys
    quarantineUnverified: boolean;
    scanOnUpload: boolean;
  };
  distribution: {
    cdnUrl?: string;
    mirrorRegions: string[];
    cacheHeaders: {
      maxAge: number;
      staleWhileRevalidate: number;
    };
  };
}

export interface PluginVersion {
  version: string;
  publishedAt: Date;
  publishedBy: UserId;
  manifest: PluginManifest;
  bundle: PluginBundle;
  security: SecurityInfo;
  stats: PluginStats;
  deprecated: boolean;
  deprecationReason?: string;
  downloadUrl: string;
  integrityHash: string;
}

export interface PluginRegistryEntry {
  pluginId: PluginId;
  currentVersion: string;
  versions: Map<string, PluginVersion>;
  metadata: {
    name: string;
    description: string;
    author: UserId;
    category: string;
    tags: string[];
    homepage?: string;
    repository?: string;
    license: string;
  };
  registeredAt: Date;
  lastUpdated: Date;
  totalDownloads: number;
  verifiedAuthor: boolean;
  status: 'active' | 'deprecated' | 'suspended' | 'archived';
}

export interface RegistrySearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  author?: UserId;
  verified?: boolean;
  includeDeprecated?: boolean;
  sortBy?: 'name' | 'downloads' | 'updated' | 'created' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface RegistryStats {
  totalPlugins: number;
  totalVersions: number;
  totalDownloads: number;
  activePlugins: number;
  verifiedAuthors: number;
  categoriesDistribution: Record<string, number>;
  versionsDistribution: Record<string, number>; // version -> count
  securityScoreDistribution: Record<string, number>; // score range -> count
}

export class PluginRegistry extends EventEmitter {
  private config: RegistryConfig;
  private registry = new Map<PluginId, PluginRegistryEntry>();
  private indexCache = new Map<string, any>();
  private downloadCounters = new Map<string, number>();

  constructor(config: RegistryConfig) {
    super();
    this.config = config;
  }

  /**
   * Plugin Registration
   */
  async registerPlugin(
    pluginId: PluginId,
    version: string,
    manifest: PluginManifest,
    bundle: ArrayBuffer,
    publishedBy: UserId
  ): Promise<void> {
    // Validate plugin ID format
    this.validatePluginId(pluginId);

    // Validate version format
    this.validateVersion(version);

    // Validate manifest
    await this.validateManifest(manifest);

    // Verify signature if required
    if (this.config.security.signatureValidationEnabled) {
      await this.verifySignature(manifest, bundle);
    }

    // Get or create registry entry
    let entry = this.registry.get(pluginId);
    if (!entry) {
      entry = await this.createRegistryEntry(pluginId, manifest, publishedBy);
      this.registry.set(pluginId, entry);
    }

    // Check if version already exists
    if (entry.versions.has(version)) {
      throw new Error(`Version ${version} already exists for plugin ${pluginId}`);
    }

    // Create bundle with security scan
    const bundleInfo = await this.createBundle(bundle, manifest);
    const securityInfo = await this.performSecurityScan(bundle, manifest);

    // Create plugin version
    const pluginVersion: PluginVersion = {
      version,
      publishedAt: new Date(),
      publishedBy,
      manifest,
      bundle: bundleInfo,
      security: securityInfo,
      stats: this.createInitialStats(),
      deprecated: false,
      downloadUrl: await this.generateDownloadUrl(pluginId, version),
      integrityHash: await this.calculateIntegrityHash(bundle),
    };

    // Store bundle
    await this.storeBundle(pluginId, version, bundle);

    // Update registry entry
    entry.versions.set(version, pluginVersion);
    entry.currentVersion = this.findLatestVersion(entry.versions);
    entry.lastUpdated = new Date();

    // Clear relevant caches
    this.invalidateSearchCache();

    this.emit('plugin-registered', {
      pluginId,
      version,
      publishedBy,
      currentVersion: entry.currentVersion,
    });
  }

  async updatePlugin(
    pluginId: PluginId,
    version: string,
    updates: Partial<PluginVersion>,
    updatedBy: UserId
  ): Promise<void> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const pluginVersion = entry.versions.get(version);
    if (!pluginVersion) {
      throw new Error(`Version ${version} not found for plugin ${pluginId}`);
    }

    // Apply updates
    Object.assign(pluginVersion, updates);
    entry.lastUpdated = new Date();

    this.emit('plugin-updated', {
      pluginId,
      version,
      updatedBy,
      updates: Object.keys(updates),
    });
  }

  async deprecateVersion(
    pluginId: PluginId,
    version: string,
    reason: string,
    deprecatedBy: UserId
  ): Promise<void> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const pluginVersion = entry.versions.get(version);
    if (!pluginVersion) {
      throw new Error(`Version ${version} not found for plugin ${pluginId}`);
    }

    pluginVersion.deprecated = true;
    pluginVersion.deprecationReason = reason;

    // Update current version if this was the current version
    if (entry.currentVersion === version) {
      entry.currentVersion = this.findLatestNonDeprecatedVersion(entry.versions) || version;
    }

    this.emit('version-deprecated', {
      pluginId,
      version,
      reason,
      deprecatedBy,
    });
  }

  async unregisterPlugin(pluginId: PluginId, unregisteredBy: UserId): Promise<void> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Remove all stored bundles
    for (const version of entry.versions.keys()) {
      await this.removeBundleFromStorage(pluginId, version);
    }

    // Remove from registry
    this.registry.delete(pluginId);

    // Clear caches
    this.invalidateSearchCache();

    this.emit('plugin-unregistered', {
      pluginId,
      unregisteredBy,
      versionsRemoved: entry.versions.size,
    });
  }

  /**
   * Plugin Discovery
   */
  async searchPlugins(options: RegistrySearchOptions = {}): Promise<{
    plugins: PluginRegistryEntry[];
    total: number;
  }> {
    const cacheKey = this.generateSearchCacheKey(options);
    const cached = this.indexCache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    let results = Array.from(this.registry.values());

    // Apply filters
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(
        (entry) =>
          entry.metadata.name.toLowerCase().includes(query) ||
          entry.metadata.description.toLowerCase().includes(query) ||
          entry.metadata.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (options.category) {
      results = results.filter((entry) => entry.metadata.category === options.category);
    }

    if (options.tags) {
      results = results.filter((entry) =>
        options.tags!.every((tag) => entry.metadata.tags.includes(tag))
      );
    }

    if (options.author) {
      results = results.filter((entry) => entry.metadata.author === options.author);
    }

    if (options.verified !== undefined) {
      results = results.filter((entry) => entry.verifiedAuthor === options.verified);
    }

    if (!options.includeDeprecated) {
      results = results.filter((entry) => entry.status === 'active');
    }

    // Sort results
    const sortBy = options.sortBy || 'updated';
    const sortOrder = options.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.metadata.name.localeCompare(b.metadata.name);
          break;
        case 'downloads':
          comparison = a.totalDownloads - b.totalDownloads;
          break;
        case 'updated':
          comparison = a.lastUpdated.getTime() - b.lastUpdated.getTime();
          break;
        case 'created':
          comparison = a.registeredAt.getTime() - b.registeredAt.getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginatedResults = results.slice(offset, offset + limit);

    const searchResult = {
      plugins: paginatedResults,
      total: results.length,
    };

    // Cache results for 5 minutes
    this.indexCache.set(cacheKey, {
      data: searchResult,
      expires: Date.now() + 5 * 60 * 1000,
    });

    return searchResult;
  }

  async getPlugin(pluginId: PluginId): Promise<PluginRegistryEntry | null> {
    return this.registry.get(pluginId) || null;
  }

  async getPluginVersion(pluginId: PluginId, version?: string): Promise<PluginVersion | null> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      return null;
    }

    const targetVersion = version || entry.currentVersion;
    return entry.versions.get(targetVersion) || null;
  }

  async getPluginVersions(pluginId: PluginId): Promise<PluginVersion[]> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      return [];
    }

    return Array.from(entry.versions.values()).sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }

  /**
   * Download Management
   */
  async recordDownload(pluginId: PluginId, version?: string, userId?: UserId): Promise<string> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const targetVersion = version || entry.currentVersion;
    const pluginVersion = entry.versions.get(targetVersion);
    if (!pluginVersion) {
      throw new Error(`Version ${targetVersion} not found for plugin ${pluginId}`);
    }

    // Update download counters
    const downloadKey = `${pluginId}:${targetVersion}`;
    this.downloadCounters.set(downloadKey, (this.downloadCounters.get(downloadKey) || 0) + 1);

    // Update stats
    pluginVersion.stats.installs++;
    entry.totalDownloads++;

    // Generate download token for secure access
    const downloadToken = await this.generateDownloadToken(pluginId, targetVersion, userId);

    this.emit('plugin-downloaded', {
      pluginId,
      version: targetVersion,
      userId,
      downloadToken,
    });

    return downloadToken;
  }

  async getDownloadUrl(
    pluginId: PluginId,
    version?: string,
    downloadToken?: string
  ): Promise<string> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const targetVersion = version || entry.currentVersion;
    const pluginVersion = entry.versions.get(targetVersion);
    if (!pluginVersion) {
      throw new Error(`Version ${targetVersion} not found for plugin ${pluginId}`);
    }

    // Validate download token if provided
    if (downloadToken) {
      await this.validateDownloadToken(downloadToken);
    }

    return pluginVersion.downloadUrl;
  }

  /**
   * Statistics and Analytics
   */
  async getRegistryStats(): Promise<RegistryStats> {
    const stats: RegistryStats = {
      totalPlugins: this.registry.size,
      totalVersions: 0,
      totalDownloads: 0,
      activePlugins: 0,
      verifiedAuthors: 0,
      categoriesDistribution: {},
      versionsDistribution: {},
      securityScoreDistribution: {},
    };

    const verifiedAuthors = new Set<UserId>();

    for (const entry of this.registry.values()) {
      stats.totalVersions += entry.versions.size;
      stats.totalDownloads += entry.totalDownloads;

      if (entry.status === 'active') {
        stats.activePlugins++;
      }

      if (entry.verifiedAuthor) {
        verifiedAuthors.add(entry.metadata.author);
      }

      // Category distribution
      const category = entry.metadata.category;
      stats.categoriesDistribution[category] = (stats.categoriesDistribution[category] || 0) + 1;

      // Version distribution
      for (const [version] of entry.versions) {
        const majorVersion = version.split('.')[0];
        stats.versionsDistribution[majorVersion] =
          (stats.versionsDistribution[majorVersion] || 0) + 1;
      }

      // Security score distribution
      const currentVersion = entry.versions.get(entry.currentVersion);
      if (currentVersion) {
        const scoreRange = this.getScoreRange(currentVersion.security.trustScore);
        stats.securityScoreDistribution[scoreRange] =
          (stats.securityScoreDistribution[scoreRange] || 0) + 1;
      }
    }

    stats.verifiedAuthors = verifiedAuthors.size;

    return stats;
  }

  async getPluginStats(
    pluginId: PluginId,
    period?: { start: Date; end: Date }
  ): Promise<{
    downloads: number;
    versions: number;
    lastUpdate: Date;
    currentVersion: string;
    securityScore: number;
    downloadHistory: Array<{ date: Date; count: number }>;
  }> {
    const entry = this.registry.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const currentVersion = entry.versions.get(entry.currentVersion);
    const downloadHistory = await this.getDownloadHistory(pluginId, period);

    return {
      downloads: entry.totalDownloads,
      versions: entry.versions.size,
      lastUpdate: entry.lastUpdated,
      currentVersion: entry.currentVersion,
      securityScore: currentVersion?.security.trustScore || 0,
      downloadHistory,
    };
  }

  /**
   * Private Implementation Methods
   */
  private validatePluginId(pluginId: PluginId): void {
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(pluginId)) {
      throw new Error('Invalid plugin ID format. Must be lowercase alphanumeric with hyphens.');
    }
  }

  private validateVersion(version: string): void {
    if (this.config.versioning.semanticVersioningRequired) {
      if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/.test(version)) {
        throw new Error('Invalid version format. Must follow semantic versioning (x.y.z).');
      }

      if (!this.config.versioning.allowPrereleases && version.includes('-')) {
        throw new Error('Prerelease versions are not allowed.');
      }
    }
  }

  private async validateManifest(manifest: PluginManifest): Promise<void> {
    if (!manifest.id || !manifest.name || !manifest.version || !manifest.main) {
      throw new Error('Manifest missing required fields: id, name, version, main');
    }

    if (manifest.permissions) {
      await this.validatePermissions(manifest.permissions);
    }
  }

  private async validatePermissions(permissions: any): Promise<void> {
    // Validate plugin permissions
    if (permissions.networkAccess && permissions.networkAccess.length > 100) {
      throw new Error('Too many network access permissions');
    }
  }

  private async verifySignature(manifest: PluginManifest, bundle: ArrayBuffer): Promise<void> {
    if (!manifest.signature) {
      if (this.config.security.quarantineUnverified) {
        throw new Error('Plugin signature required');
      }
      return;
    }

    const signature = manifest.signature;
    const isValid = await this.cryptoVerifySignature(bundle, signature);

    if (!isValid) {
      throw new Error('Invalid plugin signature');
    }

    if (!this.config.security.trustedSigners.includes(signature.publicKey)) {
      throw new Error('Untrusted signer');
    }
  }

  private async createRegistryEntry(
    pluginId: PluginId,
    manifest: PluginManifest,
    author: UserId
  ): Promise<PluginRegistryEntry> {
    return {
      pluginId,
      currentVersion: manifest.version,
      versions: new Map(),
      metadata: {
        name: manifest.name,
        description: manifest.description,
        author,
        category: 'utility', // Default category
        tags: manifest.keywords || [],
        homepage: manifest.homepage,
        repository: manifest.repository,
        license: manifest.license,
      },
      registeredAt: new Date(),
      lastUpdated: new Date(),
      totalDownloads: 0,
      verifiedAuthor: false,
      status: 'active',
    };
  }

  private async createBundle(bundle: ArrayBuffer, manifest: PluginManifest): Promise<PluginBundle> {
    const size = bundle.byteLength;
    const checksum = await this.calculateChecksum(bundle);

    return {
      format: 'esm',
      size,
      checksum,
      compression: 'gzip',
      cdn: {
        url: await this.generateCdnUrl(manifest.id, manifest.version),
        integrity: `sha256-${checksum}`,
      },
    };
  }

  private async performSecurityScan(
    bundle: ArrayBuffer,
    manifest: PluginManifest
  ): Promise<SecurityInfo> {
    // Placeholder security scan
    return {
      scanDate: new Date(),
      scanResult: {
        status: 'safe',
        score: 85,
        issues: [],
      },
      vulnerabilities: [],
      trustScore: 85,
      verifiedAuthor: false,
    };
  }

  private createInitialStats(): PluginStats {
    return {
      installs: 0,
      activeUsers: 0,
      lastMonth: {
        installs: 0,
        uninstalls: 0,
        activeUsers: 0,
      },
      retention: {
        day1: 0,
        day7: 0,
        day30: 0,
      },
    };
  }

  private findLatestVersion(versions: Map<string, PluginVersion>): string {
    const versionArray = Array.from(versions.keys());
    versionArray.sort((a, b) => this.compareVersions(b, a)); // Descending order
    return versionArray[0];
  }

  private findLatestNonDeprecatedVersion(versions: Map<string, PluginVersion>): string | null {
    const nonDeprecated = Array.from(versions.entries())
      .filter(([, version]) => !version.deprecated)
      .map(([versionString]) => versionString);

    if (nonDeprecated.length === 0) {
      return null;
    }

    nonDeprecated.sort((a, b) => this.compareVersions(b, a)); // Descending order
    return nonDeprecated[0];
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }

    return 0;
  }

  private generateSearchCacheKey(options: RegistrySearchOptions): string {
    return `search:${JSON.stringify(options)}`;
  }

  private invalidateSearchCache(): void {
    for (const [key] of this.indexCache) {
      if (key.startsWith('search:')) {
        this.indexCache.delete(key);
      }
    }
  }

  private getScoreRange(score: number): string {
    if (score >= 90) return '90-100';
    if (score >= 80) return '80-89';
    if (score >= 70) return '70-79';
    if (score >= 60) return '60-69';
    return '0-59';
  }

  // Utility methods that would be implemented based on specific requirements
  private async generateDownloadUrl(pluginId: PluginId, version: string): Promise<string> {
    return `${this.config.distribution.cdnUrl || ''}/plugins/${pluginId}/${version}/bundle.js`;
  }

  private async calculateIntegrityHash(bundle: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bundle);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async calculateChecksum(bundle: ArrayBuffer): Promise<string> {
    return this.calculateIntegrityHash(bundle);
  }

  private async storeBundle(
    pluginId: PluginId,
    version: string,
    bundle: ArrayBuffer
  ): Promise<void> {
    // Implementation depends on storage provider
  }

  private async removeBundleFromStorage(pluginId: PluginId, version: string): Promise<void> {
    // Implementation depends on storage provider
  }

  private async generateCdnUrl(pluginId: PluginId, version: string): Promise<string> {
    return `${this.config.distribution.cdnUrl}/plugins/${pluginId}/${version}/bundle.js`;
  }

  private async cryptoVerifySignature(
    data: ArrayBuffer,
    signature: Ed25519Signature
  ): Promise<boolean> {
    // Implementation depends on crypto library
    return true; // Placeholder
  }

  private async generateDownloadToken(
    pluginId: PluginId,
    version: string,
    userId?: UserId
  ): Promise<string> {
    return `token_${pluginId}_${version}_${Date.now()}`;
  }

  private async validateDownloadToken(token: string): Promise<void> {
    // Implementation depends on token validation strategy
  }

  private async getDownloadHistory(
    pluginId: PluginId,
    period?: { start: Date; end: Date }
  ): Promise<Array<{ date: Date; count: number }>> {
    // Implementation depends on analytics storage
    return [];
  }
}
