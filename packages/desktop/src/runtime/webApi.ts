import type { JunScienceDesktopAPI } from '../../electron/preload';
import type { RuntimeEvent } from '@junscience/core';

type RuntimeListener = (event: RuntimeEvent) => void;
type DeltaListener = (delta: string) => void;

const runtimeListeners = new Set<RuntimeListener>();
const deltaListeners = new Set<DeltaListener>();
let eventSource: EventSource | undefined;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message = payload && typeof payload.error === 'string' ? payload.error : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
}

function ensureEventStream(): void {
  if (eventSource || (runtimeListeners.size === 0 && deltaListeners.size === 0)) return;

  eventSource = new EventSource('/api/events');
  eventSource.addEventListener('runtime', (message) => {
    const event = JSON.parse((message as MessageEvent).data) as RuntimeEvent;
    runtimeListeners.forEach((listener) => listener(event));
  });
  eventSource.addEventListener('delta', (message) => {
    const delta = JSON.parse((message as MessageEvent).data) as string;
    deltaListeners.forEach((listener) => listener(delta));
  });
}

function releaseEventStream(): void {
  if (runtimeListeners.size > 0 || deltaListeners.size > 0) return;
  eventSource?.close();
  eventSource = undefined;
}

const webApi: JunScienceDesktopAPI = {
  model: {
    getProfiles: () => request('/api/model/profiles'),
    getActiveProfile: () => request('/api/model/active'),
    saveProfile: (profile) =>
      request('/api/model/profiles', { method: 'POST', body: JSON.stringify(profile) }),
    deleteProfile: (id) =>
      request(`/api/model/profiles/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    setActiveProfile: (id) =>
      request('/api/model/active', { method: 'POST', body: JSON.stringify({ id }) }),
    testConnection: (profile) =>
      request('/api/model/test', { method: 'POST', body: JSON.stringify(profile) }),
  },
  agent: {
    submitPrompt: (prompt, sessionId) =>
      request('/api/agent/inquiries', {
        method: 'POST',
        body: JSON.stringify({ prompt, sessionId }),
      }),
    onEvent: (callback) => {
      runtimeListeners.add(callback);
      ensureEventStream();
      return () => {
        runtimeListeners.delete(callback);
        releaseEventStream();
      };
    },
    onDelta: (callback) => {
      deltaListeners.add(callback);
      ensureEventStream();
      return () => {
        deltaListeners.delete(callback);
        releaseEventStream();
      };
    },
  },
  session: {
    list: () => request('/api/sessions'),
    get: (id) => request(`/api/sessions/${encodeURIComponent(id)}`),
    create: (title, agentId, profileId, modelName) =>
      request('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ title, agentId, profileId, modelName }),
      }),
    delete: (id) => request(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    rename: (id, title) =>
      request(`/api/sessions/${encodeURIComponent(id)}/rename`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      }),
    export: (id) => request(`/api/sessions/${encodeURIComponent(id)}/export`),
  },
};

// Electron preload owns this namespace in the native app. A regular browser gets
// the same contract through a loopback-only HTTP/SSE bridge.
if (!window.junscience) {
  window.junscience = webApi;
}
