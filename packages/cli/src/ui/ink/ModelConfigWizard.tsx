import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import {
  globalProfileManager,
  ModelProfile,
  GenericModelClient,
} from '@junscience/core';

interface ModelConfigWizardProps {
  onClose: () => void;
  onProfileChanged: (profile: ModelProfile | null) => void;
}

type WizardView = 'list' | 'test' | 'form';
type FormField = 'model' | 'protocol' | 'baseUrl' | 'apiKey' | 'name';

export function ModelConfigWizard({ onClose, onProfileChanged }: ModelConfigWizardProps) {
  const [view, setView] = useState<WizardView>('list');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Form state for creating new profile
  const [formStep, setFormStep] = useState<FormField>('model');
  const [formData, setFormData] = useState({
    model: 'deepseek-chat',
    protocol: 'openai-compatible' as 'openai-compatible' | 'anthropic-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    name: 'Custom Model',
  });
  const [inputValue, setInputValue] = useState('');

  // ESC key to go back / exit wizard
  useInput((input, key) => {
    if (key.escape) {
      if (view === 'list') {
        onClose();
      } else {
        setView('list');
        setTestResult(null);
      }
    }
  });

  const profiles = globalProfileManager.listProfiles();
  const activeProfile = globalProfileManager.getActiveProfile();

  // Test active model connection
  const handleTestConnection = async () => {
    setView('test');
    setTestLoading(true);
    setTestResult(null);

    const active = globalProfileManager.getActiveProfile();
    if (!active) {
      setTestLoading(false);
      setTestResult('Currently in Demo Mode (Mock). Mock provider is always ready and functional.');
      return;
    }

    try {
      const client = new GenericModelClient(active);
      const start = Date.now();
      const testRes = await client.testConnection();
      const elapsed = Date.now() - start;

      if (testRes.success) {
        setTestResult(`✔ Connection Successful! Latency: ${elapsed}ms (${active.protocol} at ${active.baseUrl})`);
      } else {
        setTestResult(`✖ Connection Failed: ${testRes.message || 'Unable to reach endpoint'}`);
      }
    } catch (err: any) {
      setTestResult(`✖ Error: ${err?.message || String(err)}`);
    } finally {
      setTestLoading(false);
    }
  };

  // Profile List Menu Items
  const menuItems = [
    ...profiles.map((p) => {
      const isActive = activeProfile?.id === p.id;
      const marker = isActive ? '● [ACTIVE]' : '○ [SWITCH]';
      return {
        label: `${marker} ${p.name} (${p.model}) [${p.protocol}]`,
        value: `switch:${p.id}`,
      };
    }),
    { label: '➕ [Add / Configure New Model Profile]', value: 'action:add' },
    { label: '⚡ [Test Active Model Connection]', value: 'action:test' },
    { label: '✕ [Back to Chat / Exit Wizard (Esc)]', value: 'action:close' },
  ];

  const handleMenuSelect = (item: { value: string }) => {
    if (item.value === 'action:close') {
      onClose();
    } else if (item.value === 'action:add') {
      setView('form');
      setFormStep('model');
      setInputValue('deepseek-chat');
    } else if (item.value === 'action:test') {
      handleTestConnection();
    } else if (item.value.startsWith('switch:')) {
      const profileId = item.value.slice(7);
      globalProfileManager.setActiveProfile(profileId);
      const updated = globalProfileManager.getActiveProfile();
      onProfileChanged(updated || null);
      onClose();
    }
  };

  // Form step transitions
  const handleFormSubmit = () => {
    if (formStep === 'model') {
      setFormData((prev) => ({ ...prev, model: inputValue.trim() || 'deepseek-chat' }));
      setFormStep('protocol');
    } else if (formStep === 'baseUrl') {
      setFormData((prev) => ({ ...prev, baseUrl: inputValue.trim() || 'https://api.deepseek.com/v1' }));
      setFormStep('apiKey');
      setInputValue('');
    } else if (formStep === 'apiKey') {
      setFormData((prev) => ({ ...prev, apiKey: inputValue.trim() }));
      setFormStep('name');
      setInputValue(`${formData.model} Profile`);
    } else if (formStep === 'name') {
      // Save profile
      const id = `profile-${Date.now()}`;
      const profileToSave: ModelProfile = {
        id,
        name: inputValue.trim() || `${formData.model} Profile`,
        protocol: formData.protocol,
        baseUrl: formData.baseUrl,
        model: formData.model,
        apiKey: formData.apiKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = globalProfileManager.saveProfile(profileToSave);
      if (res.success) {
        globalProfileManager.setActiveProfile(id);
        onProfileChanged(profileToSave);
        onClose();
      } else {
        setView('list');
      }
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color="cyan">
          ⚙ JunScience Model Profile & Configuration Wizard
        </Text>
        <Text color="gray">[Esc to Return]</Text>
      </Box>

      {/* VIEW: PROFILE LIST */}
      {view === 'list' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="dim">
              Current Active Endpoint:{' '}
              {activeProfile ? (
                <Text color="green" bold>
                  {activeProfile.name} ({activeProfile.model}) - {activeProfile.baseUrl}
                </Text>
              ) : (
                <Text color="yellow" bold>
                  Demo Mode (Mock Scientific Provider)
                </Text>
              )}
            </Text>
          </Box>

          <Text bold color="white" underline>
            Select a Profile or Action:
          </Text>
          <Box marginTop={1}>
            <SelectInput items={menuItems} onSelect={handleMenuSelect} />
          </Box>
        </Box>
      )}

      {/* VIEW: CONNECTION TEST */}
      {view === 'test' && (
        <Box flexDirection="column">
          <Text bold color="yellow">
            Testing Connection to Endpoint...
          </Text>
          {testLoading && (
            <Box marginTop={1}>
              <Text color="cyan">Probing LLM protocol endpoint...</Text>
            </Box>
          )}
          {testResult && (
            <Box marginTop={1} flexDirection="column">
              <Text color={testResult.startsWith('✔') ? 'green' : 'red'} bold>
                {testResult}
              </Text>
              <Box marginTop={1}>
                <SelectInput
                  items={[{ label: '← Back to Profile Menu', value: 'back' }]}
                  onSelect={() => setView('list')}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* VIEW: ADD PROFILE FORM */}
      {view === 'form' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color="magenta" bold>
              New Model Profile Wizard (Step: {formStep.toUpperCase()})
            </Text>
          </Box>

          {formStep === 'model' && (
            <Box flexDirection="column">
              <Text color="white">Enter Model Identifier (e.g. deepseek-chat, gpt-4o, claude-3-5-sonnet):</Text>
              <Box marginTop={1}>
                <Text color="cyan" bold>&gt; </Text>
                <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleFormSubmit} />
              </Box>
            </Box>
          )}

          {formStep === 'protocol' && (
            <Box flexDirection="column">
              <Text color="white">Select Protocol Architecture:</Text>
              <Box marginTop={1}>
                <SelectInput
                  items={[
                    { label: 'openai-compatible (DeepSeek, OpenAI, vLLM, Ollama)', value: 'openai-compatible' },
                    { label: 'anthropic-compatible (Claude Code, Anthropic API)', value: 'anthropic-compatible' },
                  ]}
                  onSelect={(item) => {
                    setFormData((prev) => ({ ...prev, protocol: item.value as any }));
                    setFormStep('baseUrl');
                    setInputValue(
                      item.value === 'openai-compatible'
                        ? 'https://api.deepseek.com/v1'
                        : 'https://api.anthropic.com/v1'
                    );
                  }}
                />
              </Box>
            </Box>
          )}

          {formStep === 'baseUrl' && (
            <Box flexDirection="column">
              <Text color="white">Enter Base URL Endpoint:</Text>
              <Box marginTop={1}>
                <Text color="cyan" bold>&gt; </Text>
                <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleFormSubmit} />
              </Box>
            </Box>
          )}

          {formStep === 'apiKey' && (
            <Box flexDirection="column">
              <Text color="white">Enter API Key (will be encrypted locally in AES-256 vault):</Text>
              <Box marginTop={1}>
                <Text color="cyan" bold>&gt; </Text>
                <TextInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleFormSubmit}
                  mask="*"
                />
              </Box>
            </Box>
          )}

          {formStep === 'name' && (
            <Box flexDirection="column">
              <Text color="white">Friendly Profile Name:</Text>
              <Box marginTop={1}>
                <Text color="cyan" bold>&gt; </Text>
                <TextInput value={inputValue} onChange={setInputValue} onSubmit={handleFormSubmit} />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
