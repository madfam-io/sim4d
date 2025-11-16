/**
 * Browser-compatible mock for Node.js crypto module
 * Uses Web Crypto API where available, provides fallbacks otherwise
 */

export function randomBytes(size: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(size));
  }

  // Fallback using Math.random (less secure)
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function createHash(algorithm: string) {
  let inputData: string | Uint8Array = '';

  return {
    update(data: string | Uint8Array) {
      inputData = data;
      return this;
    },
    digest(encoding?: string) {
      // Simple hash fallback
      const str = typeof inputData === 'string' ? inputData : String.fromCharCode(...inputData);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      if (encoding === 'hex') {
        return Math.abs(hash).toString(16);
      }
      return new Uint8Array([
        hash & 0xff,
        (hash >> 8) & 0xff,
        (hash >> 16) & 0xff,
        (hash >> 24) & 0xff,
      ]);
    },
  };
}

export function createHmac(algorithm: string, key: string | Uint8Array) {
  return createHash(algorithm);
}

export const constants = {
  SSL_OP_NO_SSLv2: 0x01000000,
  SSL_OP_NO_SSLv3: 0x02000000,
  SSL_OP_NO_TLSv1: 0x04000000,
  SSL_OP_NO_TLSv1_1: 0x10000000,
  SSL_OP_NO_TLSv1_2: 0x08000000,
};

export default {
  randomBytes,
  createHash,
  createHmac,
  constants,
};
