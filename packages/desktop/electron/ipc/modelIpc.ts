import {
  globalProfileManager,
  GenericModelClient,
  fallbackMockProvider,
  ModelProfile,
  ConnectionTestResult,
} from '@junscience/core';

export function registerModelIpcHandlers(ipcMain: any): void {
  ipcMain.handle('model:getProfiles', async () => {
    return globalProfileManager.listProfiles();
  });

  ipcMain.handle('model:getActiveProfile', async () => {
    return globalProfileManager.getActiveProfile();
  });

  ipcMain.handle('model:saveProfile', async (_event: any, profile: ModelProfile) => {
    return globalProfileManager.saveProfile(profile);
  });

  ipcMain.handle('model:deleteProfile', async (_event: any, id: string) => {
    return globalProfileManager.deleteProfile(id);
  });

  ipcMain.handle('model:setActiveProfile', async (_event: any, id: string) => {
    return globalProfileManager.setActiveProfile(id);
  });

  ipcMain.handle('model:testConnection', async (_event: any, profile: ModelProfile): Promise<ConnectionTestResult> => {
    if (!profile || !profile.baseUrl || !profile.model) {
      return fallbackMockProvider.testConnection();
    }
    const client = new GenericModelClient(profile);
    return client.testConnection();
  });
}
