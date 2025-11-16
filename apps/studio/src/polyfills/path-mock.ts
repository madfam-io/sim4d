/**
 * Browser-compatible mock for Node.js path module
 * Provides essential path utilities that work in browser environments
 */

export function basename(path: string, ext?: string): string {
  const base = path.split(/[\\/]/).pop() || '';
  if (ext && base.endsWith(ext)) {
    return base.slice(0, -ext.length);
  }
  return base;
}

export function dirname(path: string): string {
  const parts = path.split(/[\\/]/);
  parts.pop();
  return parts.join('/') || '/';
}

export function extname(path: string): string {
  const base = basename(path);
  const lastDot = base.lastIndexOf('.');
  return lastDot > 0 ? base.slice(lastDot) : '';
}

export function join(...paths: string[]): string {
  return paths
    .map((part) => part.replace(/[\/\\]+$/, ''))
    .filter((part) => part.length > 0)
    .join('/');
}

export function resolve(...paths: string[]): string {
  let resolved = '';
  let absolute = false;

  for (let i = paths.length - 1; i >= 0 && !absolute; i--) {
    const path = paths[i];
    if (!path) continue;

    resolved = path + '/' + resolved;
    absolute = path.charAt(0) === '/';
  }

  resolved = normalizeStringPosix(resolved, !absolute);

  if (absolute) {
    return '/' + resolved;
  }
  return resolved || '.';
}

export function relative(from: string, to: string): string {
  from = resolve(from);
  to = resolve(to);

  if (from === to) return '';

  const fromParts = from.split('/').filter((part) => part.length > 0);
  const toParts = to.split('/').filter((part) => part.length > 0);

  let commonLength = 0;
  for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
    if (fromParts[i] === toParts[i]) {
      commonLength++;
    } else {
      break;
    }
  }

  const upSteps = fromParts.length - commonLength;
  const downSteps = toParts.slice(commonLength);

  return '../'.repeat(upSteps) + downSteps.join('/');
}

export const sep = '/';
export const delimiter = ':';

function normalizeStringPosix(path: string, allowAboveRoot: boolean): string {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;

  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) {
      code = path.charCodeAt(i);
    } else if (code === 47) {
      break;
    } else {
      code = 47;
    }

    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res.charCodeAt(res.length - 1) !== 46 ||
          res.charCodeAt(res.length - 2) !== 46
        ) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) {
            res += '/..';
          } else {
            res = '..';
          }
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += '/' + path.slice(lastSlash + 1, i);
        } else {
          res = path.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

export default {
  basename,
  dirname,
  extname,
  join,
  resolve,
  relative,
  sep,
  delimiter,
};
