/**
 * Advanced Memory Management for OCCT Large Model Operations
 * Implements LRU caching, progressive mesh refinement, smart cleanup strategies,
 * and integration with WASM capability detection and performance monitoring
 */

import { WASMPerformanceMonitor } from './wasm-capability-detector';
import type { ShapeHandle, MeshData } from '@brepflow/types';

// Memory pressure levels
export enum MemoryPressure {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Default cache configuration
export const DEFAULT_CACHE_CONFIG: Partial<MemoryConfig> = {
  maxShapeCacheSize: 100,
  maxMeshCacheSize: 50,
  maxMemoryMB: 512,
  meshLODLevels: 3,
  cleanupThresholdMB: 400,
  aggressiveCleanupMB: 450,
  gcIntervalMs: 30000,
};

// Memory configuration
export interface MemoryConfig {
  maxShapeCacheSize: number; // Max shapes in memory
  maxMeshCacheSize: number; // Max meshes in memory
  maxMemoryMB: number; // Total memory limit in MB
  meshLODLevels: number; // Number of detail levels for meshes
  cleanupThresholdMB: number; // When to trigger cleanup
  aggressiveCleanupMB: number; // When to do aggressive cleanup
  gcIntervalMs: number; // Garbage collection interval

  // DEPENDENCY INJECTION for testing
  // Allows tests to provide mock performance monitor
  performanceMonitor?: {
    startMeasurement: (name: string) => (() => number) | undefined;
  };
  // Allows tests to provide mock memory provider for testing memory stats
  memoryProvider?: {
    getMemoryStats: () => { usedJSHeapSize: number; totalJSHeapSize: number };
  };
  // Allows tests to provide mock time provider for testing cache aging
  timeProvider?: {
    now: () => number;
  };
}

// Cache entry with metadata
interface CacheEntry<T> {
  data: T;
  lastAccessed: number;
  accessCount: number;
  size: number; // Size in bytes
  priority: number; // Higher = more important
  pinned: boolean; // Cannot be evicted
}

// Mesh with multiple levels of detail
interface MeshLOD {
  high: MeshData; // Full resolution
  medium?: MeshData; // 50% triangles
  low?: MeshData; // 25% triangles
  bounds: MeshData; // Bounding box only
}

export class AdvancedMemoryManager {
  private shapeCache = new Map<string, CacheEntry<ShapeHandle>>();
  private meshCache = new Map<string, CacheEntry<MeshLOD>>();
  private resultCache = new Map<string, CacheEntry<any>>();
  private memoryStats = {
    totalMemoryMB: 0,
    shapeCacheMB: 0,
    meshCacheMB: 0,
    resultCacheMB: 0,
    wasmHeapMB: 0,
    lastCleanup: 0,
    workersMemoryMB: 0,
    cacheHitRate: 0,
    evictionCount: 0,
  };

  private gcTimer: NodeJS.Timeout | null = null;
  private pressureLevel: MemoryPressure = MemoryPressure.LOW;
  private performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    evictions: 0,
    cleanupDuration: 0,
  };

  // Dependency injection - store injected or default implementations
  private readonly performanceMonitor: {
    startMeasurement: (name: string) => (() => number) | undefined;
  };
  private readonly memoryProvider: {
    getMemoryStats: () => { usedJSHeapSize: number; totalJSHeapSize: number };
  };
  private readonly timeProvider: {
    now: () => number;
  };

  constructor(private config: MemoryConfig) {
    // Initialize injected dependencies or use defaults
    this.performanceMonitor = config.performanceMonitor || WASMPerformanceMonitor;
    this.memoryProvider = config.memoryProvider || {
      getMemoryStats: () => {
        if (typeof performance !== 'undefined' && 'memory' in performance) {
          return (performance as any).memory;
        }
        return { usedJSHeapSize: 0, totalJSHeapSize: 0 };
      },
    };
    this.timeProvider = config.timeProvider || { now: () => this.timeProvider.now() };

    console.log('[MemoryManager] Initialized with enhanced config:', {
      hasCustomPerformanceMonitor: !!config.performanceMonitor,
      hasCustomMemoryProvider: !!config.memoryProvider,
      hasCustomTimeProvider: !!config.timeProvider,
    });

    this.startMemoryMonitoring();
  }

