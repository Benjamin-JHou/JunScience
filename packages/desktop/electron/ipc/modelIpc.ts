import {
  globalProfileManager,
  GenericModelClient,
  fallbackMockProvider,
  ModelProfile,
  ConnectionTestResult,
} from '@junscience/core';

function sanitizeProfile(profile: ModelProfile | undefined): ModelProfile | undefined {
  return profile ? { ...profile, apiKey: profile.apiKey ? '••••••••' : '' } : undefined;
}

function profileWithStoredSecret(profile: ModelProfile): ModelProfile {
  if (profile.apiKey && profile.apiKey !== '••••••••') return profile;
  const stored = profile.id ? globalProfileManager.getProfile(profile.id) : undefined;
  return stored?.apiKey ? { ...profile, apiKey: stored.apiKey } : profile;
}

export function registerModelIpcHandlers(ipcMain: any): void {
  ipcMain.handle('model:getProfiles', async () => {
    return globalProfileManager.listProfiles().map((p) => sanitizeProfile(p)!);
  });

  ipcMain.handle('model:getActiveProfile', async () => {
    return sanitizeProfile(globalProfileManager.getActiveProfile());
  });

  ipcMain.handle('model:saveProfile', async (_event: any, profile: ModelProfile) => {
    const fullProfile = profileWithStoredSecret(profile);
    const result = globalProfileManager.saveProfile(fullProfile);
    return {
      ...result,
      profile: sanitizeProfile(result.profile),
    };
  });

  ipcMain.handle('model:deleteProfile', async (_event: any, id: string) => {
    return globalProfileManager.deleteProfile(id);
  });

  ipcMain.handle('model:setActiveProfile', async (_event: any, id: string) => {
    return globalProfileManager.setActiveProfile(id);
  });

  ipcMain.handle('model:testConnection', async (_event: any, profile: ModelProfile): Promise<ConnectionTestResult> => {
    const fullProfile = profileWithStoredSecret(profile);
    if (!fullProfile || !fullProfile.baseUrl || !fullProfile.model) {
      return fallbackMockProvider.testConnection();
    }
    const client = new GenericModelClient(fullProfile);
    return client.testConnection();
  });
}
