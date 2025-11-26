import type { NodeInstance } from '@sim4d/types';

/**
 * Generate deterministic hash for a node
 */
export function hashNode(node: NodeInstance, inputs: unknown): string {
  const data = {
    type: node.type,
    params: node.params,
    inputs: normalizeInputs(inputs),
  };

  return hash(JSON.stringify(data));
}

/**
 * Generate hash for arbitrary data
 * Uses xxhash for performance and browser compatibility
 */
export function hash(data: string): string {
  // Use synchronous xxhash64 for immediate hashing
  // The wasm module auto-initializes on first use
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);

  // Create a simple hash using a fast algorithm that works in browser
  // This uses a simple FNV-1a hash as fallback until xxhash initializes
  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i]!;
    hash = Math.imul(hash, 16777619);
  }

  // Convert to hex string and take first 16 chars for consistency
  return (hash >>> 0).toString(16).padStart(8, '0').substring(0, 16);
}

/**
 * Normalize inputs for consistent hashing
 */
function normalizeInputs(inputs: unknown): unknown {
  if (inputs === null || inputs === undefined) {
    return null;
  }

  if (typeof inputs === 'object') {
    if (Array.isArray(inputs)) {
      return inputs.map(normalizeInputs);
    }

    // Handle shape handles
    if ('id' in inputs && 'type' in inputs) {
      return { id: inputs.id, type: inputs.type };
    }

    // Handle regular objects
    const normalized: Record<string, unknown> = {};
    const keys = Object.keys(inputs).sort();
    for (const key of keys) {
      normalized[key] = normalizeInputs(inputs[key]);
    }
    return normalized;
  }

  return inputs;
}

/**
 * Generate content hash for geometry
 */
export async function hashGeometry(data: ArrayBuffer): Promise<string> {
  // Use Web Crypto API if available (works in both browser and Node.js 15+)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  }

  // Fallback to FNV-1a hash for environments without Web Crypto API
  const bytes = new Uint8Array(data);
  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i]!;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').substring(0, 16);
}
