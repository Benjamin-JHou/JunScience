import { contextBridge, ipcRenderer } from 'electron';
import { ModelProfile, ConnectionTestResult, RuntimeEvent, RuntimeSession } from '@junscience/core';

const api = {
  model: {
    getProfiles: (): Promise<ModelProfile[]> => ipcRenderer.invoke('model:getProfiles'),
    getActiveProfile: (): Promise<ModelProfile | undefined> => ipcRenderer.invoke('model:getActiveProfile'),
    saveProfile: (profile: ModelProfile): Promise<{ success: boolean; profile?: ModelProfile; errors?: string[] }> =>
      ipcRenderer.invoke('model:saveProfile', profile),
    deleteProfile: (id: string): Promise<boolean> => ipcRenderer.invoke('model:deleteProfile', id),
    setActiveProfile: (id: string): Promise<boolean> => ipcRenderer.invoke('model:setActiveProfile', id),
    testConnection: (profile: ModelProfile): Promise<ConnectionTestResult> =>
      ipcRenderer.invoke('model:testConnection', profile),
  },
  agent: {
    submitPrompt: (prompt: string, sessionId?: string): Promise<{ session: RuntimeSession; turn: any }> =>
      ipcRenderer.invoke('agent:submitPrompt', { prompt, sessionId }),
    onEvent: (callback: (event: RuntimeEvent) => void): (() => void) => {
      const handler = (_e: any, event: RuntimeEvent) => callback(event);
      ipcRenderer.on('agent:event', handler);
      return () => ipcRenderer.removeListener('agent:event', handler);
    },
    onDelta: (callback: (delta: string) => void): (() => void) => {
      const handler = (_e: any, delta: string) => callback(delta);
      ipcRenderer.on('agent:delta', handler);
      return () => ipcRenderer.removeListener('agent:delta', handler);
    },
  },
  session: {
    list: (): Promise<RuntimeSession[]> => ipcRenderer.invoke('session:list'),
    get: (id: string): Promise<RuntimeSession | undefined> => ipcRenderer.invoke('session:get', id),
    create: (title: string, agentId?: string): Promise<RuntimeSession> =>
      ipcRenderer.invoke('session:create', { title, agentId }),
  },
};

contextBridge.exposeInMainWorld('junscience', api);

export type JunScienceDesktopAPI = typeof api;
