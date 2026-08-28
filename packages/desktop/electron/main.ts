import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { registerModelIpcHandlers } from './ipc/modelIpc.js';
import { registerAgentIpcHandlers } from './ipc/agentIpc.js';
import { registerSessionIpcHandlers } from './ipc/sessionIpc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let staticServer: http.Server | null = null;

function createInternalServer(distDir: string): Promise<number> {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
  };

  return new Promise((resolve) => {
    staticServer = http.createServer((req, res) => {
      let reqPath = (req.url || '/').split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(distDir, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        // SPA Fallback
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
      }
    });

    staticServer.listen(0, '127.0.0.1', () => {
      const addr = staticServer!.address() as any;
      console.log(`[JunScience Desktop] Internal UI server running on http://127.0.0.1:${addr.port}`);
      resolve(addr.port);
    });
  });
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#090d16',
    titleBarStyle: 'hiddenInset',
    title: 'JunScience — AI for Scientific Discovery',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron did-fail-load] Code: ${errorCode}, Error: ${errorDescription}, URL: ${validatedURL}`);
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] [L${level}] ${message} (${sourceId}:${line})`);
  });

  const distDir = path.join(__dirname, '../dist');
  const port = await createInternalServer(distDir);
  const targetUrl = `http://127.0.0.1:${port}`;

  console.log(`[JunScience Desktop] Loading window URL: ${targetUrl}`);
  await mainWindow.loadURL(targetUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (staticServer) {
      staticServer.close();
      staticServer = null;
    }
  });
}

// Register IPC handlers
registerModelIpcHandlers(ipcMain);
registerAgentIpcHandlers(ipcMain, () => mainWindow);
registerSessionIpcHandlers(ipcMain);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
