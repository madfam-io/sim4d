export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  size?: number;
}

export class ComputeCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSizeMB = 100) {
    this.maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  }

  /**
   * Get value from cache
   */
  get<T = any>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set<T = any>(key: string, value: T, size?: number): void {
    // Estimate size if not provided
    if (size === undefined) {
      size = this.estimateSize(value);
    }

    // Check if we need to evict
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    // Remove old entry if exists
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.currentSize -= oldEntry.size || 0;
    }

    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      size,
    });
    this.currentSize += size;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete entry
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.currentSize -= entry.size || 0;
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    sizeBytes: number;
    sizeMB: number;
    maxSizeMB: number;
    usage: number;
  } {
    return {
      entries: this.cache.size,
      sizeBytes: this.currentSize,
      sizeMB: this.currentSize / (1024 * 1024),
      maxSizeMB: this.maxSize / (1024 * 1024),
      usage: this.currentSize / this.maxSize,
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Estimate size of a value
   */
  private estimateSize(value: unknown): number {
    // Simple estimation based on JSON serialization
    try {
      return JSON.stringify(value).length * 2; // 2 bytes per char
    } catch {
      // For non-serializable objects, use a default
      return 1024; // 1KB default
    }
  }
}
