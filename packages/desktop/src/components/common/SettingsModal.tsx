import React, { useState, useEffect } from 'react';
import {
  X,
  Moon,
  Sun,
  Keyboard,
  Check,
  Server,
  Key,
  Cpu,
  Plus,
  Trash2,
  Activity,
  Shield,
  Eye,
  EyeOff,
  User,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';
import { useUser } from '../../context/UserContext';
import type { ModelProfile, ConnectionTestResult, ProtocolType } from '@junscience/core';

function createDefaultProfile(override?: Partial<ModelProfile>): ModelProfile {
  return {
    id: override?.id || `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: override?.name || 'Primary Model',
    protocol: override?.protocol || 'openai-compatible',
    baseUrl: override?.baseUrl || 'https://api.openai.com/v1',
    model: override?.model || 'gpt-4o',
    contextWindow: override?.contextWindow || 128000,
    temperature: override?.temperature ?? 0.2,
    maxTokens: override?.maxTokens || 4096,
    streaming: override?.streaming ?? true,
    toolCalling: override?.toolCalling ?? true,
    headers: override?.headers || {},
    apiKey: override?.apiKey || '',
    isDefault: override?.isDefault ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const LOCAL_STORAGE_PROFILES_KEY = 'junscience_model_profiles_v1';
const LOCAL_STORAGE_ACTIVE_PROFILE_KEY = 'junscience_active_profile_v1';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen } = useNav();
  const { user, updateUser } = useUser();
  const {
    desktopTheme,
    setDesktopTheme,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'model' | 'guardrails' | 'appearance' | 'shortcuts'>('model');

  // Account editing state
  const [userNameInput, setUserNameInput] = useState(user.name);
  const [userPlanInput, setUserPlanInput] = useState(user.plan);
  const [userInstitutionInput, setUserInstitutionInput] = useState(user.institution || '');
  const [userSpecialtyInput, setUserSpecialtyInput] = useState(user.specialty || '');
  const [accountSaveMsg, setAccountSaveMsg] = useState('');

  // Model Profiles State
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [editingProfile, setEditingProfile] = useState<ModelProfile>(createDefaultProfile());
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    result?: ConnectionTestResult;
  }>({ testing: false });
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Sync account form when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setUserNameInput(user.name);
      setUserPlanInput(user.plan);
      setUserInstitutionInput(user.institution || '');
      setUserSpecialtyInput(user.specialty || '');
      setAccountSaveMsg('');
      loadProfiles();
    }
  }, [isSettingsOpen, user]);

  const loadProfiles = async () => {
    if (window.junscience?.model) {
      try {
        const list = await window.junscience.model.getProfiles();
        const active = await window.junscience.model.getActiveProfile();
        setProfiles(list);
        if (list.length > 0) {
          const current = active || list[0];
          setSelectedProfileId(current.id);
          setEditingProfile({ ...current });
        } else {
          const fresh = createDefaultProfile({ name: 'Primary Model' });
          setEditingProfile(fresh);
          setSelectedProfileId(fresh.id);
        }
      } catch (err) {
        console.error('Failed to load profiles over IPC:', err);
      }
    } else {
      // Web preview with localStorage persistence
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
        const savedActive = localStorage.getItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProfiles(parsed);
            const active = parsed.find((p) => p.id === savedActive) || parsed[0];
            setSelectedProfileId(active.id);
            setEditingProfile(active);
            return;
          }
        }
      } catch {}

      const defaultProf = createDefaultProfile({
        name: 'Demo Mode (Mock)',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        apiKey: '',
      });
      setProfiles([defaultProf]);
      setSelectedProfileId(defaultProf.id);
      setEditingProfile(defaultProf);
    }
  };

  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    const target = profiles.find((p) => p.id === id);
    if (target) {
      setEditingProfile({ ...target });
      setTestStatus({ testing: false });
      setSaveMessage('');
    }
  };

  const handleCreateNewProfile = () => {
    const newProf = createDefaultProfile({
      id: `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `Custom Model ${profiles.length + 1}`,
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      protocol: 'openai-compatible',
      apiKey: '',
      isDefault: false,
    });
    setEditingProfile(newProf);
    setSelectedProfileId(newProf.id);
    setTestStatus({ testing: false });
    setSaveMessage('');
  };

  const handleSaveProfile = async () => {
    setSaveMessage('');
    if (window.junscience?.model) {
      const res = await window.junscience.model.saveProfile(editingProfile);
      if (res.success && res.profile) {
        setSaveMessage('Profile saved successfully!');
        await loadProfiles();
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(`Error: ${res.errors?.join(', ')}`);
      }
    } else {
      // LocalStorage persistence in web mode
      const updatedList = profiles.some((p) => p.id === editingProfile.id)
        ? profiles.map((p) => (p.id === editingProfile.id ? editingProfile : p))
        : [...profiles, editingProfile];
      setProfiles(updatedList);
      try {
        // Strip out plaintext API keys before persisting to browser localStorage
        const sanitizedStorageList = updatedList.map((p) => ({
          ...p,
          apiKey: p.apiKey ? '••••••••' : '',
        }));
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(sanitizedStorageList));
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY, editingProfile.id);
      } catch {}
      setSaveMessage('Profile saved! (API keys kept in secure memory, not persisted to localStorage)');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleDeleteProfile = async () => {
    if (profiles.length <= 1) {
      alert('Cannot delete the only remaining profile.');
      return;
    }
    if (confirm(`Delete profile "${editingProfile.name}"?`)) {
      if (window.junscience?.model) {
        await window.junscience.model.deleteProfile(editingProfile.id);
        await loadProfiles();
      } else {
        const nextList = profiles.filter((p) => p.id !== editingProfile.id);
        setProfiles(nextList);
        setSelectedProfileId(nextList[0].id);
        setEditingProfile(nextList[0]);
        try {
          const sanitizedStorageList = nextList.map((p) => ({
            ...p,
            apiKey: p.apiKey ? '••••••••' : '',
          }));
          localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(sanitizedStorageList));
          localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE_KEY, nextList[0].id);
        } catch {}
      }
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: userNameInput.trim() || 'Researcher',
      plan: userPlanInput.trim() || 'Community Edition',
      institution: userInstitutionInput.trim(),
      specialty: userSpecialtyInput.trim(),
    });
    setAccountSaveMsg('User profile updated successfully!');
    setTimeout(() => setAccountSaveMsg(''), 3000);
  };

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });
    setSaveMessage('');
    if (window.junscience?.model) {
      try {
        const result = await window.junscience.model.testConnection(editingProfile);
        setTestStatus({ testing: false, result });
      } catch (err: any) {
        setTestStatus({
          testing: false,
          result: {
            success: false,
            latencyMs: 0,
            message: 'Probe failed',
            error: err?.message || String(err),
          },
        });
      }
    } else {
      // Simulation for web preview
      setTimeout(() => {
        setTestStatus({
          testing: false,
          result: {
            success: true,
            latencyMs: 42,
            message: 'Simulated connection test passed (Web Preview Mode).',
          },
        });
      }, 500);
    }
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-[640px] rounded-2xl bg-bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-[17px] font-bold text-text-primary">JunScience Settings</h3>
            <p className="text-xs text-text-muted mt-0.5">Researcher account, model APIs, guardrails & appearance</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-bg-elevated/40 px-6 pt-2 overflow-x-auto">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'model', label: 'Model & API', icon: Cpu },
            { id: 'guardrails', label: 'Guardrail Hooks', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Sun },
            { id: 'shortcuts', label: 'Hotkeys', icon: Keyboard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5 max-h-[540px] overflow-y-auto">
          {/* TAB 0: ACCOUNT & USER PROFILE */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-bg-elevated/60 rounded-xl border border-border">
                <div className="w-14 h-14 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-lg font-bold shadow-inner">
                  {user.avatar || 'RE'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">{user.name}</h4>
                  <p className="text-xs text-text-muted">{user.plan} • {user.institution || 'Individual Workstation'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Researcher / Scientist Name
                  </label>
                  <input
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="e.g. Dr. Alex Vance"
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Workstation Plan / License
                  </label>
                  <input
                    type="text"
                    value={userPlanInput}
                    onChange={(e) => setUserPlanInput(e.target.value)}
                    placeholder="e.g. Academic Pro"
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Institution / Laboratory
                  </label>
                  <input
                    type="text"
                    value={userInstitutionInput}
                    onChange={(e) => setUserInstitutionInput(e.target.value)}
                    placeholder="e.g. Biomedical Institute"
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Primary Scientific Domain
                  </label>
                  <input
                    type="text"
                    value={userSpecialtyInput}
                    onChange={(e) => setUserSpecialtyInput(e.target.value)}
                    placeholder="e.g. Immunology & Oncology"
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                {accountSaveMsg && (
                  <span className="text-xs text-emerald-400 font-medium">{accountSaveMsg}</span>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg text-xs hover:bg-accent/90 transition-colors shadow-xs"
                  >
                    Save Account Profile
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 1: MODEL & API CONFIGURATION */}
          {activeTab === 'model' && (
            <div className="space-y-5">
              {/* Profile Selector */}
              <div className="flex items-center justify-between gap-3 bg-bg-elevated p-3 rounded-xl border border-border">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Active Profile
                  </label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => handleSelectProfile(e.target.value)}
                    className="w-full bg-bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.isDefault ? '(Default)' : ''} — {p.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <button
                    onClick={handleCreateNewProfile}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-accent/15 hover:bg-accent/25 text-accent rounded-lg text-xs font-medium border border-accent/30 transition-colors"
                  >
                    <Plus size={13} />
                    <span>New</span>
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={handleDeleteProfile}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Form Fields */}
              <div className="space-y-3.5 bg-bg-elevated/30 p-4 rounded-xl border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Profile Label
                    </label>
                    <input
                      type="text"
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                      placeholder="e.g. DeepSeek V3 (Production)"
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Protocol
                    </label>
                    <select
                      value={editingProfile.protocol}
                      onChange={(e) =>
                        setEditingProfile({
                          ...editingProfile,
                          protocol: e.target.value as ProtocolType,
                        })
                      }
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="openai-compatible">OpenAI Compatible (Default)</option>
                      <option value="anthropic-compatible">Anthropic Claude</option>
                      <option value="mock">Mock Provider (Air-gapped Sandbox)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                      <Server size={13} className="text-text-muted" />
                      <span>Base URL</span>
                    </label>
                    <input
                      type="text"
                      value={editingProfile.baseUrl}
                      onChange={(e) => setEditingProfile({ ...editingProfile, baseUrl: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={editingProfile.model}
                      onChange={(e) => setEditingProfile({ ...editingProfile, model: e.target.value })}
                      placeholder="gpt-4o, claude-3-7-sonnet, deepseek-chat"
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key size={13} className="text-text-muted" />
                      <span>API Secret Key</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowApiKey((prev) => !prev)}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1"
                    >
                      {showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{showApiKey ? 'Hide' : 'Show'}</span>
                    </button>
                  </label>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={editingProfile.apiKey || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    API keys are protected and never echoed to telemetry or logs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Context Window (tokens)
                    </label>
                    <input
                      type="number"
                      value={editingProfile.contextWindow}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, contextWindow: parseInt(e.target.value) || 128000 })
                      }
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Max Completion Tokens
                    </label>
                    <input
                      type="number"
                      value={editingProfile.maxTokens}
                      onChange={(e) =>
                        setEditingProfile({ ...editingProfile, maxTokens: parseInt(e.target.value) || 4096 })
                      }
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.streaming}
                      onChange={(e) => setEditingProfile({ ...editingProfile, streaming: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-xs text-text-secondary">Enable SSE Streaming</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProfile.toolCalling}
                      onChange={(e) => setEditingProfile({ ...editingProfile, toolCalling: e.target.checked })}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span className="text-xs text-text-secondary">Function / Tool Calling Support</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons & Status */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus.testing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-accent/40 bg-bg-elevated hover:bg-bg-hover text-xs font-medium text-text-primary transition-colors disabled:opacity-50"
                  >
                    <Activity size={13} className={testStatus.testing ? 'animate-spin text-accent' : 'text-accent'} />
                    <span>{testStatus.testing ? 'Probing endpoint...' : 'Test Connection'}</span>
                  </button>
                  {saveMessage && (
                    <span className="text-xs text-emerald-400 font-medium">{saveMessage}</span>
                  )}
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg text-xs hover:bg-accent/90 transition-colors shadow-xs"
                >
                  Save Profile
                </button>
              </div>

              {/* Probe Result Box */}
              {testStatus.result && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    testStatus.result.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>{testStatus.result.success ? 'Probe Succeeded' : 'Probe Failed'}</span>
                    {testStatus.result.latencyMs !== undefined && (
                      <span className="font-mono text-[11px] opacity-80">{testStatus.result.latencyMs}ms</span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">{testStatus.result.message || testStatus.result.error}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GUARDRAIL HOOKS */}
          {activeTab === 'guardrails' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20">
                <h4 className="text-xs font-semibold text-accent mb-1">4 Active Deterministic Guardrails</h4>
                <p className="text-[11px] text-text-muted">
                  Formal lifecycle hooks automatically protect credentials, verify physical numbers, and prevent data leakage.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'secret-redaction', event: 'PreToolUse', desc: 'Masks and blocks API keys and secrets in outbound queries.' },
                  { name: 'evidence-verifier', event: 'PostToolUse', desc: 'Validates physical boundary limits and mathematical consistency.' },
                  { name: 'clinical-data-gate', event: 'PreToolUse', desc: 'Intercepts EHR and DICOM transmissions to air-gapped sandboxes.' },
                  { name: 'evidence-completeness-check', event: 'Stop', desc: 'Ensures all syntheses cite valid Evidence IDs before closing.' },
                ].map((hook, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated/40 border border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-text-primary">{hook.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent/15 text-accent">{hook.event}</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1">{hook.desc}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-xs" title="Active" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WORKSTATION APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDesktopTheme('dark')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      desktopTheme === 'dark'
                        ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30 shadow-xs'
                        : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bg-surface text-accent">
                        <Moon size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block font-semibold text-sm">Desktop Dark</span>
                        <span className="text-[11px] text-text-muted">High-contrast scientific matrix</span>
                      </div>
                    </div>
                    {desktopTheme === 'dark' && <Check size={16} className="text-accent" />}
                  </button>

                  <button
                    onClick={() => setDesktopTheme('light')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      desktopTheme === 'light'
                        ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30 shadow-xs'
                        : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bg-surface text-accent">
                        <Sun size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block font-semibold text-sm">Desktop Light</span>
                        <span className="text-[11px] text-text-muted">Paper precision & journal reading</span>
                      </div>
                    </div>
                    {desktopTheme === 'light' && <Check size={16} className="text-accent" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Workstation Hotkeys
              </label>
              {[
                { key: '⌘ K / Ctrl K', action: 'Open Global Command Palette' },
                { key: '⌘ , / Ctrl ,', action: 'Open Settings & Model Config' },
                { key: '⌘ N / Ctrl N', action: 'Start New Research Session' },
                { key: 'Enter', action: 'Submit Inquiry to Agent' },
                { key: 'Shift + Enter', action: 'Insert Newline in Composer' },
              ].map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-bg-elevated/40 border border-border text-xs"
                >
                  <span className="text-text-secondary">{shortcut.action}</span>
                  <kbd className="px-2 py-1 rounded-md bg-bg-surface border border-border font-mono text-[11px] text-accent">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
