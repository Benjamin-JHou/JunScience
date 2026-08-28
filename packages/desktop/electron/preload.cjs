const { contextBridge, ipcRenderer } = require('electron');

const api = {
  model: {
    getProfiles: () => ipcRenderer.invoke('model:getProfiles'),
    getActiveProfile: () => ipcRenderer.invoke('model:getActiveProfile'),
    saveProfile: (profile) => ipcRenderer.invoke('model:saveProfile', profile),
    deleteProfile: (id) => ipcRenderer.invoke('model:deleteProfile', id),
    setActiveProfile: (id) => ipcRenderer.invoke('model:setActiveProfile', id),
    testConnection: (profile) => ipcRenderer.invoke('model:testConnection', profile),
  },
  agent: {
    submitPrompt: (prompt, sessionId) => ipcRenderer.invoke('agent:submitPrompt', { prompt, sessionId }),
    onEvent: (callback) => {
      const handler = (_e, event) => callback(event);
      ipcRenderer.on('agent:event', handler);
      return () => ipcRenderer.removeListener('agent:event', handler);
    },
    onDelta: (callback) => {
      const handler = (_e, delta) => callback(delta);
      ipcRenderer.on('agent:delta', handler);
      return () => ipcRenderer.removeListener('agent:delta', handler);
    },
  },
  session: {
    list: () => ipcRenderer.invoke('session:list'),
    get: (id) => ipcRenderer.invoke('session:get', id),
    create: (title, agentId) => ipcRenderer.invoke('session:create', { title, agentId }),
  },
};

contextBridge.exposeInMainWorld('junscience', api);
