/**
 * Browser-compatible mock for Node.js fs module
 * Provides minimal fs interface that throws appropriate errors
 */

function createUnsupportedError(method: string) {
  return new Error(`fs.${method} is not supported in browser environments`);
}

export function readFile(): never {
  throw createUnsupportedError('readFile');
}

export function writeFile(): never {
  throw createUnsupportedError('writeFile');
}

export function readFileSync(): never {
  throw createUnsupportedError('readFileSync');
}

export function writeFileSync(): never {
  throw createUnsupportedError('writeFileSync');
}

export function existsSync(): boolean {
  return false;
}

export function statSync(): never {
  throw createUnsupportedError('statSync');
}

export function mkdirSync(): never {
  throw createUnsupportedError('mkdirSync');
}

export function readdirSync(): never {
  throw createUnsupportedError('readdirSync');
}

export default {
  readFile,
  writeFile,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  mkdirSync,
  readdirSync,
};