  /**
   * Store shape handle with intelligent caching and performance monitoring
   */
  cacheShape(id: string, shape: ShapeHandle, priority: number = 1): void {
    const endMeasurement = this.performanceMonitor.startMeasurement('cache-shape-store');
    const size = this.estimateShapeSize(shape);

    // Check if we need to evict before adding
    this.ensureSpace('shape', size);

    const entry: CacheEntry<ShapeHandle> = {
      data: shape,
      lastAccessed: this.timeProvider.now(),
      accessCount: 1,
      size,
      priority,
      pinned: priority >= 10, // High priority shapes are pinned
    };

    this.shapeCache.set(id, entry);
    this.memoryStats.shapeCacheMB += size / (1024 * 1024);

    if (endMeasurement) endMeasurement();
    console.log(
      `[MemoryManager] Cached shape ${id} (${Math.round(size / 1024)}KB, priority: ${priority})`
    );
  }

  /**
   * Cache operation results for performance optimization
   */
  cacheResult(operationKey: string, result: unknown, priority: number = 1): void {
    const endMeasurement = this.performanceMonitor.startMeasurement('cache-result-store');
    const size = this.estimateResultSize(result);

    this.ensureSpace('result', size);

    const entry: CacheEntry<any> = {
      data: result,
      lastAccessed: this.timeProvider.now(),
      accessCount: 1,
      size,
      priority,
      pinned: priority >= 10,
    };

    this.resultCache.set(operationKey, entry);
    this.memoryStats.resultCacheMB += size / (1024 * 1024);

    if (endMeasurement) endMeasurement();
    console.log(`[MemoryManager] Cached result ${operationKey} (${Math.round(size / 1024)}KB)`);
  }

  /**
   * Get cached operation result
   */
  getResult(operationKey: string): any | null {
    const endMeasurement = this.performanceMonitor.startMeasurement('cache-result-get');
    const entry = this.resultCache.get(operationKey);

    if (!entry) {
      this.performanceMetrics.cacheMisses++;
      if (endMeasurement) endMeasurement();
      return null;
    }

    // Update access statistics
    entry.lastAccessed = this.timeProvider.now();
    entry.accessCount++;
    this.performanceMetrics.cacheHits++;

    if (endMeasurement) endMeasurement();
    return entry.data;
  }

  /**
   * Store mesh with multiple levels of detail
   */
  async cacheMesh(id: string, meshData: MeshData, priority: number = 1): Promise<void> {
    // Generate LOD levels
    const meshLOD: MeshLOD = {
      high: meshData,
      bounds: this.generateBoundingBoxMesh(meshData),
    };

    // Generate medium and low detail versions for large meshes
    if (meshData.indices.length > 10000) {
      meshLOD.medium = await this.decimateMesh(meshData, 0.5);
      meshLOD.low = await this.decimateMesh(meshData, 0.25);
    }

    const size = this.estimateMeshLODSize(meshLOD);
    this.ensureSpace('mesh', size);

    const entry: CacheEntry<MeshLOD> = {
      data: meshLOD,
      lastAccessed: this.timeProvider.now(),
      accessCount: 1,
      size,
      priority,
      pinned: priority >= 10,
    };

    this.meshCache.set(id, entry);
    this.memoryStats.meshCacheMB += size / (1024 * 1024);

    console.log(
      `[MemoryManager] Cached mesh LOD ${id} (${Math.round(size / 1024)}KB, priority: ${priority})`
    );
  }

  /**
   * Retrieve shape with access tracking and performance monitoring
   */
  getShape(id: string): ShapeHandle | null {
    const endMeasurement = this.performanceMonitor.startMeasurement('cache-shape-get');
    const entry = this.shapeCache.get(id);

    if (!entry) {
      this.performanceMetrics.cacheMisses++;
      if (endMeasurement) endMeasurement();
      return null;
    }

    // Update access statistics
    entry.lastAccessed = this.timeProvider.now();
    entry.accessCount++;
    this.performanceMetrics.cacheHits++;

    if (endMeasurement) endMeasurement();
    return entry.data;
  }

