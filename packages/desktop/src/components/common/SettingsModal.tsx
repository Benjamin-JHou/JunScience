import React, { useState, useEffect } from 'react';
import {
  X,
  Moon,
  Sun,
  Terminal,
  Monitor,
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
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavContext';
import { CliTheme, ViewMode } from '../../types/theme';
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

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen } = useNav();
  const {
    desktopTheme,
    setDesktopTheme,
    cliTheme,
    setCliTheme,
    viewMode,
    setViewMode,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'model' | 'appearance' | 'shortcuts'>('model');

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

  // Load profiles from IPC on open
  useEffect(() => {
    if (!isSettingsOpen) return;
    loadProfiles();
  }, [isSettingsOpen]);

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
      // Web preview fallback
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
      setSaveMessage('Profile saved (Local state)');
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
      }
    }
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
      <div className="w-full max-w-[620px] rounded-2xl bg-bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-[17px] font-bold text-text-primary">JunScience Settings</h3>
            <p className="text-xs text-text-muted mt-0.5">Model APIs, storage vault & workstation appearance</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-bg-elevated/40 px-6 pt-2">
          {[
            { id: 'model', label: 'Model & API', icon: Cpu },
            { id: 'appearance', label: 'Appearance & UI', icon: Monitor },
            { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
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
                      <option value="openai-compatible">OpenAI-Compatible (/chat/completions)</option>
                      <option value="anthropic-compatible">Anthropic-Compatible (/v1/messages)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    API Base URL
                  </label>
                  <input
                    type="text"
                    value={editingProfile.baseUrl}
                    onChange={(e) => setEditingProfile({ ...editingProfile, baseUrl: e.target.value })}
                    placeholder="e.g. https://api.deepseek.com/v1 or http://localhost:11434/v1"
                    className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={editingProfile.model}
                      onChange={(e) => setEditingProfile({ ...editingProfile, model: e.target.value })}
                      placeholder="e.g. deepseek-chat, gpt-4o, claude-3-5-sonnet"
                      className="w-full bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={editingProfile.apiKey || ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, apiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full bg-bg-surface border border-border rounded-lg pl-3 pr-8 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2.5 text-text-muted hover:text-text-primary"
                      >
                        {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Vault Notice */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/5 border border-accent/20 text-[11px] text-text-muted">
                  <Shield size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    API keys are encrypted locally using AES-256-GCM and stored in{' '}
                    <code className="text-accent">~/.junscience/credentials.enc</code> with user-only (0600) permissions.
                  </span>
                </div>
              </div>

              {/* Action Buttons & Live Probe Feedback */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus.testing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-elevated hover:bg-bg-hover text-text-primary border border-border text-xs font-medium transition-all disabled:opacity-50"
                  >
                    <Activity size={14} className={testStatus.testing ? 'animate-spin text-accent' : 'text-accent'} />
                    <span>{testStatus.testing ? 'Probing Endpoint...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-bg-base text-xs font-bold transition-all shadow-md"
                  >
                    <Check size={14} />
                    <span>Save Profile</span>
                  </button>
                </div>

                {/* Test Result Message */}
                {testStatus.result && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      testStatus.result.success
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{testStatus.result.success ? '✓ Endpoint Connected' : '✗ Connection Failed'}</span>
                      <span className="text-[11px] opacity-80">{testStatus.result.latencyMs}ms</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-90 break-words">
                      {testStatus.result.message || testStatus.result.error}
                    </p>
                  </div>
                )}

                {saveMessage && (
                  <p className="text-xs text-center font-medium text-accent animate-in fade-in">
                    {saveMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE & UI */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                  Operating Environment Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'desktop', label: 'Desktop UI', icon: Monitor },
                    { id: 'cli', label: 'Terminal CLI', icon: Terminal },
                    { id: 'showcase', label: 'Theme Showcase', icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = viewMode === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setViewMode(item.id as ViewMode)}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/15 text-accent shadow-sm'
                            : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                        }`}
                      >
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                  Desktop Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDesktopTheme('dark')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                      desktopTheme === 'dark'
                        ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30'
                        : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon size={16} className="text-accent" />
                      <div className="text-left">
                        <span className="block font-semibold">Desktop Dark</span>
                        <span className="text-[11px] text-text-muted">Futuristic Science</span>
                      </div>
                    </div>
                    {desktopTheme === 'dark' && <Check size={15} className="text-accent" />}
                  </button>

                  <button
                    onClick={() => setDesktopTheme('light')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                      desktopTheme === 'light'
                        ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30'
                        : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun size={16} className="text-accent" />
                      <div className="text-left">
                        <span className="block font-semibold">Desktop Light</span>
                        <span className="text-[11px] text-text-muted">Paper Precision</span>
                      </div>
                    </div>
                    {desktopTheme === 'light' && <Check size={15} className="text-accent" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                  CLI Terminal Theme
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'green', label: 'CLI Green', desc: 'Classic Phosphor', color: '#10b981' },
                    { id: 'blue', label: 'CLI Blue', desc: 'Cyber Navy', color: '#38bdf8' },
                    { id: 'purple', label: 'CLI Purple', desc: 'Deep Matrix', color: '#c084fc' },
                    { id: 'amber', label: 'CLI Amber', desc: 'Vintage CRT', color: '#f59e0b' },
                  ].map((item) => {
                    const isSelected = cliTheme === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCliTheme(item.id as CliTheme)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/10 text-text-primary ring-1 ring-accent/30'
                            : 'border-border bg-bg-elevated hover:bg-bg-hover text-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="text-left">
                            <span className="block font-semibold">{item.label}</span>
                            <span className="text-[10px] text-text-muted">{item.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check size={13} className="text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Workstation Hotkeys
              </label>
              {[
                { key: '⌘ K / Ctrl K', action: 'Open Global Command Palette' },
                { key: '⌘ , / Ctrl ,', action: 'Open Settings & Model Config' },
                { key: '⌘ T / Ctrl T', action: 'Toggle Desktop / CLI View' },
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
