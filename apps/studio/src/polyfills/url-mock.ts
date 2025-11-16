/**
 * Browser-compatible mock for Node.js url module
 * Provides essential URL utilities for browser environments
 */

export function fileURLToPath(url: string | URL): string {
  const urlStr = typeof url === 'string' ? url : url.href;
  if (urlStr.startsWith('file://')) {
    return decodeURIComponent(urlStr.slice(7));
  }
  return urlStr;
}

export function pathToFileURL(path: string): URL {
  return new URL(`file://${path}`);
}

export function format(urlObject: any): string {
  if (typeof urlObject === 'string') return urlObject;

  let url = '';
  if (urlObject.protocol) url += urlObject.protocol;
  if (urlObject.slashes || (urlObject.protocol && urlObject.hostname)) url += '//';
  if (urlObject.hostname) url += urlObject.hostname;
  if (urlObject.port) url += ':' + urlObject.port;
  if (urlObject.pathname) url += urlObject.pathname;
  if (urlObject.search) url += urlObject.search;
  if (urlObject.hash) url += urlObject.hash;

  return url;
}

export function parse(urlStr: string): any {
  try {
    const url = new URL(urlStr);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      href: url.href,
    };
  } catch {
    return {};
  }
}

export default {
  fileURLToPath,
  pathToFileURL,
  format,
  parse,
};
