import {
  globalResearchEngine,
  globalEventBus,
  RuntimeEvent,
} from '@junscience/core';

export function registerAgentIpcHandlers(ipcMain: any, getMainWindow: () => any): void {
  // Listen to all core runtime events and forward them via IPC to renderer
  globalEventBus.onAll((event: RuntimeEvent) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('agent:event', event);
    }
  });

  ipcMain.handle(
    'agent:submitPrompt',
    async (_event: any, payload: { prompt: string; sessionId?: string }) => {
      const win = getMainWindow();
      const result = await globalResearchEngine.executeInquiry(
        payload.prompt,
        payload.sessionId,
        (delta: string) => {
          if (win && !win.isDestroyed()) {
            win.webContents.send('agent:delta', delta);
          }
        }
      );
      return result;
    }
  );
}