  /**
   * Get mesh at appropriate detail level based on memory pressure with performance monitoring
   */
  getMesh(id: string, requestedLOD?: 'high' | 'medium' | 'low' | 'bounds'): MeshData | null {
    const endMeasurement = this.performanceMonitor.startMeasurement('cache-mesh-get');
    const entry = this.meshCache.get(id);

    if (!entry) {
      this.performanceMetrics.cacheMisses++;
      if (endMeasurement) endMeasurement();
      return null;
    }

    // Update access statistics
    entry.lastAccessed = this.timeProvider.now();
    entry.accessCount++;
    this.performanceMetrics.cacheHits++;

    const meshLOD = entry.data;

    // Determine LOD based on memory pressure if not specified
    if (!requestedLOD) {
      switch (this.pressureLevel) {
        case MemoryPressure.LOW:
          requestedLOD = 'high';
          break;
        case MemoryPressure.MEDIUM:
          requestedLOD = meshLOD.medium ? 'medium' : 'high';
          break;
        case MemoryPressure.HIGH:
          requestedLOD = meshLOD.low ? 'low' : 'medium';
          break;
        case MemoryPressure.CRITICAL:
          requestedLOD = 'bounds';
          break;
      }
    }

    // Return the requested LOD, falling back as needed
    let result: MeshData;
    switch (requestedLOD) {
      case 'high':
        result = meshLOD.high;
        break;
      case 'medium':
        result = meshLOD.medium || meshLOD.high;
        break;
      case 'low':
        result = meshLOD.low || meshLOD.medium || meshLOD.high;
        break;
      case 'bounds':
        result = meshLOD.bounds;
        break;
      default:
        result = meshLOD.high;
    }

    if (endMeasurement) endMeasurement();
    return result;
  }

  /**
   * Update worker memory usage tracking
   */
  updateWorkerMemoryUsage(memoryMB: number): void {
    this.memoryStats.workersMemoryMB = memoryMB;
    this.updateMemoryPressure();
  }

  /**
   * Generate operation cache key with parameter hashing
   */
  generateOperationKey(operation: string, params: unknown): string {
    // Simple hash of operation and parameters
    const paramStr = JSON.stringify(params, Object.keys(params).sort());
    return `${operation}_${this.simpleHash(paramStr)}`;
  }

  /**
   * Simple string hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Remove specific entries from cache
   */
  evict(id: string): boolean {
    const shapeEntry = this.shapeCache.get(id);
    const meshEntry = this.meshCache.get(id);

    let evicted = false;

    if (shapeEntry && !shapeEntry.pinned) {
      this.memoryStats.shapeCacheMB -= shapeEntry.size / (1024 * 1024);
      this.shapeCache.delete(id);
      evicted = true;
    }

    if (meshEntry && !meshEntry.pinned) {
      this.memoryStats.meshCacheMB -= meshEntry.size / (1024 * 1024);
      this.meshCache.delete(id);
      evicted = true;
    }

    return evicted;
  }

  /**
   * Ensure we have enough space for new data (enhanced with result cache support)
   */
  private ensureSpace(type: 'shape' | 'mesh' | 'result', requiredSize: number): void {
    let cache: Map<string, CacheEntry<any>>;
    let currentMemory: number;
    let maxSize: number;

    switch (type) {
      case 'shape':
        cache = this.shapeCache;
        currentMemory = this.memoryStats.shapeCacheMB;
        maxSize = this.config.maxShapeCacheSize;
        break;
      case 'mesh':
        cache = this.meshCache;
        currentMemory = this.memoryStats.meshCacheMB;
        maxSize = this.config.maxMeshCacheSize;
        break;
      case 'result':
        cache = this.resultCache;
        currentMemory = this.memoryStats.resultCacheMB;
        maxSize = this.config.maxShapeCacheSize; // Use same limit as shapes for results
        break;
    }

    // Check if we exceed limits
    if (
      cache.size >= maxSize ||
      currentMemory + requiredSize / (1024 * 1024) > this.config.maxMemoryMB * 0.8
    ) {
      this.evictLRU(type, requiredSize);
    }
  }

