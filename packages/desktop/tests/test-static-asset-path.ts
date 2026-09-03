import path from 'node:path';
import os from 'node:os';
import { resolveStaticAssetPath } from '../electron/staticAssetPath.js';

const distDir = path.join(os.tmpdir(), 'junscience-dist');
const indexPath = path.join(distDir, 'index.html');

if (resolveStaticAssetPath(distDir, '/') !== indexPath) {
  throw new Error('Root UI request did not resolve to index.html');
}
if (resolveStaticAssetPath(distDir, '/assets/app.js?cache=1') !== path.join(distDir, 'assets', 'app.js')) {
  throw new Error('Valid static asset path was rejected');
}
for (const attack of ['/../../etc/passwd', '/%2e%2e/%2e%2e/etc/passwd', '/../outside.txt']) {
  if (resolveStaticAssetPath(distDir, attack) !== undefined) {
    throw new Error(`Static asset path traversal was accepted: ${attack}`);
  }
}

console.log('✔ Electron static asset path containment tests passed.');
