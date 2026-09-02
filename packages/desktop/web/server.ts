import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fallbackMockProvider,
  GenericModelClient,
  globalEventBus,
  globalProfileManager,
  globalResearchEngine,
  globalSessionManager,
  type AgentId,
  type ModelProfile,
} from '@junscience/core';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(packageRoot, 'dist');
const isDevelopment = process.argv.includes('--dev');
const requestedPort = Number.parseInt(process.env.JUNSCIENCE_WEB_PORT || '3000', 10);
const port = Number.isFinite(requestedPort) ? requestedPort : 3000;
const host = '127.0.0.1';

const eventClients = new Set<ServerResponse>();

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(body));
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1024 * 1024) throw new Error('Request body exceeds 1 MiB');
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {} as T;
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

function isTrustedRequest(req: IncomingMessage): boolean {
  const hostHeader = req.headers.host || '';
  const localHost = hostHeader === `${host}:${port}` || hostHeader === `localhost:${port}`;
  if (!localHost) return false;

  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const localOrigin = originUrl.hostname === host || originUrl.hostname === 'localhost';
    return originUrl.protocol === 'http:' && originUrl.port === String(port) && localOrigin;
  } catch {
    return false;
  }
}

function sanitizeProfile(profile: ModelProfile | undefined): ModelProfile | undefined {
  return profile ? { ...profile, apiKey: '' } : undefined;
}

function profileWithStoredSecret(profile: ModelProfile): ModelProfile {
  if (profile.apiKey) return profile;
  const stored = profile.id ? globalProfileManager.getProfile(profile.id) : undefined;
  return stored?.apiKey ? { ...profile, apiKey: stored.apiKey } : profile;
}

function broadcast(event: 'runtime' | 'delta', payload: unknown): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  eventClients.forEach((client) => client.write(message));
}

globalEventBus.onAll((event) => broadcast('runtime', event));

async function handleApi(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
  if (!url.pathname.startsWith('/api/')) return false;
  if (!isTrustedRequest(req)) {
    sendJson(res, 403, { error: 'Only same-origin loopback requests are allowed' });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok', mode: 'local-web' });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': connected\n\n');
    eventClients.add(res);
    req.on('close', () => eventClients.delete(res));
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/model/profiles') {
    sendJson(res, 200, globalProfileManager.listProfiles().map(sanitizeProfile));
    return true;
  }
  if (req.method === 'GET' && url.pathname === '/api/model/active') {
    sendJson(res, 200, sanitizeProfile(globalProfileManager.getActiveProfile()));
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/model/profiles') {
    const incoming = await readJson<ModelProfile>(req);
    const result = globalProfileManager.saveProfile(profileWithStoredSecret(incoming));
    sendJson(res, result.success ? 200 : 400, {
      ...result,
      profile: sanitizeProfile(result.profile),
    });
    return true;
  }
  const profileMatch = url.pathname.match(/^\/api\/model\/profiles\/([^/]+)$/);
  if (req.method === 'DELETE' && profileMatch) {
    sendJson(res, 200, globalProfileManager.deleteProfile(decodeURIComponent(profileMatch[1])));
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/model/active') {
    const { id } = await readJson<{ id?: string }>(req);
    sendJson(res, 200, Boolean(id && globalProfileManager.setActiveProfile(id)));
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/model/test') {
    const incoming = profileWithStoredSecret(await readJson<ModelProfile>(req));
    const provider = incoming.baseUrl && incoming.model ? new GenericModelClient(incoming) : fallbackMockProvider;
    sendJson(res, 200, await provider.testConnection());
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/sessions') {
    sendJson(res, 200, globalSessionManager.listSessions());
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/sessions') {
    const body = await readJson<{
      title?: string;
      agentId?: AgentId;
      profileId?: string;
      modelName?: string;
    }>(req);
    const session = globalSessionManager.createSession(
      body.title?.trim() || 'New Scientific Exploration',
      'proj-1',
      body.agentId || 'research',
      body.profileId,
      body.modelName,
    );
    sendJson(res, 201, session);
    return true;
  }
  const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)$/);
  if (req.method === 'GET' && sessionMatch) {
    const session = globalSessionManager.getSession(decodeURIComponent(sessionMatch[1]));
    sendJson(res, session ? 200 : 404, session || { error: 'Session not found' });
    return true;
  }
  if (req.method === 'DELETE' && sessionMatch) {
    sendJson(res, 200, globalSessionManager.deleteSession(decodeURIComponent(sessionMatch[1])));
    return true;
  }
  const renameMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/rename$/);
  if (req.method === 'POST' && renameMatch) {
    const { title } = await readJson<{ title?: string }>(req);
    sendJson(
      res,
      200,
      Boolean(title && globalSessionManager.renameSession(decodeURIComponent(renameMatch[1]), title)),
    );
    return true;
  }
  const exportMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/export$/);
  if (req.method === 'GET' && exportMatch) {
    sendJson(res, 200, globalSessionManager.exportSessionMarkdown(decodeURIComponent(exportMatch[1])));
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/agent/inquiries') {
    const body = await readJson<{ prompt?: string; sessionId?: string }>(req);
    const prompt = body.prompt?.trim();
    if (!prompt) {
      sendJson(res, 400, { error: 'A non-empty prompt is required' });
      return true;
    }
    const result = await globalResearchEngine.executeInquiry(prompt, body.sessionId, (delta) => {
      broadcast('delta', delta);
    });
    sendJson(res, 200, result);
    return true;
  }

  sendJson(res, 404, { error: 'API endpoint not found' });
  return true;
}

function serveStatic(res: ServerResponse, pathname: string): void {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(res, 400, { error: 'Invalid URL encoding' });
    return;
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const candidate = path.resolve(distDir, relativePath);
  const safeCandidate = candidate === distDir || candidate.startsWith(`${distDir}${path.sep}`);
  const filePath = safeCandidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    ? candidate
    : path.join(distDir, 'index.html');
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
  };
  res.writeHead(200, {
    'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  fs.createReadStream(filePath).pipe(res);
}

async function start(): Promise<void> {
  let viteMiddleware: ((req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => void) | undefined;
  if (isDevelopment) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: packageRoot,
      appType: 'spa',
      server: { middlewareMode: true },
    });
    viteMiddleware = vite.middlewares;
  } else if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error('Web assets are missing. Run `npm --workspace=@junscience/desktop run build:renderer` first.');
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || `${host}:${port}`}`);
      if (await handleApi(req, res, url)) return;
      if (viteMiddleware) {
        viteMiddleware(req, res, (error) => {
          if (error) sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
        });
        return;
      }
      serveStatic(res, url.pathname);
    } catch (error) {
      console.error('[JunScience Web]', error);
      if (!res.headersSent) {
        sendJson(res, 500, { error: error instanceof Error ? error.message : 'Internal server error' });
      } else {
        res.end();
      }
    }
  });

  server.listen(port, host, () => {
    console.log(`\nJunScience local web is running at http://${host}:${port}`);
    console.log('The server is bound to loopback only. Press Ctrl+C to stop.\n');
  });
}

start().catch((error) => {
  console.error('[JunScience Web] Failed to start:', error);
  process.exitCode = 1;
});