  /**
   * Evict least recently used entries (enhanced with result cache support)
   */
  private evictLRU(type: 'shape' | 'mesh' | 'result', requiredSize: number): void {
    const endMeasurement = this.performanceMonitor.startMeasurement('cache-eviction');
    let cache: Map<string, CacheEntry<any>>;

    switch (type) {
      case 'shape':
        cache = this.shapeCache;
        break;
      case 'mesh':
        cache = this.meshCache;
        break;
      case 'result':
        cache = this.resultCache;
        break;
    }

    const entries = Array.from(cache.entries())
      .filter(([_, entry]) => !entry.pinned)
      .map(([id, entry]) => ({ id, entry }))
      .sort((a, b) => {
        // Sort by composite score (recency, frequency, priority)
        const scoreA = this.calculateEvictionScore(a.entry);
        const scoreB = this.calculateEvictionScore(b.entry);
        return scoreA - scoreB; // Lower score = more likely to evict
      });

    let freedSize = 0;
    let evicted = 0;

    for (const { id, entry } of entries) {
      if (freedSize >= requiredSize && evicted >= 5) break; // Don't over-evict

      freedSize += entry.size;
      cache.delete(id);
      evicted++;

      // Update memory stats based on type
      switch (type) {
        case 'shape':
          this.memoryStats.shapeCacheMB -= entry.size / (1024 * 1024);
          break;
        case 'mesh':
          this.memoryStats.meshCacheMB -= entry.size / (1024 * 1024);
          break;
        case 'result':
          this.memoryStats.resultCacheMB -= entry.size / (1024 * 1024);
          break;
      }
    }

    this.performanceMetrics.evictions += evicted;
    if (endMeasurement) endMeasurement();
    console.log(
      `[MemoryManager] Evicted ${evicted} ${type} entries, freed ${Math.round(freedSize / 1024)}KB`
    );
  }

  /**
   * Calculate eviction score (lower = more likely to evict)
   */
  private calculateEvictionScore(entry: CacheEntry<any>): number {
    const now = this.timeProvider.now();
    const ageMinutes = (now - entry.lastAccessed) / (1000 * 60);
    const frequencyBonus = Math.min(entry.accessCount / 10, 5); // Max 5 point bonus
    const priorityBonus = entry.priority * 2;

    // Lower score = more likely to evict
    return priorityBonus + frequencyBonus - ageMinutes / 60;
  }

