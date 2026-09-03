import path from 'node:path';

/** Resolve a UI asset request without allowing the path to leave distDir. */
export function resolveStaticAssetPath(distDir: string, requestUrl: string): string | undefined {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(requestUrl.split('?')[0] || '/');
  } catch {
    return undefined;
  }

  const root = path.resolve(distDir);
  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const candidate = path.resolve(root, relativePath);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    return undefined;
  }
  return candidate;
}
