/**
 * Browser-compatible mock for xxhash-wasm
 * This provides a fallback hash implementation that works in the browser
 */

export default function xxhash() {
  return Promise.resolve({
    h32: (data: Uint8Array | string, seed = 0) => {
      // Simple FNV-1a hash implementation
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      let hash = 2166136261;
      for (let i = 0; i < bytes.length; i++) {
        hash ^= bytes[i]!;
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    },
    h64: (data: Uint8Array | string, seed = 0) => {
      // For 64-bit hash, we'll just use the 32-bit hash twice with different seeds
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      let hash1 = 2166136261;
      let hash2 = 2166136261 + seed;

      for (let i = 0; i < bytes.length; i++) {
        hash1 ^= bytes[i]!;
        hash1 = Math.imul(hash1, 16777619);
        hash2 ^= bytes[i]!;
        hash2 = Math.imul(hash2, 16777619);
      }

      // Return as string representation of 64-bit hash
      return ((hash1 >>> 0) * 0x100000000 + (hash2 >>> 0)).toString(16);
    },
  });
}