  /**
   * Start periodic memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.gcTimer = setInterval(() => {
      this.updateMemoryStats();
      this.updateMemoryPressure();
      this.performMaintenanceCleanup();
    }, this.config.gcIntervalMs);
  }

  /**
   * Update memory statistics
   * Uses injected memory provider for testability
   */
  private updateMemoryStats(): void {
    // Get JavaScript heap usage via injected provider
    const memory = this.memoryProvider.getMemoryStats();
    this.memoryStats.totalMemoryMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));

    // Update cache sizes (already tracked incrementally)
    console.log('[MemoryManager] Stats:', this.memoryStats);
  }

  /**
   * Update memory pressure level
   */
  private updateMemoryPressure(): void {
    const totalMemory = this.memoryStats.totalMemoryMB;
    const threshold = this.config.maxMemoryMB;

    if (totalMemory > threshold * 0.9) {
      this.pressureLevel = MemoryPressure.CRITICAL;
    } else if (totalMemory > threshold * 0.75) {
      this.pressureLevel = MemoryPressure.HIGH;
    } else if (totalMemory > threshold * 0.6) {
      this.pressureLevel = MemoryPressure.MEDIUM;
    } else {
      this.pressureLevel = MemoryPressure.LOW;
    }
  }

  /**
   * Perform regular maintenance cleanup with enhanced monitoring
   */
  private performMaintenanceCleanup(): void {
    const cleanupStart = this.timeProvider.now();
    const endMeasurement = this.performanceMonitor.startMeasurement('memory-cleanup');

    // Skip if cleaned up recently
    if (cleanupStart - this.memoryStats.lastCleanup < 30000) return;

    if (
      this.pressureLevel === MemoryPressure.HIGH ||
      this.pressureLevel === MemoryPressure.CRITICAL
    ) {
      console.log(`[MemoryManager] Performing ${this.pressureLevel} pressure cleanup`);

      // Aggressive cleanup - remove older, less used entries
      this.evictByAge(300000); // 5 minutes old

      // Reduce mesh detail levels in memory
      this.degradeMeshQuality();

      // Clean result cache more aggressively during high pressure
      this.cleanResultCache(120000); // 2 minutes old for results
    } else {
      // Regular maintenance cleanup
      this.evictByAge(1800000); // 30 minutes old
      this.cleanResultCache(600000); // 10 minutes old for results
    }

    this.memoryStats.lastCleanup = cleanupStart;
    this.performanceMetrics.cleanupDuration = this.timeProvider.now() - cleanupStart;

    if (endMeasurement) endMeasurement();
  }

  /**
   * Clean result cache based on age
   */
  private cleanResultCache(maxAgeMs: number): void {
    const now = this.timeProvider.now();
    let cleaned = 0;

    for (const [id, entry] of this.resultCache.entries()) {
      if (!entry.pinned && now - entry.lastAccessed > maxAgeMs) {
        this.memoryStats.resultCacheMB -= entry.size / (1024 * 1024);
        this.resultCache.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[MemoryManager] Cleaned ${cleaned} result cache entries`);
    }
  }

  /**
   * Evict entries older than specified age
   */
  private evictByAge(maxAgeMs: number): void {
    const now = this.timeProvider.now();
    let evicted = 0;

    // Clean shape cache
    for (const [id, entry] of this.shapeCache.entries()) {
      if (!entry.pinned && now - entry.lastAccessed > maxAgeMs) {
        this.memoryStats.shapeCacheMB -= entry.size / (1024 * 1024);
        this.shapeCache.delete(id);
        evicted++;
      }
    }

    // Clean mesh cache
    for (const [id, entry] of this.meshCache.entries()) {
      if (!entry.pinned && now - entry.lastAccessed > maxAgeMs) {
        this.memoryStats.meshCacheMB -= entry.size / (1024 * 1024);
        this.meshCache.delete(id);
        evicted++;
      }
    }

    if (evicted > 0) {
      console.log(`[MemoryManager] Age-based cleanup evicted ${evicted} entries`);
    }
  }

  /**
   * Degrade mesh quality to save memory
   */
  private degradeMeshQuality(): void {
    for (const [_id, entry] of this.meshCache.entries()) {
      const meshLOD = entry.data;

      // Remove high detail if we have medium
      if (meshLOD.medium && meshLOD.high) {
        const savedSize = this.estimateMeshSize(meshLOD.high);
        meshLOD.high = meshLOD.medium;
        entry.size -= savedSize;
        this.memoryStats.meshCacheMB -= savedSize / (1024 * 1024);
      }
    }
  }

  /**
   * Generate simple mesh decimation (basic implementation)
   */
  private async decimateMesh(mesh: MeshData, factor: number): Promise<MeshData> {
    // Simple decimation - take every nth triangle
    const targetTriangles = Math.floor((mesh.indices.length / 3) * factor);
    const step = Math.max(1, Math.floor(mesh.indices.length / 3 / targetTriangles));

    const newIndices: number[] = [];
    for (let i = 0; i < mesh.indices.length; i += step * 3) {
      if (i + 2 < mesh.indices.length) {
        newIndices.push(mesh.indices[i], mesh.indices[i + 1], mesh.indices[i + 2]);
      }
    }

    return {
      positions: mesh.positions, // Reuse vertices
      normals: mesh.normals,
      indices: new Uint32Array(newIndices),
      edges: mesh.edges, // Could also decimate edges
      vertexCount: mesh.vertexCount,
      triangleCount: newIndices.length / 3,
      edgeCount: mesh.edgeCount,
    };
  }

  /**
   * Generate bounding box mesh for very low detail
   */
  private generateBoundingBoxMesh(mesh: MeshData): MeshData {
    // Find bounds
    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < mesh.positions.length; i += 3) {
      minX = Math.min(minX, mesh.positions[i]);
      minY = Math.min(minY, mesh.positions[i + 1]);
      minZ = Math.min(minZ, mesh.positions[i + 2]);
      maxX = Math.max(maxX, mesh.positions[i]);
      maxY = Math.max(maxY, mesh.positions[i + 1]);
      maxZ = Math.max(maxZ, mesh.positions[i + 2]);
    }

    // Create box vertices
    const positions = new Float32Array([
      minX,
      minY,
      minZ,
      maxX,
      minY,
      minZ,
      maxX,
      maxY,
      minZ,
      minX,
      maxY,
      minZ, // Bottom
      minX,
      minY,
      maxZ,
      maxX,
      minY,
      maxZ,
      maxX,
      maxY,
      maxZ,
      minX,
      maxY,
      maxZ, // Top
    ]);

    // Create box normals (simple)
    const normals = new Float32Array([
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    ]);

    // Create box indices (12 triangles)
    const indices = new Uint32Array([
      0,
      1,
      2,
      0,
      2,
      3, // Bottom
      4,
      7,
      6,
      4,
      6,
      5, // Top
      0,
      3,
      7,
      0,
      7,
      4, // Left
      1,
      5,
      6,
      1,
      6,
      2, // Right
      3,
      2,
      6,
      3,
      6,
      7, // Front
      0,
      4,
      5,
      0,
      5,
      1, // Back
    ]);

    return {
      positions,
      normals,
      indices,
      edges: new Uint32Array([]), // No edges for bounds
      vertexCount: 8,
      triangleCount: 12,
      edgeCount: 0,
    };
  }

  /**
   * Estimate memory size of shape handle
   */
  private estimateShapeSize(_shape: ShapeHandle): number {
    // Base size for shape handle data
    return 1024; // 1KB base estimate
  }

  /**
   * Estimate memory size of mesh data
   */
  private estimateMeshSize(mesh: MeshData): number {
    let size = 0;
    size += mesh.positions.byteLength;
    size += mesh.normals.byteLength;
    size += mesh.indices.byteLength;
    if (mesh.edges) size += mesh.edges.byteLength;
    if (mesh.uvs) size += mesh.uvs.byteLength;
    return size;
  }

  /**
   * Estimate memory size of mesh LOD
   */
  private estimateMeshLODSize(meshLOD: MeshLOD): number {
    let size = this.estimateMeshSize(meshLOD.high);
    if (meshLOD.medium) size += this.estimateMeshSize(meshLOD.medium);
    if (meshLOD.low) size += this.estimateMeshSize(meshLOD.low);
    size += this.estimateMeshSize(meshLOD.bounds);
    return size;
  }

  /**
   * Estimate memory size of operation result
   */
  private estimateResultSize(result: unknown): number {
    try {
      // If result is a shape handle or mesh, estimate more accurately
      if (result && typeof result === 'object') {
        if (result.positions && result.indices) {
          // It's mesh data
          return this.estimateMeshSize(result);
        } else if (result.id && result.type) {
          // It's a shape handle
          return this.estimateShapeSize(result);
        }
      }

      // For other results, use JSON string length approximation
      const jsonStr = JSON.stringify(result);
      return jsonStr.length * 2; // UTF-16 approximation
    } catch {
      // Fallback for non-serializable objects
      return 1024; // 1KB default
    }
  }

  /**
   * Get current memory pressure level
   */
  getMemoryPressure(): MemoryPressure {
    return this.pressureLevel;
  }

  /**
   * Get enhanced memory and performance statistics
   */
  getStats() {
    // Update cache hit rate
    const totalCacheOps = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
    this.memoryStats.cacheHitRate =
      totalCacheOps > 0 ? this.performanceMetrics.cacheHits / totalCacheOps : 0;

    return {
      ...this.memoryStats,
      shapeCount: this.shapeCache.size,
      meshCount: this.meshCache.size,
      resultCount: this.resultCache.size,
      pressureLevel: this.pressureLevel,
      performance: {
        ...this.performanceMetrics,
        cacheHitRate: this.memoryStats.cacheHitRate,
        avgCleanupDuration: this.performanceMetrics.cleanupDuration,
      },
      breakdown: {
        shapes: `${this.shapeCache.size} entries, ${this.memoryStats.shapeCacheMB.toFixed(1)}MB`,
        meshes: `${this.meshCache.size} entries, ${this.memoryStats.meshCacheMB.toFixed(1)}MB`,
        results: `${this.resultCache.size} entries, ${this.memoryStats.resultCacheMB.toFixed(1)}MB`,
        workers: `${this.memoryStats.workersMemoryMB.toFixed(1)}MB`,
      },
    };
  }

  /**
   * Generate comprehensive memory report
   */
  generateMemoryReport(): string {
    const stats = this.getStats();

    return `
=== Enhanced Memory Manager Report ===
Pressure Level: ${stats.pressureLevel.toUpperCase()}
Total Memory: ${stats.totalMemoryMB.toFixed(1)}MB

=== Cache Statistics ===
Shapes: ${stats.breakdown.shapes}
Meshes: ${stats.breakdown.meshes}
Results: ${stats.breakdown.results}
Workers: ${stats.breakdown.workers}

=== Performance Metrics ===
Cache Hit Rate: ${(stats.performance.cacheHitRate * 100).toFixed(1)}%
Cache Hits: ${stats.performance.cacheHits}
Cache Misses: ${stats.performance.cacheMisses}
Total Evictions: ${stats.performance.evictions}
Avg Cleanup Duration: ${stats.performance.avgCleanupDuration}ms

=== Memory Pressure Indicators ===
${stats.pressureLevel === 'critical' ? '🔴 CRITICAL - Immediate cleanup required' : ''}
${stats.pressureLevel === 'high' ? '🟡 HIGH - Consider reducing operations' : ''}
${stats.pressureLevel === 'medium' ? '🟢 MEDIUM - Normal operation' : ''}
${stats.pressureLevel === 'low' ? '✅ LOW - Optimal conditions' : ''}
    `.trim();
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    let totalAccesses = 0;
    let totalEntries = 0;

    for (const entry of this.shapeCache.values()) {
      totalAccesses += entry.accessCount;
      totalEntries++;
    }

    for (const entry of this.meshCache.values()) {
      totalAccesses += entry.accessCount;
      totalEntries++;
    }

    return totalEntries > 0 ? totalAccesses / totalEntries : 0;
  }

  /**
   * Force garbage collection and cleanup
   */
  forceCleanup(): void {
    console.log('[MemoryManager] Forcing cleanup');
    this.evictByAge(0); // Evict everything not pinned

    // Trigger JavaScript garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  /**
   * Shutdown memory manager
   */
  shutdown(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }

    this.shapeCache.clear();
    this.meshCache.clear();

    console.log('[MemoryManager] Shutdown complete');
  }
}

// Default memory configuration
export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxShapeCacheSize: 1000,
  maxMeshCacheSize: 500,
  maxMemoryMB: 1500, // 1.5GB
  meshLODLevels: 4,
  cleanupThresholdMB: 1200,
  aggressiveCleanupMB: 1400,
  gcIntervalMs: 15000, // 15 seconds
};

// Global memory manager instance
let globalMemoryManager: AdvancedMemoryManager | null = null;

/**
 * Get or create the global memory manager
 */
export function getMemoryManager(config?: Partial<MemoryConfig>): AdvancedMemoryManager {
  if (!globalMemoryManager) {
    globalMemoryManager = new AdvancedMemoryManager({ ...DEFAULT_MEMORY_CONFIG, ...config });
  }
  return globalMemoryManager;
}

/**
 * Create a new memory manager instance
 */
export function createMemoryManager(config?: Partial<MemoryConfig>): AdvancedMemoryManager {
  return new AdvancedMemoryManager({ ...DEFAULT_MEMORY_CONFIG, ...config });
}

/**
 * Shutdown the global memory manager
 */
export function shutdownGlobalMemoryManager(): void {
  if (globalMemoryManager) {
    globalMemoryManager.shutdown();
    globalMemoryManager = null;
  }
}
