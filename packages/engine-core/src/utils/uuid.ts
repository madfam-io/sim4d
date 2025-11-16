/**
 * Browser-compatible UUID v4 generator
 * Replaces the Node.js uuid package for browser compatibility
 */

/**
 * Generate a UUID v4 string
 * Uses Web Crypto API when available, falls back to Math.random()
 */
export function v4(): string {
  // Use crypto.getRandomValues if available (modern browsers and Node.js)
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const arr = new Uint8Array(16);
    globalThis.crypto.getRandomValues(arr);

    // Set version (4) and variant bits
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;

    const hex = Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-');
  }

  // Fallback to Math.random() for environments without crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function uuidv4(): string {
  return v4();
}
