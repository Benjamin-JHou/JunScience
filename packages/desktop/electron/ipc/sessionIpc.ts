import { globalSessionManager } from '@junscience/core';

export function registerSessionIpcHandlers(ipcMain: any): void {
  ipcMain.handle('session:list', async () => {
    return globalSessionManager.listSessions();
  });

  ipcMain.handle('session:get', async (_event: any, id: string) => {
    return globalSessionManager.getSession(id);
  });

  ipcMain.handle('session:create', async (_event: any, payload: { title: string; agentId?: any }) => {
    return globalSessionManager.createSession(payload.title, 'proj-1', payload.agentId || 'research');
  });
}
